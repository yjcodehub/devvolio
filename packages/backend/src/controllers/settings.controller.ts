import { Request, Response, NextFunction } from 'express';
import { Settings } from '../models/Settings';
import { sendSuccess } from '../utils/apiResponse';
import { initialSettings } from '../config/defaultData';
import { invalidatePortfolioCache } from '../routes/index';

let cachedSettings: any = null;

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    if (cachedSettings) {
      return sendSuccess(res, cachedSettings, 'Global website settings loaded successfully');
    }

    let settings = await Settings.findOne({});
    
    // Fallback if DB is empty
    if (!settings) {
      settings = new Settings(initialSettings);
      await settings.save();
    }

    cachedSettings = settings;
    return sendSuccess(res, settings, 'Global website settings loaded successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    let settings = await Settings.findOne({});

    if (!settings) {
      settings = new Settings(updateData);
    } else {
      Object.assign(settings, updateData);
    }

    await settings.save();
    cachedSettings = settings; // Update cache
    invalidatePortfolioCache(); // Invalidate aggregated route cache
    return sendSuccess(res, settings, 'Global settings updated successfully');
  } catch (error) {
    next(error);
  }
}
