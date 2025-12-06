import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../schema/auth.schema.js';

config({ path: '../../packages/api/.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@linkinvests.com';

  try {
    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingUsers.length > 0) {
      // Update existing user to admin
      await db
        .update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, adminEmail));
      console.log(`Updated existing user to admin: ${adminEmail}`);
    } else {
      // Create new admin user
      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: 'Admin',
        email: adminEmail,
        emailVerified: true,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created admin user: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedAdmin();
