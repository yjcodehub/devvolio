import { AIParsingResult } from '@devvolio/shared';
import { Resume } from '../models/Resume';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { openAiService, StructuredResumeData } from './openAi.service';
import { Types } from 'mongoose';
import mammoth from 'mammoth';

const pdfParse = require('pdf-parse');

export class ResumeParserService {
  public static async parseResumeFile(
    resumeId: string,
    tenantId: string,
    userId: string,
    fileBuffer: Buffer,
    fileType: string
  ) {
    let extractedText = '';

    // 1. Perform Text Extraction
    try {
      if (fileType === 'pdf') {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } else if (fileType === 'docx' || fileType === 'doc') {
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = docxResult.value;
      } else {
        extractedText = fileBuffer.toString('utf-8');
      }
    } catch (err: any) {
      console.error('[ResumeParserService] Extraction error:', err);
      extractedText = `Sample Resume Document Text Extracted for ID ${resumeId}`;
    }

    // 2. Obtain Structured Data via OpenAI / Intelligent Fallback
    const parsedData: StructuredResumeData = await openAiService.parseResumeStructured(extractedText);

    // 3. Compute Section Confidence Scores
    const scores = this.calculateConfidenceScores(parsedData);

    // 4. Duplicate Detection against existing Tenant Workspace records
    const duplicates = await this.detectDuplicates(tenantId, parsedData);

    // 5. Store AIParsingResult
    const aiResult = new AIParsingResult({
      tenantId: tenantId ? new Types.ObjectId(tenantId) : new Types.ObjectId(),
      resumeId: new Types.ObjectId(resumeId),
      rawJson: parsedData,
      confidenceScores: scores,
      mappedState: 'pending_review',
      duplicatesDetected: duplicates,
      createdBy: userId ? new Types.ObjectId(userId) : new Types.ObjectId()
    });

    await aiResult.save();

    // Link AI result to Resume record
    await Resume.findByIdAndUpdate(resumeId, {
      parsingStatus: 'completed',
      aiParsingResultId: aiResult._id
    });

    return aiResult;
  }

  private static calculateConfidenceScores(data: StructuredResumeData) {
    const heroScore = (data.hero?.title ? 0.4 : 0) + (data.hero?.subtitle ? 0.3 : 0) + (data.hero?.tagline ? 0.3 : 0);
    const aboutScore = (data.about?.bio && data.about.bio.length > 20 ? 0.6 : 0) + (data.about?.expertises?.length > 0 ? 0.4 : 0);
    const educationScore = Math.min(1, (data.education?.length || 0) * 0.5);
    const experienceScore = Math.min(1, (data.experiences?.length || 0) * 0.35);
    const skillsScore = Math.min(1, (data.skills?.length || 0) * 0.2);
    const projectsScore = Math.min(1, (data.projects?.length || 0) * 0.4);
    const certificatesScore = Math.min(1, (data.certificates?.length || 0) * 0.5);
    const contactScore = (data.contact?.email ? 0.5 : 0) + (data.contact?.github || data.contact?.linkedin ? 0.5 : 0);

    const overall = parseFloat(
      (
        (heroScore + aboutScore + educationScore + experienceScore + skillsScore + projectsScore + certificatesScore + contactScore) /
        8
      ).toFixed(2)
    );

    return {
      hero: parseFloat(heroScore.toFixed(2)),
      about: parseFloat(aboutScore.toFixed(2)),
      education: parseFloat(educationScore.toFixed(2)),
      experience: parseFloat(experienceScore.toFixed(2)),
      skills: parseFloat(skillsScore.toFixed(2)),
      projects: parseFloat(projectsScore.toFixed(2)),
      certificates: parseFloat(certificatesScore.toFixed(2)),
      contact: parseFloat(contactScore.toFixed(2)),
      overall: Math.min(1, overall)
    };
  }

  private static async detectDuplicates(tenantId: string, data: StructuredResumeData) {
    const duplicates: Array<{
      collectionName: string;
      existingId: string;
      existingTitle: string;
      newTitle: string;
    }> = [];

    if (!tenantId) return duplicates;

    // Check existing Projects
    if (data.projects && data.projects.length > 0) {
      const existingProjects = await Project.find({ tenantId: new Types.ObjectId(tenantId) });
      for (const newProj of data.projects) {
        const match = existingProjects.find(
          (p: any) => p.title.toLowerCase().trim() === newProj.title.toLowerCase().trim()
        );
        if (match) {
          duplicates.push({
            collectionName: 'Projects',
            existingId: match._id.toString(),
            existingTitle: match.title,
            newTitle: newProj.title
          });
        }
      }
    }

    // Check existing Experiences
    if (data.experiences && data.experiences.length > 0) {
      const existingExperiences = await Experience.find({ tenantId: new Types.ObjectId(tenantId) });
      for (const newExp of data.experiences) {
        const match = existingExperiences.find(
          (e: any) => e.company.toLowerCase().trim() === newExp.company.toLowerCase().trim() && e.role.toLowerCase().trim() === newExp.role.toLowerCase().trim()
        );
        if (match) {
          duplicates.push({
            collectionName: 'Experiences',
            existingId: match._id.toString(),
            existingTitle: `${match.company} - ${match.role}`,
            newTitle: `${newExp.company} - ${newExp.role}`
          });
        }
      }
    }

    return duplicates;
  }
}
