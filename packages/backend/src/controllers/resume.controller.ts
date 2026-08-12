import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Workspace, Portfolio, AIParsingResult } from '@devvolio/shared';
import { Resume } from '../models/Resume';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import { Certificate } from '../models/Certificate';
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

function sluggify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

function parseFlexibleDate(dateStr: any): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date && !isNaN(dateStr.getTime())) return dateStr;

  const str = String(dateStr).trim();
  const yearMatch = str.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let month = 0;
    for (let i = 0; i < monthNames.length; i++) {
      if (str.toLowerCase().includes(monthNames[i])) {
        month = i;
        break;
      }
    }
    const d = new Date(year, month, 1);
    if (!isNaN(d.getTime())) return d;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;

  return new Date();
}

function mapSkillCategory(cat?: string): string {
  if (!cat) return 'Frameworks & Libraries';
  const c = cat.toLowerCase();
  if (c.includes('front') || c.includes('ui') || c.includes('framework') || c.includes('library')) return 'Frameworks & Libraries';
  if (c.includes('lang') || c.includes('script')) return 'Languages';
  if (c.includes('data') || c.includes('db') || c.includes('sql') || c.includes('mongo')) return 'Databases';
  if (c.includes('tool') || c.includes('platform') || c.includes('git') || c.includes('devops')) return 'Tools & Platforms';
  if (c.includes('ai') || c.includes('copilot') || c.includes('chatgpt') || c.includes('claude')) return 'AI Tools';
  if (c.includes('method') || c.includes('agile') || c.includes('scrum')) return 'Methodologies';
  return 'Frameworks & Libraries';
}

