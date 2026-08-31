import mongoose, { Types } from 'mongoose';
import { connectDatabase } from '../config/database';
import { User, Workspace, Portfolio } from '@devvolio/shared';
import { Skill } from '../models/Skill';
import { masterSkillsList } from '../config/defaultData';

async function seedMasterSkillsAndMigrate() {
  console.log('[MasterSkills] Connecting to MongoDB...');
  await connectDatabase();

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection object is undefined.');
  const dbName = mongoose.connection.name || '';
  console.log(`[MasterSkills] Connected to Database: "${dbName}"`);

  // 1. Clean old skills collection & recreate clean indexes
  console.log('[MasterSkills] Resetting Master Skills Catalog collection...');
  await Skill.deleteMany({});

  try {
    await Skill.collection.dropIndexes();
  } catch (e: any) {
    // ignore if no indexes
  }

  // 2. Insert all master skills
  console.log(`[MasterSkills] Inserting ${masterSkillsList.length} global master skills...`);
  const insertedSkills = await Skill.insertMany(masterSkillsList);
  console.log(`[MasterSkills] Successfully inserted ${insertedSkills.length} master technologies!`);

  // Build a lookup map by lowercased skill name
  const skillMap = new Map<string, any>();
  insertedSkills.forEach((s) => skillMap.set(s.name.toLowerCase(), s));

  // 3. Populate default workspace skills for Yash and Vidhi if empty
  const workspaces = await Workspace.find({ slug: { $in: ['yash', 'vidhi'] } });
  
  for (const ws of workspaces) {
    const portfolio = await Portfolio.findOne({ tenantId: ws._id });
    if (portfolio) {
      const defaultSkillNames = ws.slug === 'yash'
        ? ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'MongoDB', 'Docker', 'Git & GitHub']
        : ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing & Prototyping', 'HTML5', 'CSS3', 'React.js', 'Responsive Design'];

      const workspaceSkills = defaultSkillNames
        .map((name, index) => {
          const masterSkill = skillMap.get(name.toLowerCase());
          if (!masterSkill) return null;
          return {
            skillId: masterSkill._id,
            proficiency: 90 - (index * 2),
            featured: index < 6,
            order: index + 1
          };
        })
        .filter(Boolean);

      portfolio.skills = workspaceSkills as any;
      await portfolio.save();
      console.log(`[MasterSkills] Linked ${workspaceSkills.length} master skills to workspace "${ws.name}" (${ws.slug})`);
    }
  }

  console.log('\n--- VERIFICATION ---');
  console.log('Total Master Skills in Catalog:', await Skill.countDocuments());
  const sample = await Skill.find({}).limit(5);
  sample.forEach((s) => console.log(`  - [${s.category}] ${s.name} (${s.icon})`));

  console.log('\n🎉 Master Skills Catalog Seeded & Workspaces Linked Successfully!');
}

seedMasterSkillsAndMigrate()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[MasterSkills] Error:', err);
    mongoose.connection.close();
    process.exit(1);
  });

