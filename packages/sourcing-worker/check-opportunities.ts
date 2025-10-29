// Check opportunities in the database using Drizzle
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { domainSchema } from '@linkinvests/db';
import { desc } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://linkinvests:linkinvests@localhost:5432/linkinvests';

async function checkOpportunities() {
  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema: domainSchema });

  try {
    console.log('✅ Connected to database');

    // Count total opportunities
    const allOpportunities = await db.select().from(domainSchema.opportunities);
    console.log(`\n📊 Total opportunities: ${allOpportunities.length}`);

    // Count opportunities with SIRET
    const withSiret = allOpportunities.filter(o => o.siret !== null);
    console.log(`📊 Opportunities with SIRET: ${withSiret.length}`);

    // Get recent opportunities
    const recentOpportunities = await db
      .select()
      .from(domainSchema.opportunities)
      .orderBy(desc(domainSchema.opportunities.createdAt))
      .limit(10);

    if (recentOpportunities.length > 0) {
      console.log('\n📋 Recent opportunities:');
      recentOpportunities.forEach((row, index) => {
        console.log(`\n${index + 1}. ID: ${row.id}`);
        console.log(`   Name: ${row.label}`);
        console.log(`   SIRET: ${row.siret || 'N/A'}`);
        console.log(`   Address: ${row.address || 'N/A'}`);
        console.log(`   Location: ${row.zipCode}, Dept ${row.department}`);
        console.log(`   Coordinates: ${row.latitude}, ${row.longitude}`);
        console.log(`   Type: ${row.type}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Created: ${row.createdAt}`);
      });
    } else {
      console.log('\n⚠️  No opportunities found in database');
    }

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await client.end();
  }
}

checkOpportunities();
