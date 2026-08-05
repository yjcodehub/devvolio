import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import { Settings } from '../models/Settings';
import {
  defaultAdmin,
  initialSettings,
  initialExperiences,
  initialProjects,
  initialSkills
} from '../config/defaultData';

async function seed() {
  console.log('[Seeder] Initializing database migration...');
  // Note: connectDatabase now also auto-seeds if collections are empty, but since we wipe them first, 
  // manual seed will force a clean state insertion anyway.
  await connectDatabase();

  // Clear all collections
  console.log('[Seeder] Wiping existing data schemas...');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Experience.deleteMany({});
  await Skill.deleteMany({});
  await Settings.deleteMany({});

  // Seed default admin user
  console.log('[Seeder] Creating admin user session credentials...');
  const admin = new User(defaultAdmin);
  await admin.save();
  console.log(`[Seeder] Admin user seeded with email: ${admin.email}`);
  console.log(`[Seeder] DEFAULT PASSWORD (Change this in production settings): ${defaultAdmin.password}`);

  // Seed site settings
  console.log('[Seeder] Inserting site configurations settings...');
  const settings = new Settings(initialSettings);
  await settings.save();

  // Seed experiences
  console.log('[Seeder] Seeding timeline experiences...');
  await Experience.insertMany(initialExperiences);

  // Seed projects
  console.log('[Seeder] Seeding portfolio projects...');
  await Project.insertMany(initialProjects);

  // Seed skills
  console.log('[Seeder] Seeding skill tags...');
  await Skill.insertMany(initialSkills);

  console.log('[Seeder] Database successfully seeded! 🎉');
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
