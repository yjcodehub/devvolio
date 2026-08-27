import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '@devvolio/shared';

async function resetPassword() {
  await connectDatabase();
  const email = 'yash@devvolio.in';
  const newPassword = 'Devvolio123$';

  let user = await User.findOne({ email });
  if (!user) {
    console.log(`User ${email} not found. Creating superAdmin...`);
    user = new User({
      username: 'yjcodehub',
      name: 'Yashkumar Jais',
      email: email,
      password: newPassword,
      role: 'superAdmin',
      provider: 'local',
      isEmailVerified: true
    });
  } else {
    console.log(`Updating password for ${email}...`);
    user.password = newPassword;
    user.role = 'superAdmin';
  }

  await user.save();
  console.log(`[Success] Password for ${email} updated to: ${newPassword}`);
}

resetPassword()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Error] Failed to reset password:', err);
    mongoose.connection.close();
    process.exit(1);
  });
