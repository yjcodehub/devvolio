import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User, Workspace, Portfolio } from '@devvolio/shared';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import { Message } from '../models/Message';
import { Resume } from '../models/Resume';
import { Feedback } from '../models/Feedback';
import { Certificate } from '../models/Certificate';
import { defaultAdmin, masterSkillsList } from '../config/defaultData';

async function initProduction() {
  console.log('[Prod Init] Connecting to Database...');
  await connectDatabase();

  const host = mongoose.connection.host || '';
  const dbName = mongoose.connection.name || '';
  console.log(`[Prod Init] Connected to Host: ${host} | DB: ${dbName}`);

  // 1. Wipe all existing collections
  console.log('[Prod Init] Dropping/Wiping all collections for clean production state...');
  const collections = await mongoose.connection.db?.listCollections().toArray() || [];
  for (const col of collections) {
    await mongoose.connection.db?.collection(col.name).deleteMany({});
    console.log(`  - Cleared collection: ${col.name}`);
  }

  // 2. Seed SuperAdmin user
  console.log('[Prod Init] Seeding SuperAdmin user...');
  const superAdminUser = new User({
    username: defaultAdmin.username || 'yjcodehub',
    email: defaultAdmin.email || 'yash@devvolio.in',
    password: defaultAdmin.password || 'Devvolio123$',
    role: 'superAdmin',
    isEmailVerified: true,
    workspaces: [],
    activeWorkspaceId: undefined
  });
  await superAdminUser.save();
  console.log(`  ✓ SuperAdmin created: ${superAdminUser.email} (Role: ${superAdminUser.role})`);

  // 3. Seed Master Skills Catalog
  console.log(`[Prod Init] Seeding ${masterSkillsList.length} Master Skills Catalog technologies...`);
  const masterSkillDocs = masterSkillsList.map((skill) => ({
    name: skill.name,
    category: skill.category,
    icon: skill.icon,
    isSystem: true
  }));
  await Skill.insertMany(masterSkillDocs);
  console.log(`  ✓ Seeded ${masterSkillDocs.length} master technologies across Languages, Frameworks, Databases, DevOps, Tools, Design, AI.`);

  // 4. Ensure all indexes
  console.log('[Prod Init] Creating schema indexes across all collections...');
  await Promise.all([
    User.createIndexes(),
    Workspace.createIndexes(),
    Portfolio.createIndexes(),
    Skill.createIndexes(),
    Project.createIndexes(),
    Experience.createIndexes(),
    Message.createIndexes(),
    Resume.createIndexes(),
    Feedback.createIndexes(),
    Certificate.createIndexes()
  ]);
  console.log('  ✓ All collection indexes synchronized successfully.');

  // 5. Verify Final State
  console.log('\n[Prod Init] Verifying Final Database State:');
  const userCount = await User.countDocuments();
  const skillCount = await Skill.countDocuments();
  const wsCount = await Workspace.countDocuments();
  const portCount = await Portfolio.countDocuments();
  const feedbackCount = await Feedback.countDocuments();

  console.log(`  - Users: ${userCount}`);
  console.log(`  - Master Skills Catalog: ${skillCount}`);
  console.log(`  - Workspaces: ${wsCount}`);
  console.log(`  - Portfolios: ${portCount}`);
  console.log(`  - Feedbacks: ${feedbackCount}`);

  console.log('\n🎉 Production Database "devvolio" on Cluster0 is ready for deployment!');
}

initProduction()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Prod Init] Fatal error:', err);
    mongoose.connection.close();
    process.exit(1);
  });
