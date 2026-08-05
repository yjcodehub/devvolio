import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Workspace, User, Subscription, Portfolio } from '@devvolio/shared';
import { Project } from '../models/Project';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

export async function getPlatformAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [
      totalWorkspaces,
      activeWorkspaces,
      suspendedWorkspaces,
      totalUsers,
      subscriptions,
      totalProjects
    ] = await Promise.all([
      Workspace.countDocuments({}),
      Workspace.countDocuments({ status: 'active' }),
      Workspace.countDocuments({ status: 'suspended' }),
      User.countDocuments({}),
      Subscription.find({}),
      Project.countDocuments({})
    ]);

    // Compute Plan Distribution & Revenue Metrics
    let freeCount = 0;
    let proCount = 0;
    let enterpriseCount = 0;
    let totalAiGenerations = 0;

    for (const sub of subscriptions) {
      if (sub.plan === 'pro') proCount++;
      else if (sub.plan === 'enterprise') enterpriseCount++;
      else freeCount++;

      totalAiGenerations += sub.usage?.aiGenerationsCount || 0;
    }

    const mrrInr = proCount * 999 + enterpriseCount * 2999;
    const arrInr = mrrInr * 12;
    const paidConversionRate = totalWorkspaces > 0 ? parseFloat((((proCount + enterpriseCount) / totalWorkspaces) * 100).toFixed(1)) : 0;

    const payload = {
      revenue: {
        mrrInr,
        arrInr,
        paidConversionRate
      },
      workspaces: {
        total: totalWorkspaces,
        active: activeWorkspaces,
        suspended: suspendedWorkspaces,
        free: freeCount,
        pro: proCount,
        enterprise: enterpriseCount
      },
      users: {
        total: totalUsers
      },
      usage: {
        totalProjects,
        totalAiGenerations
      }
    };

    return sendSuccess(res, payload, 'Platform Super Admin analytics computed successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAllWorkspaces(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, plan, status } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    const workspaces = await Workspace.find(filter).sort({ createdAt: -1 });

    // Populate owner & subscription data
    const enrichedList = await Promise.all(
      workspaces.map(async (ws) => {
        const [owner, sub, portfolio] = await Promise.all([
          User.findById(ws.owner).select('name email role createdAt'),
          Subscription.findOne({ tenantId: ws._id }),
          Portfolio.findOne({ tenantId: ws._id }).select('customDomain domainStatus')
        ]);

        return {
          id: ws._id,
          name: ws.name,
          slug: ws.slug,
          status: ws.status,
          plan: sub?.plan || 'free',
          customDomain: portfolio?.customDomain || '',
          domainStatus: portfolio?.domainStatus || 'idle',
          owner: owner ? { name: owner.name, email: owner.email, role: owner.role } : null,
          createdAt: ws.createdAt
        };
      })
    );

    return sendSuccess(res, enrichedList, 'Workspaces list retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateWorkspaceStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { status } = req.body;

    if (!['active', 'suspended', 'canceled'].includes(status)) {
      return next(new AppError('Invalid status value. Must be active, suspended, or canceled.', 400));
    }

    const workspace = await Workspace.findByIdAndUpdate(id, { status }, { new: true });
    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    return sendSuccess(res, workspace, `Workspace "${workspace.name}" status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function updateWorkspacePlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { plan } = req.body;

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return next(new AppError('Invalid plan type. Must be free, pro, or enterprise.', 400));
    }

    let sub = await Subscription.findOne({ tenantId: new Types.ObjectId(id) });
    if (!sub) {
      sub = new Subscription({ tenantId: new Types.ObjectId(id) });
    }

    sub.plan = plan;
    sub.status = 'active';
    await sub.save();

    await Workspace.findByIdAndUpdate(id, { plan });

    return sendSuccess(res, sub, `Workspace plan updated to ${plan.toUpperCase()}`);
  } catch (error) {
    next(error);
  }
}

export async function impersonateWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    return sendSuccess(res, {
      impersonatedWorkspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug
      },
      message: `Super Admin context active for ${workspace.name}`
    }, `Impersonating workspace [${workspace.slug}]`);
  } catch (error) {
    next(error);
  }
}
