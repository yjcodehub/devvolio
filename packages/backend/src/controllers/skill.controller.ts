import { Response, NextFunction } from 'express';
import { Skill } from '../models/Skill';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantIdFromRequest } from '../utils/tenantHelper';

export async function getSkills(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return sendSuccess(res, [], 'No active workspace context');
    }

    const list = await Skill.find({ tenantId }).sort({ displayOrder: 1, createdAt: -1 });
    return sendSuccess(res, list, 'Skills list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, category, proficiency, icon, featured, order } = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user. Please complete onboarding.', 400));
    }

    if (!name || !category) {
      return next(new AppError('Missing required skill fields (name, category)', 400));
    }

    const existing = await Skill.findOne({ name, tenantId });
    if (existing) {
      return next(new AppError('A skill with this name already exists in your workspace', 400));
    }

    const skill = new Skill({
      name,
      category,
      proficiency,
      icon,
      featured,
      order,
      tenantId,
      createdBy: req.user?.userId || undefined,
      updatedBy: req.user?.userId || undefined
    });

    await skill.save();
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, skill, 'Skill created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    if (req.user?.userId) {
      updateData.updatedBy = req.user.userId;
    }

    const skill = await Skill.findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true, runValidators: true });
    if (!skill) {
      return next(new AppError('Skill not found in your workspace', 404));
    }

    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, skill, 'Skill updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    const skill = await Skill.findOneAndDelete({ _id: id, tenantId });

    if (!skill) {
      return next(new AppError('Skill not found in your workspace', 404));
    }

    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Skill deleted successfully');
  } catch (error) {
    next(error);
  }
}
