// Check opportunities in the database
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://linkinvest:linkinvest@localhost:5432/linkinvest';

async function checkOpportunities() {
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Count total opportunities
    const countResult = await client.query('SELECT COUNT(*) as count FROM opportunity');
    console.log(`\n📊 Total opportunities: ${countResult.rows[0].count}`);

    // Count opportunities with SIRET
    const siretCountResult = await client.query('SELECT COUNT(*) as count FROM opportunity WHERE siret IS NOT NULL');
    console.log(`📊 Opportunities with SIRET: ${siretCountResult.rows[0].count}`);

    // Get recent opportunities
    const recentResult = await client.query(`
      SELECT id, name as label, siret, address, zip_code, department, latitude, longitude, type, status, created_at
      FROM opportunity
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (recentResult.rows.length > 0) {
      console.log('\n📋 Recent opportunities:');
      recentResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. ID: ${row.id}`);
        console.log(`   Name: ${row.label}`);
        console.log(`   SIRET: ${row.siret || 'N/A'}`);
        console.log(`   Address: ${row.address || 'N/A'}`);
        console.log(`   Location: ${row.zip_code}, Dept ${row.department}`);
        console.log(`   Coordinates: ${row.latitude}, ${row.longitude}`);
        console.log(`   Type: ${row.type}`);
        console.log(`   Created: ${row.created_at}`);
      });
    } else {
      console.log('\n⚠️  No opportunities found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOpportunities();
