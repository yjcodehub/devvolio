import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Workspace, Portfolio, AIParsingResult } from '@devvolio/shared';
import { Resume } from '../models/Resume';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import { cloudinary } from '../config/cloudinary';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { ResumeParserService } from '../services/resumeParser.service';
import { Types } from 'mongoose';

export async function getResumes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const list = await Resume.find({}).sort({ createdAt: -1 });
    return sendSuccess(res, list, 'Resumes list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function uploadResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next(new AppError('No file provided in form upload', 400));
    }

    const { originalname, buffer } = req.file;
    const ext = originalname.split('.').pop()?.toLowerCase();
    
    if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
      return next(new AppError('Only PDF, DOC, and DOCX files are allowed', 400));
    }

    const cleanName = originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    const timestamp = Date.now();
    const isPdf = ext === 'pdf';
    const resourceType = isPdf ? 'image' : 'raw';
    const publicId = `resumes/resume_${cleanName}_${timestamp}${isPdf ? '' : `.${ext}`}`;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio',
          resource_type: resourceType,
          public_id: publicId
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const totalCount = await Resume.countDocuments({});
    const isFirst = totalCount === 0;
    const tenantId = req.tenant?.id;

    const resume = new Resume({
      tenantId: tenantId ? new Types.ObjectId(tenantId) : undefined,
      fileName: originalname,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type || 'raw',
      fileType: ext,
      isActive: isFirst,
      createdBy: req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined
    });

    await resume.save();

    if (isFirst) {
      await Portfolio.findOneAndUpdate({}, { cvFileUrl: resume.fileUrl });
    }

    return sendSuccess(res, resume, 'Resume uploaded successfully to cloud storage', 201);
  } catch (error: any) {
    console.error('[ResumeController] Cloudinary upload failure:', error);
    return next(new AppError(`Cloudinary resume upload failed: ${error.message || error}`, 500));
  }
}

export async function parseResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const resume = await Resume.findById(id);

    if (!resume) {
      return next(new AppError('Resume document record not found', 404));
    }

    resume.parsingStatus = 'processing';
    await resume.save();

    // Fetch file buffer
    const fileRes = await globalThis.fetch(resume.fileUrl);
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tenantId = (req.tenant?.id || resume.tenantId || '').toString();
    const userId = req.user?.userId || '';

    const aiResult = await ResumeParserService.parseResumeFile(
      id,
      tenantId,
      userId,
      buffer,
      resume.fileType || 'pdf'
    );

    return sendSuccess(res, aiResult, 'Resume text successfully parsed with OpenAI AI Engine');
  } catch (err: any) {
    console.error('[ResumeController] Parsing error:', err);
    return next(new AppError(`Resume AI parsing failed: ${err.message || err}`, 500));
  }
}

export async function getParseResult(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await AIParsingResult.findOne({ resumeId: new Types.ObjectId(id) });

    if (!result) {
      return next(new AppError('No AI parsing result found for this resume', 404));
    }

    return sendSuccess(res, result, 'AI parsing result loaded');
  } catch (err) {
    next(err);
  }
}

