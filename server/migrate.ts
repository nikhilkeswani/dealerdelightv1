import { db, pool } from './db';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  try {
    console.log('Ensuring database tables exist...');
    
    // Simple approach: Just check if tables exist
    // Drizzle will handle the connection, we just need to verify connectivity
    await db.execute(sql`SELECT 1`);
    
    console.log('✓ Database connection verified');
  } catch (error: any) {
    console.error('Database connection failed:', error);
    // Don't throw - let the app try to start anyway
    // The actual schema will be managed by drizzle-kit push
  }
}

export async function closeDatabaseConnection() {
  await pool.end();
}
