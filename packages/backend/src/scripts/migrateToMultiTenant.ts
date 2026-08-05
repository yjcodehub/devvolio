import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User, Workspace, Portfolio } from '@devvolio/shared';

// Old schemas to perform database transformation
const OldSettings = mongoose.models.OldSettings || mongoose.model('OldSettings', new mongoose.Schema({}, { strict: false }), 'settings');
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import { Certificate } from '../models/Certificate';
import { Resume } from '../models/Resume';

async function migrate() {
  console.log('[Migration] Connecting to database...');
  await connectDatabase();

  console.log('[Migration] Resolving default owner admin...');
  let owner = await User.findOne({ role: 'super_admin' });
  if (!owner) {
    owner = await User.findOne({});
  }

  if (!owner) {
    console.log('[Migration] Creating default admin...');
    // Create new Admin with required schema fields
    owner = new User({
      name: 'Yashkumar Jais',
      email: 'lakshraj2121@gmail.com',
      passwordHash: '$2b$10$Yn4K0hGzY23b5dD67eH8eO69eR70eT71eY72eU73eI74eO75eP76e', // Placeholder
      role: 'super_admin',
      provider: 'local',
      isEmailVerified: true,
      workspaces: []
    });
    await owner.save();
  }

  if (owner.role !== 'super_admin') {
    owner.role = 'super_admin';
    await owner.save();
  }

  console.log(`[Migration] Owner admin resolved: ${owner.email} (${owner._id})`);

  console.log('[Migration] Establishing workspace (tenant)...');
  let workspace = await Workspace.findOne({ slug: 'yash' });
  if (!workspace) {
    workspace = new Workspace({
      name: 'Yash Workspace',
      slug: 'yash',
      owner: owner._id,
      status: 'active'
    });
    await workspace.save();
  }
  console.log(`[Migration] Active Workspace: ${workspace.name} (${workspace._id})`);

  owner.workspaces = [workspace._id as any];
  owner.activeWorkspaceId = workspace._id as any;
  await owner.save();

  console.log('[Migration] Migrating Settings configuration to Portfolio...');
  const oldSettings = await OldSettings.findOne({});
  if (oldSettings) {
    const existingPortfolio = await Portfolio.findOne({ tenantId: workspace._id });
    if (!existingPortfolio) {
      const settingsObj = typeof oldSettings.toObject === 'function' ? oldSettings.toObject() : oldSettings;
      delete (settingsObj as any)._id;

      const newPortfolio = new Portfolio({
        ...settingsObj,
        tenantId: workspace._id,
        isPublished: true,
        createdBy: owner._id,
        updatedBy: owner._id,
        domainStatus: 'active'
      });
      await newPortfolio.save();
      console.log('[Migration] Created new Portfolio document successfully.');
    } else {
      console.log('[Migration] Portfolio document already exists. Skipping Settings migration.');
    }
  } else {
    console.log('[Migration] No old settings config found.');
  }

  const collections = [
    { model: Project, name: 'Projects' },
    { model: Experience, name: 'Experiences' },
    { model: Skill, name: 'Skills' },
    { model: Certificate, name: 'Certificates' },
    { model: Resume, name: 'Resumes' }
  ];

  for (const col of collections) {
    console.log(`[Migration] Checking ${col.name} to apply workspace scope...`);
    const res = await col.model.updateMany(
      { tenantId: { $exists: false } },
      {
        $set: {
          tenantId: workspace._id,
          createdBy: owner._id,
          updatedBy: owner._id
        }
      }
    );
    console.log(`[Migration] Scoped ${res.modifiedCount} documents in ${col.name}.`);
  }

  console.log('[Migration] Migration process complete! 🎉');
}

migrate()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Migration] Critical migration error:', err);
    mongoose.connection.close();
    process.exit(1);
  });