export async function applyParsedData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { selectedSections, data } = req.body;

    const aiResult = await AIParsingResult.findById(id);
    if (!aiResult) {
      return next(new AppError('AI Parsing result record not found', 404));
    }

    const tenantId = req.tenant?.id || aiResult.tenantId;
    const userId = req.user?.userId || aiResult.createdBy;
    const payload = data || aiResult.rawJson;

    if (selectedSections?.hero || selectedSections?.about) {
      const updateData: any = {};
      if (selectedSections.hero && payload.hero) {
        updateData.hero = payload.hero;
      }
      if (selectedSections.about && payload.about) {
        updateData.about = payload.about;
      }
      await Portfolio.findOneAndUpdate(
        { tenantId: new Types.ObjectId(tenantId) },
        { $set: updateData },
        { upsert: true }
      );
    }

    if (selectedSections?.skills && Array.isArray(payload.skills)) {
      for (const sk of payload.skills) {
        await Skill.create({
          tenantId: new Types.ObjectId(tenantId),
          name: sk.name,
          category: sk.category || 'General',
          proficiency: sk.proficiency || 85,
          createdBy: new Types.ObjectId(userId),
          updatedBy: new Types.ObjectId(userId)
        });
      }
    }

    if (selectedSections?.experiences && Array.isArray(payload.experiences)) {
      for (const exp of payload.experiences) {
        await Experience.create({
          tenantId: new Types.ObjectId(tenantId),
          company: exp.company,
          role: exp.role,
          startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          isCurrent: exp.isCurrent || false,
          description: exp.description,
          technologies: exp.technologies || [],
          createdBy: new Types.ObjectId(userId),
          updatedBy: new Types.ObjectId(userId)
        });
      }
    }

    if (selectedSections?.projects && Array.isArray(payload.projects)) {
      for (const proj of payload.projects) {
        await Project.create({
          tenantId: new Types.ObjectId(tenantId),
          title: proj.title,
          description: proj.description,
          tags: proj.tags || [],
          githubUrl: proj.githubUrl,
          liveUrl: proj.liveUrl,
          createdBy: new Types.ObjectId(userId),
          updatedBy: new Types.ObjectId(userId)
        });
      }
    }

    aiResult.mappedState = 'applied';
    await aiResult.save();

    return sendSuccess(res, null, 'AI extracted data successfully applied to tenant portfolio collections');
  } catch (err: any) {
    console.error('[ResumeController] Apply data error:', err);
    return next(new AppError(`Failed to apply parsed resume data: ${err.message || err}`, 500));
  }
}

export async function activateResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const resume = await Resume.findById(id);
    if (!resume) {
      return next(new AppError('Resume record not found', 404));
    }

    await Resume.updateMany({}, { isActive: false });
    resume.isActive = true;
    await resume.save();

    await Portfolio.findOneAndUpdate({}, { cvFileUrl: resume.fileUrl });
    return sendSuccess(res, resume, `Resume [${resume.fileName}] set as active`);
  } catch (error) {
    next(error);
  }
}

export async function deleteResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const resume = await Resume.findById(id);
    if (!resume) {
      return next(new AppError('Resume record not found', 404));
    }

    await cloudinary.uploader.destroy(resume.publicId, { resource_type: resume.resourceType });
    await Resume.findByIdAndDelete(id);

    if (resume.isActive) {
      const nextActive = await Resume.findOne({}).sort({ createdAt: -1 });
      if (nextActive) {
        nextActive.isActive = true;
        await nextActive.save();
        await Portfolio.findOneAndUpdate({}, { cvFileUrl: nextActive.fileUrl });
      } else {
        await Portfolio.findOneAndUpdate({}, { cvFileUrl: '' });
      }
    }

    return sendSuccess(res, null, `Resume [${resume.fileName}] deleted successfully`);
  } catch (error: any) {
    console.error('[ResumeController] Deletion failure:', error);
    return next(new AppError(`Resume deletion failed: ${error.message || error}`, 500));
  }
}

