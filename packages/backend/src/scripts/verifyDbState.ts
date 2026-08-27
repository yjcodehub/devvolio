import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User, Workspace, Portfolio } from '@devvolio/shared';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';

async function verifyState() {
  await connectDatabase();
  console.log('--- DATABASE STATE VERIFICATION ---');
  console.log('Users count:', await User.countDocuments());
  console.log('Workspaces count:', await Workspace.countDocuments());
  console.log('Portfolios count:', await Portfolio.countDocuments());
  console.log('Projects count:', await Project.countDocuments());
  console.log('Experiences count:', await Experience.countDocuments());
  console.log('Skills count:', await Skill.countDocuments());

  const users = await User.find({});
  users.forEach((u) => {
    console.log(`User: ${u.email} | Role: ${u.role} | Workspaces: ${JSON.stringify(u.workspaces)} | ActiveWS: ${u.activeWorkspaceId}`);
  });
  console.log('-----------------------------------');
  await mongoose.connection.close();
  process.exit(0);
}

verifyState().catch((e) => {
  console.error(e);
  process.exit(1);
});
