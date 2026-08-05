import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';

// Helper to generate unique sluggified title
function sluggify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')     // remove non-alphanumeric
    .replace(/[\s_]+/g, '-')          // replace spaces/underscores with hyphen
    .replace(/-+/g, '-');             // remove multiple hyphens
}

let cachedProjectsList: any = null;

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search } = req.query;
    const filterQuery: any = {};

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

    // Use cache only if there are no search or category filters
    if (!category && !search && cachedProjectsList) {
      return sendSuccess(res, cachedProjectsList, 'Projects list retrieved successfully');
    }

    const projects = await Project.find(filterQuery).sort({ order: 1 });

    if (!category && !search) {
      cachedProjectsList = projects;
    }

    return sendSuccess(res, projects, 'Projects list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProjectBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug });

    if (!project) {
      return next(new AppError('Project not found matching slug parameter', 404));
    }

    return sendSuccess(res, project, 'Project case study retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, detailedBody, thumbnail, images, videoUrl, githubUrl, liveUrl, technologies, category, featured, order } = req.body;

    if (!title || !description || !thumbnail || !technologies || !category) {
      return next(new AppError('Missing required project fields (title, description, thumbnail, technologies, category)', 400));
    }

    const slug = sluggify(title);
    
    // Check slug uniqueness
    const existing = await Project.findOne({ slug });
    if (existing) {
      return next(new AppError('A project with a similar title/slug already exists', 400));
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
      order
    });

    await project.save();
    cachedProjectsList = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Regenerate slug if title is updated
    if (updateData.title && updateData.title !== project.title) {
      const newSlug = sluggify(updateData.title);
      const existing = await Project.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        return next(new AppError('A project with a similar title/slug already exists', 400));
      }
      updateData.slug = newSlug;
    }

    Object.assign(project, updateData);
    await project.save();
    cachedProjectsList = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache

    return sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    cachedProjectsList = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
}
