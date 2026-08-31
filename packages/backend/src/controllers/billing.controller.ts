import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Subscription, Workspace } from '@devvolio/shared';
import { Project } from '../models/Project';
import { RazorpayService } from '../services/razorpay.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { PLAN_LIMITS } from '../middleware/tenantLimits';
import { Types } from 'mongoose';

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    priceInr: 0,
    billingCycle: 'forever',
    description: 'Perfect for building and showcasing your initial developer portfolio.',
    features: [
      'Single Workspace Included',
      'Up to 10 Projects',
      'Manual Portfolio Data Updates',
      'Standard Subdomain (username.devvolio.in)',
      'Full Admin Portal Access (Projects, Experience, Skills)',
      'Contact Form & Messages Inbox'
    ],
    limits: PLAN_LIMITS.free
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    priceInr: 99,
    billingCycle: 'monthly',
    isComingSoon: true,
    description: 'Unlock AI automation, multiple workspaces, and premium portfolio themes.',
    features: [
      'Multiple Workspaces Support',
      'AI-Powered Resume Parser & Auto-Importer',
      'Unlimited Projects & Experiences',
      'Varieties of Premium Templates',
      'Custom Domain Mapping',
      'Priority Support & Custom Enhancements'
    ],
    limits: PLAN_LIMITS.pro
  }
];

async function resolveTenantId(req: AuthRequest): Promise<string | null> {
  if (req.tenant?.id) return req.tenant.id;

  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId) return Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId;

  if (req.user?.userId) {
    const ws = await Workspace.findOne({ owner: new Types.ObjectId(req.user.userId) });
    if (ws) return ws._id.toString();
  }

  const firstWs = await Workspace.findOne({ status: 'active' });
  if (firstWs) return firstWs._id.toString();

  return null;
}

export async function getPlans(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, PRICING_PLANS, 'Pricing plans retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await resolveTenantId(req);
    if (!tenantId) {
      return next(new AppError('Tenant workspace context missing. Provide x-tenant-id header or login.', 400));
    }

    let sub = await Subscription.findOne({ tenantId: new Types.ObjectId(tenantId) });
    if (!sub) {
      sub = new Subscription({ tenantId: new Types.ObjectId(tenantId), plan: 'free' });
      await sub.save();
    }

    const projectsCount = await Project.countDocuments({ tenantId: new Types.ObjectId(tenantId) });
    const planLimits = PLAN_LIMITS[sub.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

    const payload = {
      subscription: sub,
      metrics: {
        projectsCount,
        maxProjects: planLimits.maxProjects,
        aiGenerationsCount: sub.usage?.aiGenerationsCount || 0,
        maxAiGenerations: planLimits.maxAiGenerations,
        customDomainAllowed: planLimits.customDomainAllowed
      }
    };

    return sendSuccess(res, payload, 'Active tenant subscription retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createRazorpayOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await resolveTenantId(req);
    const { planId = 'pro', billingCycle = 'monthly' } = req.body;

    if (!tenantId) {
      return next(new AppError('Tenant workspace context missing. Provide x-tenant-id header or login.', 400));
    }

    const targetPlan = PRICING_PLANS.find(p => p.id === planId);
    if (!targetPlan || targetPlan.priceInr === 0) {
      return next(new AppError('Invalid plan selected for checkout', 400));
    }

    const amountInr = billingCycle === 'yearly' ? targetPlan.priceInr * 10 : targetPlan.priceInr;
    const receipt = `rcpt_${tenantId.slice(-6)}_${Date.now()}`;

    const order = await RazorpayService.createOrder(amountInr, receipt);

    return sendSuccess(res, {
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_devvolioKey',
      planId,
      amountInr
    }, 'Razorpay checkout order created');
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await resolveTenantId(req);
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId = 'pro', billingCycle = 'monthly' } = req.body;

    if (!tenantId) {
      return next(new AppError('Tenant workspace context missing. Provide x-tenant-id header or login.', 400));
    }

    const isValid = RazorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return next(new AppError('Payment signature verification failed', 400));
    }

    const targetPlan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[1];

    let sub = await Subscription.findOne({ tenantId: new Types.ObjectId(tenantId) });
    if (!sub) {
      sub = new Subscription({ tenantId: new Types.ObjectId(tenantId) });
    }

    sub.plan = targetPlan.id as any;
    sub.status = 'active';
    sub.billingCycle = billingCycle;
    sub.priceInr = targetPlan.priceInr;
    sub.razorpayPaymentId = razorpayPaymentId;
    sub.currentPeriodStart = new Date();
    sub.currentPeriodEnd = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);

    await sub.save();
    await Workspace.findByIdAndUpdate(tenantId, { plan: targetPlan.id });

    return sendSuccess(res, sub, `Subscription upgraded to ${targetPlan.name}!`);
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(req: any, res: Response) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'devvolioWebhookSecret';

    if (signature && secret) {
      const isValid = RazorpayService.verifyWebhookSignature(JSON.stringify(req.body), signature, secret);
      if (!isValid) {
        return res.status(400).json({ status: 'failure', reason: 'Invalid signature' });
      }
    }

    const event = req.body?.event;
    console.log('[BillingWebhook] Razorpay Event Received:', event);

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('[BillingWebhook] Exception:', err);
    return res.status(500).json({ status: 'error' });
  }
}
