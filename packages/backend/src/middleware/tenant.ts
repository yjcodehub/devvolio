import { Request, Response, NextFunction } from 'express';
import { Workspace } from '@devvolio/shared';

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
      }
    }
  }
}

export const tenantContext = async (req: Request, res: Response, next: NextFunction) => {
  // Extract tenant context via direct header or parsed subdomain header from proxy
  const tenantId = req.headers['x-tenant-id'] as string;
  const tenantSlug = req.headers['x-tenant-slug'] as string;

  if (!tenantId && !tenantSlug) {
    return res.status(400).json({
      success: false,
      message: 'Multi-tenancy context missing: Provide x-tenant-id or x-tenant-slug header.'
    });
  }

  try {
    if (tenantId) {
      req.tenant = { id: tenantId, slug: '' };
      return next();
    }

    // Resolve tenant ID from slug
    const workspace = await Workspace.findOne({ slug: tenantSlug.toLowerCase(), status: 'active' });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: `Workspace not found or inactive for: ${tenantSlug}`
      });
    }

    req.tenant = { id: (workspace._id as any).toString(), slug: workspace.slug };
    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve tenant context.',
      error: error.message
    });
  }
};
