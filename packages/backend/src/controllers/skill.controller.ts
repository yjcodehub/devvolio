import { Response, NextFunction } from 'express';
import { Skill } from '../models/Skill';
import { Portfolio } from '@devvolio/shared';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { invalidatePortfolioCache } from '../routes/index';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantIdFromRequest } from '../utils/tenantHelper';
import { Types } from 'mongoose';

/**
 * GET /skills/catalog
 * Retrieve all global master skills across all categories
 */
export async function getCatalogSkills(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const list = await Skill.find({}).sort({ category: 1, name: 1 });
    return sendSuccess(res, list, 'Master skills catalog retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /skills/catalog
 * Add a new technology/skill to the global catalog
 */
export async function createCatalogSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, category, icon } = req.body;

    if (!name || !category) {
      return next(new AppError('Skill name and category are required', 400));
    }

    const trimmedName = name.trim();
    // Check if skill exists (case-insensitive)
    let existing = await Skill.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (existing) {
      return sendSuccess(res, existing, 'Skill already exists in catalog');
    }

    const newCatalogSkill = new Skill({
      name: trimmedName,
      category,
      icon: icon || 'FaCode',
      isSystem: false,
      createdBy: req.user?.userId || undefined
    });

    await newCatalogSkill.save();
    return sendSuccess(res, newCatalogSkill, 'Skill added to catalog successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /skills
 * Retrieve current user's workspace skills populated from catalog
 */
export async function getSkills(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return sendSuccess(res, [], 'No active workspace context');
    }

    const portfolio = await Portfolio.findOne({ tenantId }).populate('skills.skillId');
    if (!portfolio || !portfolio.skills) {
      return sendSuccess(res, [], 'No skills found');
    }

    // Format populated skills for consistent frontend consumption
    const formatted = portfolio.skills
      .filter((item: any) => item.skillId)
      .map((item: any) => {
        const skillDoc = item.skillId;
        return {
          _id: item._id,
          skillId: skillDoc._id,
          name: skillDoc.name,
          category: skillDoc.category,
          icon: skillDoc.icon,
          proficiency: item.proficiency ?? 80,
          featured: item.featured ?? false,
          order: item.order ?? 0
        };
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return sendSuccess(res, formatted, 'Workspace skills retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /skills
 * Add or link a catalog skill to the current workspace
 */
export async function createSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skillId, name, category, icon, proficiency, featured, order } = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    let resolvedSkillId: Types.ObjectId | null = null;

    if (skillId && Types.ObjectId.isValid(skillId)) {
      resolvedSkillId = new Types.ObjectId(skillId);
    } else if (name && category) {
      // Find or create in catalog
      const trimmedName = name.trim();
      let catalogItem = await Skill.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
      });

      if (!catalogItem) {
        catalogItem = new Skill({
          name: trimmedName,
          category,
          icon: icon || 'FaCode',
          isSystem: false,
          createdBy: req.user?.userId || undefined
        });
        await catalogItem.save();
      }
      resolvedSkillId = catalogItem._id as Types.ObjectId;
    } else {
      return next(new AppError('Please select a skill from the catalog or specify name & category', 400));
    }

    let portfolio = await Portfolio.findOne({ tenantId });
    if (!portfolio) {
      return next(new AppError('Portfolio not found for workspace', 404));
    }

    if (!portfolio.skills) {
      portfolio.skills = [];
    }

    const alreadyLinked = portfolio.skills.some(
      (s: any) => s.skillId?.toString() === resolvedSkillId?.toString()
    );

    if (alreadyLinked) {
      return next(new AppError('This skill is already added to your workspace', 400));
    }

    if (featured) {
      const currentFeaturedCount = portfolio.skills.filter((s: any) => s.featured).length;
      if (currentFeaturedCount >= 6) {
        return next(new AppError('Maximum of 6 featured skills allowed for the homepage marquee. Please unfeature another skill first.', 400));
      }
    }

    const newSkillEntry = {
      _id: new Types.ObjectId(),
      skillId: resolvedSkillId,
      proficiency: proficiency !== undefined ? Number(proficiency) : 80,
      featured: Boolean(featured),
      order: order !== undefined ? Number(order) : portfolio.skills.length + 1
    };

    portfolio.skills.push(newSkillEntry as any);
    await portfolio.save();

    // Populate catalog metadata for response
    const populatedMaster = await Skill.findById(resolvedSkillId);
    const responsePayload = {
      _id: newSkillEntry._id,
      skillId: populatedMaster?._id,
      name: populatedMaster?.name,
      category: populatedMaster?.category,
      icon: populatedMaster?.icon,
      proficiency: newSkillEntry.proficiency,
      featured: newSkillEntry.featured,
      order: newSkillEntry.order
    };

    invalidatePortfolioCache();
    return sendSuccess(res, responsePayload, 'Skill added to workspace successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /skills/:id
 * Update proficiency, featured toggle, or order for a workspace skill
 */
export async function updateSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { proficiency, featured, order } = req.body;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    const portfolio = await Portfolio.findOne({ tenantId });
    if (!portfolio || !portfolio.skills) {
      return next(new AppError('Portfolio not found', 404));
    }

    const skillItem = portfolio.skills.find(
      (s: any) => s._id?.toString() === id || s.skillId?.toString() === id
    );

    if (!skillItem) {
      return next(new AppError('Skill not found in workspace', 404));
    }

    if (featured !== undefined && featured === true && !skillItem.featured) {
      const currentFeaturedCount = portfolio.skills.filter(
        (s: any) => s.featured && s._id?.toString() !== skillItem._id?.toString()
      ).length;
      if (currentFeaturedCount >= 6) {
        return next(new AppError('Maximum of 6 featured skills allowed for the homepage marquee. Please unfeature another skill first.', 400));
      }
    }

    if (proficiency !== undefined) skillItem.proficiency = Number(proficiency);
    if (featured !== undefined) skillItem.featured = Boolean(featured);
    if (order !== undefined) skillItem.order = Number(order);

    await portfolio.save();

    const populatedMaster = await Skill.findById(skillItem.skillId);
    const responsePayload = {
      _id: skillItem._id,
      skillId: populatedMaster?._id,
      name: populatedMaster?.name,
      category: populatedMaster?.category,
      icon: populatedMaster?.icon,
      proficiency: skillItem.proficiency,
      featured: skillItem.featured,
      order: skillItem.order
    };

    invalidatePortfolioCache();
    return sendSuccess(res, responsePayload, 'Skill updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /skills/:id
 * Remove a skill from the workspace
 */
export async function deleteSkill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tenantId = await getTenantIdFromRequest(req);

    if (!tenantId) {
      return next(new AppError('No active workspace found for this user', 400));
    }

    const portfolio = await Portfolio.findOne({ tenantId });
    if (!portfolio || !portfolio.skills) {
      return next(new AppError('Portfolio not found', 404));
    }

    const initialLength = portfolio.skills.length;
    portfolio.skills = portfolio.skills.filter(
      (s: any) => s._id?.toString() !== id && s.skillId?.toString() !== id
    );

    if (portfolio.skills.length === initialLength) {
      return next(new AppError('Skill not found in workspace', 404));
    }

    await portfolio.save();
    invalidatePortfolioCache();
    return sendSuccess(res, null, 'Skill removed from workspace');
  } catch (error) {
    next(error);
  }
}

