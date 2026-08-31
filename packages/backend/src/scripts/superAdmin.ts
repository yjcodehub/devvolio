import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '@devvolio/shared';
import {
    defaultAdmin,
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

    // Find and update existing SuperAdmin user, or create if not exists
    const email = process.argv[2] || defaultAdmin.email || 'yash@devvolio.in';
    const newPassword = process.argv[3] || defaultAdmin.password;
    const username = defaultAdmin.username || 'yjcodehub';

    console.log(`[Seeder] Looking for SuperAdmin with email: ${email}...`);
    let admin = await User.findOne({ email });

    if (admin) {
        console.log(`[Seeder] Existing SuperAdmin found. Updating credentials & role...`);
        admin.username = username || admin.username;
        if (newPassword) {
            admin.password = newPassword; // Trigger Mongoose pre-save bcrypt hashing
        }
        admin.role = 'superAdmin';
        admin.isEmailVerified = true;
        await admin.save();
        console.log(`[Seeder] ✓ SuperAdmin (${email}) updated successfully.`);
    } else {
        console.log(`[Seeder] SuperAdmin not found. Creating new SuperAdmin account...`);
        admin = new User({
            username,
            name: 'Super Admin',
            email,
            password: newPassword,
            role: 'superAdmin',
            isEmailVerified: true,
            workspaces: [],
            activeWorkspaceId: undefined
        });
        await admin.save();
        console.log(`[Seeder] ✓ SuperAdmin (${email}) created successfully.`);
    }

    console.log(`[Seeder] SuperAdmin has no workspace/portfolio. Workspaces & Portfolios are provisioned on user registration.`);
    console.log(`[Seeder] Database "${dbName}" operation completed successfully! 🎉`);
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
