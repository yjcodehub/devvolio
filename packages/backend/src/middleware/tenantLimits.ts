import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Subscription } from '@devvolio/shared';
import { Project } from '../models/Project';
import { AppError } from './errorHandler';
import { Types } from 'mongoose';

export const PLAN_LIMITS = {
  free: {
    maxProjects: 5,
    maxAiGenerations: 5,
    customDomainAllowed: false
  },
  pro: {
    maxProjects: Infinity,
    maxAiGenerations: 500,
    customDomainAllowed: true
  },
  enterprise: {
    maxProjects: Infinity,
    maxAiGenerations: 5000,
    customDomainAllowed: true
  }
};

export async function checkProjectLimit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) return next();

    // Fetch tenant subscription (or fallback to free)
    let sub = await Subscription.findOne({ tenantId: new Types.ObjectId(tenantId) });
    const plan = (sub?.plan || 'free') as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    if (limits.maxProjects !== Infinity) {
      const currentCount = await Project.countDocuments({ tenantId: new Types.ObjectId(tenantId) });
      if (currentCount >= limits.maxProjects) {
        return next(
          new AppError(
            `Workspace project limit reached (${currentCount}/${limits.maxProjects}) for the ${plan.toUpperCase()} plan. Upgrade to PRO for unlimited projects!`,
            403
          )
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function checkAiUsageLimit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) return next();

    let sub = await Subscription.findOne({ tenantId: new Types.ObjectId(tenantId) });
    if (!sub) {
      sub = new Subscription({ tenantId: new Types.ObjectId(tenantId), plan: 'free' });
      await sub.save();
    }

    const plan = (sub.plan || 'free') as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // Reset monthly quota if resetAt has passed
    if (new Date() > new Date(sub.usage.resetAt)) {
      sub.usage.aiGenerationsCount = 0;
      sub.usage.resumeParsesCount = 0;
      sub.usage.resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await sub.save();
    }

    if (sub.usage.aiGenerationsCount >= limits.maxAiGenerations) {
      return next(
        new AppError(
          `Monthly AI usage limit reached (${sub.usage.aiGenerationsCount}/${limits.maxAiGenerations}) on your ${plan.toUpperCase()} plan. Upgrade to PRO to get 500 monthly generations!`,
          403
        )
      );
    }

    // Increment usage counter
    sub.usage.aiGenerationsCount += 1;
    await sub.save();

    next();
  } catch (error) {
    next(error);
  }
}

export async function checkCustomDomainAccess(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) return next();

    const sub = await Subscription.findOne({ tenantId: new Types.ObjectId(tenantId) });
    const plan = (sub?.plan || 'free') as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    if (!limits.customDomainAllowed) {
      return next(
        new AppError(
          'Connecting custom domains (e.g. john.dev) is a PRO feature. Please upgrade your workspace to connect your domain!',
          403
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
