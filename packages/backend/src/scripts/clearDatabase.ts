import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';

async function clearDatabase() {
  console.log('[ClearDB] Connecting to database...');
  await connectDatabase();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection object unavailable.');
  }

  const host = mongoose.connection.host || '';
  const dbName = mongoose.connection.name || '';
  console.log(`[ClearDB] Connected to Host: ${host} | Database: ${dbName}`);

  const collections = await db.collections();
  console.log(`[ClearDB] Found ${collections.length} collection(s) in "${dbName}".`);

  for (const collection of collections) {
    const collectionName = collection.collectionName;
    console.log(`[ClearDB] Dropping collection "${collectionName}"...`);
    try {
      await collection.drop();
      console.log(`[ClearDB] Successfully dropped collection "${collectionName}".`);
    } catch (err: any) {
      if (err.code === 26 || err.message?.includes('ns not found')) {
        console.log(`[ClearDB] Collection "${collectionName}" already empty/dropped.`);
      } else {
        console.warn(`[ClearDB] Warning dropping collection "${collectionName}":`, err.message);
        console.log(`[ClearDB] Falling back to deleteMany({}) on "${collectionName}"...`);
        await collection.deleteMany({});
      }
    }
  }

  console.log(`[ClearDB] All collections in database "${dbName}" have been wiped clean! 🎉`);
}

clearDatabase()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[ClearDB] Error wiping database:', err);
    mongoose.connection.close();
    process.exit(1);
  });
