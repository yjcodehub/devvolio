import { Response, NextFunction } from 'express';
import { Experience } from '../models/Experience';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantIdFromRequest } from '../utils/tenantHelper';

export async function getExperiences(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const tenantId = await getTenantIdFromRequest(req);
    const filterQuery: any = {};

    if (tenantId) {
      filterQuery.tenantId = tenantId;
    }

    if (type) {
      filterQuery.type = type;
    }

    // Sort by start date (most recent first)
    const list = await Experience.find(filterQuery).sort({ startDate: -1 });

    return sendSuccess(res, list, 'Experience list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createExperience(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, company, location, type, startDate, endDate, isCurrent, description, highlights, skillsUsed } = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!role || !company || !startDate) {
      return next(new AppError('Missing required experience fields (role, company, startDate)', 400));
    }

    const exp = new Experience({
      role,
      company,
      location,
      type,
      startDate,
      endDate: isCurrent ? undefined : endDate,
      isCurrent,
      description,
      highlights,
      skillsUsed,
      tenantId: tenantId || undefined,
      createdBy: req.user?.userId || undefined,
      updatedBy: req.user?.userId || undefined
    });

    await exp.save();
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, exp, 'Timeline entry created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateExperience(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const tenantId = await getTenantIdFromRequest(req);
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = tenantId;

    if (updateData.isCurrent) {
      updateData.endDate = undefined;
    }

    if (req.user?.userId) {
      updateData.updatedBy = req.user.userId;
    }

    const exp = await Experience.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
    if (!exp) {
      return next(new AppError('Timeline entry not found', 404));
    }

    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, exp, 'Timeline entry updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteExperience(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tenantId = await getTenantIdFromRequest(req);
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = tenantId;

    const exp = await Experience.findOneAndDelete(filter);

    if (!exp) {
      return next(new AppError('Timeline entry not found', 404));
    }

    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Timeline entry deleted successfully');
  } catch (error) {
    next(error);
  }
}
