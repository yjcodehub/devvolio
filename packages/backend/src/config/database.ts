import mongoose from 'mongoose';
import { env } from './env';
import { Settings } from '../models/Settings';
import { Experience } from '../models/Experience';
import { Project } from '../models/Project';
import { Skill } from '../models/Skill';
import { User } from '../models/User';
import {
  defaultAdmin,
  initialSettings,
  initialExperiences,
  initialProjects,
  initialSkills
} from './defaultData';

async function seedDefaultsIfEmpty() {
  try {
    // Check Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      console.log('[Auto-Seed] Settings collection is empty. Seeding defaults...');
      await Settings.create(initialSettings);
    }

    // Check Experience
    const expCount = await Experience.countDocuments();
    if (expCount === 0) {
      console.log('[Auto-Seed] Experience collection is empty. Seeding defaults...');
      await Experience.insertMany(initialExperiences);
    }

    // Check Project
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('[Auto-Seed] Project collection is empty. Seeding defaults...');
      await Project.insertMany(initialProjects);
    }

    // Check Skill
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      console.log('[Auto-Seed] Skill collection is empty. Seeding defaults...');
      await Skill.insertMany(initialSkills);
    }

    // Check Admin user
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seed] User collection is empty. Seeding default admin user...');
      await User.create(defaultAdmin);
    }
  } catch (err) {
    console.error('[Auto-Seed] Error checking/seeding defaults:', err);
  }
}

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully to Portfolio DB');
    // Note: Auto-seeding of single-tenant settings is disabled for Multi-Tenant SaaS.
    // await seedDefaultsIfEmpty();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost/disconnected');
  });
}
export default connectDatabase;
