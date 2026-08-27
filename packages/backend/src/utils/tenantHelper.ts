import { Types } from 'mongoose';
import { Workspace } from '@devvolio/shared';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Resolves the active workspace/tenant ObjectId for an incoming request.
 * Checks in order:
 * 1. req.tenant.id (from tenant middleware)
 * 2. 'x-tenant-id' header
 * 3. req.user.userId (owner of Workspace)
 */
export async function getTenantIdFromRequest(req: AuthRequest): Promise<Types.ObjectId | null> {
  // 1. Check req.tenant.id
  if (req.tenant?.id) {
    return new Types.ObjectId(req.tenant.id);
  }

  // 2. Check x-tenant-id header
  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId) {
    const rawId = Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId;
    if (Types.ObjectId.isValid(rawId)) {
      return new Types.ObjectId(rawId);
    }
  }

  // 3. Check authenticated user's workspace
  if (req.user?.userId) {
    const ws = await Workspace.findOne({ owner: new Types.ObjectId(req.user.userId) });
    if (ws) {
      return ws._id as Types.ObjectId;
    }
  }

  return null;
}
