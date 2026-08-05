import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { openAiService } from '../services/openAi.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';

export async function generateAbout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentBio, targetRole } = req.body;
    const prompt = `Rewrite this professional bio for a ${targetRole || 'Software Engineer'}. Keep it concise, technical, and impressive:\n${currentBio || 'Software Developer building web apps.'}`;
    const result = await openAiService.generateText(prompt, 'You are an executive resume writer for software engineers.');
    return sendSuccess(res, { text: result }, 'About section generated');
  } catch (err) { next(err); }
}

export async function improveSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { summary } = req.body;
    const prompt = `Improve this developer summary tagline into 2 punchy, professional sentences:\n${summary}`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Summary improved');
  } catch (err) { next(err); }
}

export async function generateProjectDesc(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, techStack, rawNotes } = req.body;
    const prompt = `Write a compelling 3-sentence project description for "${title}" built with [${techStack?.join(', ')}]. Context:\n${rawNotes || 'Full stack web application.'}`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Project description generated');
  } catch (err) { next(err); }
}

export async function rewriteResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { bulletPoints } = req.body;
    const prompt = `Rewrite these work experience bullet points using strong action verbs and quantified impact:\n${bulletPoints}`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Resume bullet points rewritten');
  } catch (err) { next(err); }
}

export async function generateSeo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { developerName, primaryRole } = req.body;
    const prompt = `Generate an SEO meta title (under 60 chars) and meta description (under 150 chars) for a developer portfolio belonging to ${developerName || 'Developer'}, ${primaryRole || 'Software Engineer'}.`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'SEO metadata generated');
  } catch (err) { next(err); }
}

export async function suggestSkills(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, focusArea } = req.body;
    const prompt = `Suggest a list of 10 modern technical skills and tools for a ${role || 'Full Stack Engineer'} focusing on ${focusArea || 'Web Architectures'}. Return a JSON array of strings.`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Skill suggestions generated');
  } catch (err) { next(err); }
}

export async function generateBlog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { topic } = req.body;
    const prompt = `Write a short 400-word technical blog post in markdown about: ${topic || 'Building Multi-Tenant SaaS with Next.js and MongoDB'}.`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Blog post generated');
  } catch (err) { next(err); }
}

export async function generateMeta(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { pageTitle } = req.body;
    const prompt = `Generate OpenGraph meta tags and keywords for page title: ${pageTitle}`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Meta tags generated');
  } catch (err) { next(err); }
}

export async function generateTestimonials(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { clientRole, projectType } = req.body;
    const prompt = `Generate a realistic client review testimonial for a software developer from a ${clientRole || 'CTO'} for a ${projectType || 'Full Stack Redesign'}.`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'Testimonial generated');
  } catch (err) { next(err); }
}

export async function improveLinkedin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { bio } = req.body;
    const prompt = `Optimize this bio for a LinkedIn About section:\n${bio}`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'LinkedIn bio improved');
  } catch (err) { next(err); }
}

export async function improveReadme(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, title, skills } = req.body;
    const prompt = `Generate a modern GitHub Profile README.md template for ${name || 'Developer'} (${title || 'Full Stack Engineer'}). Skills: ${skills?.join(', ')}`;
    const result = await openAiService.generateText(prompt);
    return sendSuccess(res, { text: result }, 'GitHub README generated');
  } catch (err) { next(err); }
}
