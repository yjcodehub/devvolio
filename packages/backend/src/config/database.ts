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
    const targetUri = env.NODE_ENV === 'test' && env.MONGO_URI_TEST ? env.MONGO_URI_TEST : env.MONGO_URI;
    await mongoose.connect(targetUri);
    
    const host = mongoose.connection.host || 'unknown-host';
    const dbName = mongoose.connection.name || 'unknown-db';

    console.log(`[MongoDB] Connected successfully to Host/Cluster: ${host} | Database: ${dbName}`);

    // Warning guard if development server connects to production cluster0 or devvolio DB
    const isProductionTarget = host.includes('cluster0') || dbName === 'devvolio';
    if (env.NODE_ENV === 'development' && isProductionTarget) {
      console.warn(
        '\n====================================================================\n' +
        '[WARNING] Local development server is connected to PRODUCTION target!\n' +
        `Target Host: ${host} | Database: ${dbName}\n` +
        'Recommended: Point MONGO_URI in .env to Cluster1 (devvolio_dev)\n' +
        '====================================================================\n'
      );
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost/disconnected');
  });
}
export default connectDatabase;
