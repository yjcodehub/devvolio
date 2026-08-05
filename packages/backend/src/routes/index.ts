import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import experienceRoutes from './experience.routes';
import skillRoutes from './skill.routes';
import settingsRoutes from './settings.routes';
import messageRoutes from './message.routes';
import mediaRoutes from './media.routes';
import resumeRoutes from './resume.routes';
import aiRoutes from './ai.routes';
import workspaceRoutes from './workspace.routes';
import billingRoutes from './billing.routes';
import superAdminRoutes from './superAdmin.routes';

import { Settings } from '../models/Settings';
import { Experience } from '../models/Experience';
import { Project } from '../models/Project';
import { Skill } from '../models/Skill';
import { initialSettings } from '../config/defaultData';

const router = Router();

let cachedPortfolioData: any = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Yashkumar Jais Portfolio REST API is operational'
  });
});

// Aggregated landing page endpoint to minimize roundtrips on mobile devices (uses a 5-minute TTL cache)
router.get('/portfolio-data', async (req, res, next) => {
  try {
    const now = Date.now();
    if (cachedPortfolioData && now < cacheExpiry) {
      return res.json({
        success: true,
        data: cachedPortfolioData
      });
    }

    // 1. Fetch settings (or fallback)
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings(initialSettings);
      await settings.save();
    }

    // 2. Fetch all other resources in parallel
    const [experiences, projects, skills] = await Promise.all([
      Experience.find({}).sort({ startDate: -1 }),
      Project.find({}).sort({ order: 1 }),
      Skill.find({}).sort({ order: 1 })
    ]);

    const data = {
      settings,
      experiences,
      projects,
      skills
    };

    // Cache the resolved data
    cachedPortfolioData = data;
    cacheExpiry = now + CACHE_TTL_MS;

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

// API endpoint route bindings
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/experiences', experienceRoutes);
router.use('/skills', skillRoutes);
router.use('/settings', settingsRoutes);
router.use('/messages', messageRoutes);
router.use('/media', mediaRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/portfolio', workspaceRoutes);
router.use('/billing', billingRoutes);
router.use('/super-admin', superAdminRoutes);

export function invalidatePortfolioCache() {
  cachedPortfolioData = null;
  cacheExpiry = 0;
}

export default router;
