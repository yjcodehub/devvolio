import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User, Workspace, Portfolio } from '@devvolio/shared';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import {
  defaultAdmin,
  initialSettings,
  initialExperiences,
  initialProjects,
  initialSkills
} from '../config/defaultData';

async function seed() {
  console.log('[Seeder] Initializing database migration...');
  await connectDatabase();

  const host = mongoose.connection.host || '';
  const dbName = mongoose.connection.name || '';
  const allowForceProd = process.argv.includes('--force-prod');

  const isProductionTarget = host.includes('cluster0') || dbName === 'devvolio' || process.env.NODE_ENV === 'production';
  if (isProductionTarget && !allowForceProd) {
    console.error(
      `\n[SAFETY ABORT] Refusing to seed target host "${host}" and database "${dbName}" in NODE_ENV="${process.env.NODE_ENV}".\n` +
      `Cluster0 and "devvolio" database are reserved for Production Env.\n` +
      `To seed local environment, ensure MONGO_URI points to Cluster1 (e.g., devvolio_dev).\n` +
      `If you explicitly intend to overwrite production data, pass the --force-prod flag.\n`
    );
    process.exit(1);
  }

  // Clear all collections
  console.log(`[Seeder] Wiping existing data schemas on Host: ${host} | DB: ${dbName}...`);
  await User.deleteMany({});
  await Workspace.deleteMany({});
  await Portfolio.deleteMany({});
  await Project.deleteMany({});
  await Experience.deleteMany({});
  await Skill.deleteMany({});

  // Seed default SuperAdmin user (No tenant workspace or portfolio assigned)
  console.log('[Seeder] Creating SuperAdmin user session credentials...');
  const admin = new User({
    ...defaultAdmin,
    role: defaultAdmin.role || 'superAdmin',
    isEmailVerified: true,
    workspaces: [],
    activeWorkspaceId: undefined
  });
  await admin.save();
  console.log(`[Seeder] SuperAdmin user seeded with email: ${admin.email}`);
  console.log(`[Seeder] DEFAULT PASSWORD: ${defaultAdmin.password}`);
  console.log('[Seeder] SuperAdmin has no workspace/portfolio. Workspaces & Portfolios are provisioned on user registration.');

  console.log(`[Seeder] Database "${dbName}" on Cluster1 successfully seeded! 🎉`);
}

seed()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Seeder] Fatal seeding error:', err);
    mongoose.connection.close();
    process.exit(1);
  });
