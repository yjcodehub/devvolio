import { Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantIdFromRequest } from '../utils/tenantHelper';

// Helper to generate unique sluggified title
function sluggify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')     // remove non-alphanumeric
    .replace(/[\s_]+/g, '-')          // replace spaces/underscores with hyphen
    .replace(/-+/g, '-');             // remove multiple hyphens
}

export async function getProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { category, search } = req.query;
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return sendSuccess(res, [], 'No active workspace context');
    }

    const filterQuery: any = { tenantId };

    if (category) {
      filterQuery.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filterQuery.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex }
      ];
    }

    const projects = await Project.find(filterQuery).sort({ displayOrder: 1, createdAt: -1 });

    return sendSuccess(res, projects, 'Projects list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProjectBySlug(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return next(new AppError('Project not found matching slug parameter', 404));
    }

    const project = await Project.findOne({ slug, tenantId });

    if (!project) {
      return next(new AppError('Project not found matching slug parameter', 404));
    }

    return sendSuccess(res, project, 'Project case study retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, description, detailedBody, thumbnail, images, videoUrl, githubUrl, liveUrl, technologies, category, featured, order } = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user. Please complete onboarding.', 400));
    }

    if (!title || !description || !thumbnail || !technologies || !category) {
      return next(new AppError('Missing required project fields (title, description, thumbnail, technologies, category)', 400));
    }

    const slug = sluggify(title);
    
    // Check slug uniqueness within workspace
    const existing = await Project.findOne({ slug, tenantId });
    if (existing) {
      return next(new AppError('A project with a similar title/slug already exists in your workspace', 400));
    }

    const project = new Project({
      title,
      slug,
      description,
      detailedBody,
      thumbnail,
      images,
      videoUrl,
      githubUrl,
      liveUrl,
      technologies,
      category,
      featured,
      order,
      tenantId,
      createdBy: req.user?.userId || undefined,
      updatedBy: req.user?.userId || undefined
    });

    await project.save();
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    const project = await Project.findOne({ _id: id, tenantId });
    if (!project) {
      return next(new AppError('Project not found in your workspace', 404));
    }

    // Regenerate slug if title is updated
    if (updateData.title && updateData.title !== project.title) {
      const newSlug = sluggify(updateData.title);
      const existing = await Project.findOne({ slug: newSlug, tenantId, _id: { $ne: id } });
      if (existing) {
        return next(new AppError('A project with a similar title/slug already exists in your workspace', 400));
      }
      updateData.slug = newSlug;
    }

    if (req.user?.userId) {
      updateData.updatedBy = req.user.userId;
    }

    Object.assign(project, updateData);
    await project.save();
    invalidatePortfolioCache(); // Invalidate aggregated route cache

    return sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    const project = await Project.findOneAndDelete({ _id: id, tenantId });

    if (!project) {
      return next(new AppError('Project not found in your workspace', 404));
    }

    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
}
