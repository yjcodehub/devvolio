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
    const filter: any = {};
    if (tenantId) filter.tenantId = tenantId;

    const list = await Skill.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    return sendSuccess(res, list, 'Skills list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, category, proficiency, icon, featured, order } = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!name || !category) {
      return next(new AppError('Missing required skill fields (name, category)', 400));
    }

    const existingFilter: any = { name };
    if (tenantId) existingFilter.tenantId = tenantId;
    const existing = await Skill.findOne(existingFilter);
    if (existing) {
      return next(new AppError('A skill with this name already exists', 400));
    }

    const skill = new Skill({
      name,
      category,
      proficiency,
      icon,
      featured,
      order,
      tenantId: tenantId || undefined,
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
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = tenantId;

    if (req.user?.userId) {
      updateData.updatedBy = req.user.userId;
    }

    const skill = await Skill.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
    if (!skill) {
      return next(new AppError('Skill not found', 404));
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
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = tenantId;

    const skill = await Skill.findOneAndDelete(filter);

    if (!skill) {
      return next(new AppError('Skill not found', 404));
    }

    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Skill deleted successfully');
  } catch (error) {
    next(error);
  }
}
