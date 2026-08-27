import { Response, NextFunction } from 'express';
import { Settings } from '../models/Settings';
import { sendSuccess } from '../utils/apiResponse';
import { initialSettings } from '../config/defaultData';
import { invalidatePortfolioCache } from '../routes/index';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantIdFromRequest } from '../utils/tenantHelper';

export async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    const filter = tenantId ? { tenantId } : {};

    let settings = await Settings.findOne(filter);
    
    // Fallback if tenant portfolio doesn't exist yet
    if (!settings && tenantId) {
      settings = new Settings({
        ...initialSettings,
        tenantId,
        createdBy: req.user?.userId,
        updatedBy: req.user?.userId
      });
      await settings.save();
    } else if (!settings) {
      settings = new Settings(initialSettings);
      await settings.save();
    }

    return sendSuccess(res, settings, 'Website settings loaded successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    const tenantId = await getTenantIdFromRequest(req);
    const filter = tenantId ? { tenantId } : {};

    let settings = await Settings.findOne(filter);

    if (!settings) {
      settings = new Settings({
        ...updateData,
        ...(tenantId ? { tenantId, createdBy: req.user?.userId, updatedBy: req.user?.userId } : {})
      });
    } else {
      Object.assign(settings, updateData);
      if (req.user?.userId) {
        settings.updatedBy = req.user.userId;
      }
    }

    await settings.save();
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, settings, 'Website settings updated successfully');
  } catch (error) {
    next(error);
  }
}
