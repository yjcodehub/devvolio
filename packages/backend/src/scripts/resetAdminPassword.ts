import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '@devvolio/shared';

async function resetPassword() {
  await connectDatabase();
  const email = 'lakshraj2121@gmail.com';
  const newPassword = 'AdminYash97!';

  let user = await User.findOne({ email });
  if (!user) {
    console.log(`User ${email} not found. Creating super_admin...`);
    user = new User({
      username: 'yjcodehub',
      name: 'Yashkumar Jais',
      email: email,
      password: newPassword,
      role: 'super_admin',
      provider: 'local',
      isEmailVerified: true
    });
  } else {
    console.log(`Updating password for ${email}...`);
    user.password = newPassword;
    user.role = 'super_admin';
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
