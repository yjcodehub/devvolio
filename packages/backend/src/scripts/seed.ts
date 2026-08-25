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

  // Seed default admin user
  console.log('[Seeder] Creating admin user session credentials...');
  const admin = new User({
    ...defaultAdmin,
    role: 'super_admin',
    isEmailVerified: true
  });
  await admin.save();
  console.log(`[Seeder] Admin user seeded with email: ${admin.email}`);
  console.log(`[Seeder] DEFAULT PASSWORD: ${defaultAdmin.password}`);

  // Seed workspace
  console.log('[Seeder] Establishing default Workspace (tenant)...');
  const workspace = new Workspace({
    name: 'Yash Workspace',
    slug: 'yash',
    owner: admin._id,
    status: 'active'
  });
  await workspace.save();

  admin.workspaces = [workspace._id as any];
  admin.activeWorkspaceId = workspace._id as any;
  await admin.save();

  // Seed site settings / Portfolio
  console.log('[Seeder] Inserting Portfolio configuration...');
  const portfolio = new Portfolio({
    ...initialSettings,
    tenantId: workspace._id,
    isPublished: true,
    createdBy: admin._id,
    updatedBy: admin._id
  });
  await portfolio.save();

  // Seed experiences with tenant context
  if (initialExperiences.length > 0) {
    console.log('[Seeder] Seeding timeline experiences...');
    const experiences = initialExperiences.map((exp) => ({
      ...exp,
      tenantId: workspace._id,
      createdBy: admin._id,
      updatedBy: admin._id
    }));
    await Experience.insertMany(experiences);
  } else {
    console.log('[Seeder] Skipping timeline experiences (empty initial setup).');
  }

  // Seed projects with tenant context
  if (initialProjects.length > 0) {
    console.log('[Seeder] Seeding portfolio projects...');
    const projects = initialProjects.map((proj) => ({
      ...proj,
      tenantId: workspace._id,
      createdBy: admin._id,
      updatedBy: admin._id
    }));
    await Project.insertMany(projects);
  } else {
    console.log('[Seeder] Skipping portfolio projects (empty initial setup).');
  }

  // Seed skills with tenant context
  if (initialSkills.length > 0) {
    console.log('[Seeder] Seeding skill tags...');
    const skills = initialSkills.map((sk) => ({
      ...sk,
      tenantId: workspace._id,
      createdBy: admin._id,
      updatedBy: admin._id
    }));
    await Skill.insertMany(skills);
  } else {
    console.log('[Seeder] Skipping skill tags (empty initial setup).');
  }

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