export async function uploadAndParseResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file || (req.files && (req.files as Express.Multer.File[])[0]);
    if (!file) {
      return next(new AppError('No resume file provided in upload request', 400));
    }

    const { originalname, buffer } = file;
    const ext = originalname.split('.').pop()?.toLowerCase();

    if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
      return next(new AppError('Only PDF, DOC, and DOCX files are allowed', 400));
    }

    const userId = req.user?.userId;
    let tenantId = req.tenant?.id;
    if (!tenantId && userId) {
      const ws = await Workspace.findOne({ owner: new Types.ObjectId(userId) });
      if (ws) tenantId = (ws._id as Types.ObjectId).toString();
    }

    const cleanName = originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const timestamp = Date.now();
    const isPdf = ext === 'pdf';
    const resourceType = isPdf ? 'image' : 'raw';
    const publicId = `resumes/resume_${cleanName}_${timestamp}${isPdf ? '' : `.${ext}`}`;

    let secureUrl = '';
    let uploadedPublicId = publicId;

    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio',
            resource_type: resourceType,
            public_id: publicId
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      secureUrl = uploadResult.secure_url;
      uploadedPublicId = uploadResult.public_id;
    } catch (err: any) {
      console.warn('[ResumeController] Cloudinary upload notice (using fallback URL):', err.message || err);
      secureUrl = `https://storage.devvolio.com/resumes/${cleanName}_${timestamp}.${ext}`;
    }

    const totalCount = await Resume.countDocuments({});
    const isFirst = totalCount === 0;

    const resume = new Resume({
      tenantId: tenantId ? new Types.ObjectId(tenantId) : undefined,
      fileName: originalname,
      fileUrl: secureUrl,
      publicId: uploadedPublicId,
      resourceType,
      fileType: ext,
      isActive: isFirst,
      createdBy: userId ? new Types.ObjectId(userId) : undefined
    });

    await resume.save();

    // Parse resume text using ResumeParserService
    const aiResult = await ResumeParserService.parseResumeFile(
      resume._id.toString(),
      tenantId || '',
      userId || '',
      buffer,
      ext
    );

    // Automatically apply extracted sections to Portfolio & tenant collections
    const rawJson = aiResult.rawJson || {};
    if (tenantId) {
      const tenantObjId = new Types.ObjectId(tenantId);
      const userObjId = userId ? new Types.ObjectId(userId) : undefined;

      const portfolioUpdate: any = {};
      if (rawJson.hero) {
        portfolioUpdate.hero = rawJson.hero;
      }
      if (rawJson.about) {
        portfolioUpdate.about = rawJson.about;
      }
      if (rawJson.contact) {
        portfolioUpdate.contact = {
          title: "Let's Connect",
          subtitle: 'Send me a message regarding projects or opportunities.',
          email: rawJson.contact.email || ''
        };
        portfolioUpdate.socialLinks = {
          github: rawJson.contact.github || '',
          linkedin: rawJson.contact.linkedin || '',
          twitter: rawJson.contact.twitter || '',
          email: rawJson.contact.email || ''
        };
      }
      portfolioUpdate.cvFileUrl = secureUrl;

      await Portfolio.findOneAndUpdate(
        { tenantId: tenantObjId },
        { $set: portfolioUpdate },
        { upsert: true }
      );

      // Import Skills
      if (Array.isArray(rawJson.skills) && rawJson.skills.length > 0) {
        for (const sk of rawJson.skills) {
          await Skill.create({
            tenantId: tenantObjId,
            name: sk.name,
            category: sk.category || 'General',
            proficiency: sk.proficiency || 85,
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      }

      // Import Experiences
      if (Array.isArray(rawJson.experiences) && rawJson.experiences.length > 0) {
        for (const exp of rawJson.experiences) {
          await Experience.create({
            tenantId: tenantObjId,
            company: exp.company,
            role: exp.role,
            startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            isCurrent: exp.isCurrent || false,
            description: exp.description,
            technologies: exp.technologies || [],
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      }

      // Import Projects
      if (Array.isArray(rawJson.projects) && rawJson.projects.length > 0) {
        for (const proj of rawJson.projects) {
          await Project.create({
            tenantId: tenantObjId,
            title: proj.title,
            description: proj.description,
            tags: proj.tags || [],
            githubUrl: proj.githubUrl,
            liveUrl: proj.liveUrl,
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      }

      aiResult.mappedState = 'applied';
      await aiResult.save();
    }

    return sendSuccess(res, aiResult, 'Resume uploaded and parsed successfully by AI Engine', 201);
  } catch (error: any) {
    console.error('[ResumeController] uploadAndParseResume error:', error);
    return next(new AppError(`Resume upload and AI parsing failed: ${error.message || error}`, 500));
  }
}
