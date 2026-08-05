import { Request, Response, NextFunction } from 'express';
import { Skill } from '../models/Skill';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';

let cachedSkills: any = null;

export async function getSkills(req: Request, res: Response, next: NextFunction) {
  try {
    if (cachedSkills) {
      return sendSuccess(res, cachedSkills, 'Skills list retrieved successfully');
    }

    const list = await Skill.find({}).sort({ order: 1 });
    cachedSkills = list;
    return sendSuccess(res, list, 'Skills list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, category, proficiency, icon, featured, order } = req.body;

    if (!name || !category) {
      return next(new AppError('Missing required skill fields (name, category)', 400));
    }

    const existing = await Skill.findOne({ name });
    if (existing) {
      return next(new AppError('A skill with this name already exists', 400));
    }

    const skill = new Skill({
      name,
      category,
      proficiency,
      icon,
      featured,
      order
    });

    await skill.save();
    cachedSkills = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, skill, 'Skill created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const skill = await Skill.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!skill) {
      return next(new AppError('Skill not found', 404));
    }

    cachedSkills = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, skill, 'Skill updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return next(new AppError('Skill not found', 404));
    }

    cachedSkills = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Skill deleted successfully');
  } catch (error) {
    next(error);
  }
}
