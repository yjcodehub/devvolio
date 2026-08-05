import { Request, Response, NextFunction } from 'express';
import { Experience } from '../models/Experience';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';

let cachedExperiences: any = null;

export async function getExperiences(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const filterQuery: any = {};

    if (type) {
      filterQuery.type = type;
    } else if (cachedExperiences) {
      return sendSuccess(res, cachedExperiences, 'Experience list retrieved successfully');
    }

    // Sort by start date (most recent first)
    const list = await Experience.find(filterQuery).sort({ startDate: -1 });

    if (!type) {
      cachedExperiences = list;
    }

    return sendSuccess(res, list, 'Experience list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const { role, company, location, type, startDate, endDate, isCurrent, description, highlights, skillsUsed } = req.body;

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
      skillsUsed
    });

    await exp.save();
    cachedExperiences = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, exp, 'Timeline entry created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.isCurrent) {
      updateData.endDate = undefined;
    }

    const exp = await Experience.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!exp) {
      return next(new AppError('Timeline entry not found', 404));
    }

    cachedExperiences = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, exp, 'Timeline entry updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const exp = await Experience.findByIdAndDelete(id);

    if (!exp) {
      return next(new AppError('Timeline entry not found', 404));
    }

    cachedExperiences = null; // Invalidate cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, null, 'Timeline entry deleted successfully');
  } catch (error) {
    next(error);
  }
}
