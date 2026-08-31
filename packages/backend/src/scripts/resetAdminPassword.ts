import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '@devvolio/shared';

async function resetPassword() {
  await connectDatabase();

  // Read parameters dynamically from CLI arguments or environment variables to prevent secret leakage
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'yash@devvolio.in';
  const newPassword = process.argv[3] || process.env.ADMIN_RESET_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || 'Devvolio123$';

  let user = await User.findOne({ email });
  if (!user) {
    console.log(`User "${email}" not found. Creating superAdmin user...`);
    user = new User({
      username: email.split('@')[0],
      name: 'Super Admin',
      email: email,
      password: newPassword,
      role: 'superAdmin',
      provider: 'local',
      isEmailVerified: true
    });
  } else {
    console.log(`Updating password for "${email}"...`);
    user.password = newPassword;
    user.role = 'superAdmin';
  }

  await user.save();
  console.log(`[Success] Password for ${email} has been updated successfully.`);
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