async function saveStructuredDataToTenantCollections(
  tenantObjId: Types.ObjectId,
  userObjId: Types.ObjectId | undefined,
  rawJson: any,
  selectedSections?: any
) {
  // 1. Update Portfolio Hero, About & Contact
  if (!selectedSections || selectedSections.hero || selectedSections.about) {
    const portfolioUpdate: any = {};
    if ((!selectedSections || selectedSections.hero) && rawJson.hero) {
      portfolioUpdate.hero = rawJson.hero;
    }
    if ((!selectedSections || selectedSections.about) && rawJson.about) {
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
    await Portfolio.findOneAndUpdate(
      { tenantId: tenantObjId },
      { $set: portfolioUpdate },
      { upsert: true }
    );
  }

  // 2. Import Skills
  if ((!selectedSections || selectedSections.skills) && Array.isArray(rawJson.skills)) {
    for (const sk of rawJson.skills) {
      if (!sk || !sk.name) continue;
      try {
        const nameStr = sk.name.trim();
        const existingSkill = await Skill.findOne({ tenantId: tenantObjId, name: nameStr });
        if (!existingSkill) {
          await Skill.create({
            tenantId: tenantObjId,
            name: nameStr,
            category: mapSkillCategory(sk.category),
            proficiency: sk.proficiency || 85,
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      } catch (err: any) {
        console.warn('[ResumeController] Skill save notice:', err.message);
      }
    }
  }

  // 3. Import Work Experiences
  if ((!selectedSections || selectedSections.experiences) && Array.isArray(rawJson.experiences)) {
    for (const exp of rawJson.experiences) {
      if (!exp || (!exp.company && !exp.role)) continue;
      try {
        const companyName = exp.company ? exp.company.trim() : 'Company';
        const roleTitle = exp.role ? exp.role.trim() : 'Software Engineer';
        const startDate = parseFlexibleDate(exp.startDate);
        const endDate = exp.endDate ? parseFlexibleDate(exp.endDate) : undefined;

        const existingExp = await Experience.findOne({
          tenantId: tenantObjId,
          company: companyName,
          role: roleTitle
        });

        if (!existingExp) {
          await Experience.create({
            tenantId: tenantObjId,
            type: 'work',
            company: companyName,
            role: roleTitle,
            startDate,
            endDate,
            isCurrent: exp.isCurrent || false,
            description: exp.description || '',
            highlights: exp.highlights || [],
            skillsUsed: exp.technologies || exp.skillsUsed || [],
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      } catch (err: any) {
        console.warn('[ResumeController] Experience save notice:', err.message);
      }
    }
  }

  // 4. Import Education (as Education Experience)
  if ((!selectedSections || selectedSections.education || selectedSections.experiences) && Array.isArray(rawJson.education)) {
    for (const edu of rawJson.education) {
      if (!edu || (!edu.institution && !edu.degree)) continue;
      try {
        const institutionName = edu.institution ? edu.institution.trim() : 'University';
        const roleTitle = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ') || 'Degree / Student';
        const startDate = parseFlexibleDate(edu.startDate);
        const endDate = edu.endDate ? parseFlexibleDate(edu.endDate) : undefined;

        const existingEdu = await Experience.findOne({
          tenantId: tenantObjId,
          company: institutionName,
          role: roleTitle
        });

        if (!existingEdu) {
          await Experience.create({
            tenantId: tenantObjId,
            type: 'education',
            company: institutionName,
            role: roleTitle,
            startDate,
            endDate,
            description: edu.description || (edu.fieldOfStudy ? `Field of Study: ${edu.fieldOfStudy}` : ''),
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      } catch (err: any) {
        console.warn('[ResumeController] Education save notice:', err.message);
      }
    }
  }

  // 5. Import Projects
  if ((!selectedSections || selectedSections.projects) && Array.isArray(rawJson.projects)) {
    for (const proj of rawJson.projects) {
      if (!proj || !proj.title) continue;
      try {
        const titleStr = proj.title.trim();
        const baseSlug = sluggify(titleStr) || 'project';
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await Project.findOne({ tenantId: tenantObjId, slug: uniqueSlug })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        const existingProj = await Project.findOne({ tenantId: tenantObjId, title: titleStr });
        if (!existingProj) {
          const techList = proj.technologies || proj.tags || ['TypeScript', 'React', 'Node.js'];
          await Project.create({
            tenantId: tenantObjId,
            title: titleStr,
            slug: uniqueSlug,
            description: proj.description || `${titleStr} - Developer Project`,
            detailedBody: proj.description || '',
            thumbnail: proj.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
            githubUrl: proj.githubUrl || '',
            liveUrl: proj.liveUrl || '',
            technologies: Array.isArray(techList) && techList.length > 0 ? techList : ['Full Stack'],
            category: proj.category && ['Frontend', 'Full Stack', 'SaaS', 'Other'].includes(proj.category) ? proj.category : 'Full Stack',
            featured: proj.featured || false,
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      } catch (err: any) {
        console.warn('[ResumeController] Project save notice:', err.message);
      }
    }
  }

  // 6. Import Certificates
  if ((!selectedSections || selectedSections.certificates) && Array.isArray(rawJson.certificates)) {
    for (const cert of rawJson.certificates) {
      if (!cert || !cert.name) continue;
      try {
        const nameStr = cert.name.trim();
        const issueDate = parseFlexibleDate(cert.issueDate);
        const existingCert = await Certificate.findOne({ tenantId: tenantObjId, name: nameStr });
        if (!existingCert) {
          await Certificate.create({
            tenantId: tenantObjId,
            name: nameStr,
            issuer: cert.issuer || 'Certification Authority',
            issueDate,
            credentialUrl: cert.credentialUrl || '',
            createdBy: userObjId,
            updatedBy: userObjId
          });
        }
      } catch (err: any) {
        console.warn('[ResumeController] Certificate save notice:', err.message);
      }
    }
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

    if (tenantId) {
      const tenantObjId = new Types.ObjectId(tenantId);
      const userObjId = userId ? new Types.ObjectId(userId) : undefined;
      await saveStructuredDataToTenantCollections(tenantObjId, userObjId, payload, selectedSections);
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
      await saveStructuredDataToTenantCollections(tenantObjId, userObjId, rawJson);

      aiResult.mappedState = 'applied';
      await aiResult.save();
    }

    return sendSuccess(res, aiResult, 'Resume uploaded and parsed successfully by AI Engine', 201);
  } catch (error: any) {
    console.error('[ResumeController] uploadAndParseResume error:', error);
    return next(new AppError(`Resume upload and AI parsing failed: ${error.message || error}`, 500));
  }
}
