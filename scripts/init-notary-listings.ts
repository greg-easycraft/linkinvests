import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment variables validation schema
const envSchema = z.object({
    QUEUES_MONITOR_URL: z.url('Invalid URL'),
    QUEUES_MONITOR_USERNAME: z.string('Invalid username').min(1, 'Username is required'),
    QUEUES_MONITOR_PASSWORD: z.string('Invalid password').min(1, 'Password is required'),
});

type Env = z.infer<typeof envSchema>;

(async () => {
    const { QUEUES_MONITOR_URL, QUEUES_MONITOR_USERNAME, QUEUES_MONITOR_PASSWORD } = getEnv();

    // Display configuration
    console.log('🔧 Configuration loaded:');
    console.log(`   📡 Queues Monitor URL: ${QUEUES_MONITOR_URL}`);
    console.log(`   👤 Username: ${QUEUES_MONITOR_USERNAME}`);
    console.log(`   🔐 Password: ${'*'.repeat(QUEUES_MONITOR_PASSWORD.length)}`);
    console.log('');

    // Create Basic Auth header
    const auth = Buffer.from(`${QUEUES_MONITOR_USERNAME}:${QUEUES_MONITOR_PASSWORD}`).toString('base64');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
    };

    // Pagination configuration
    const maxPage = 2250;
    const batchSize = 100;

    console.log(`Will process pages 1 to ${maxPage} in batches of ${batchSize}`);
    console.log(`Processing ${Math.ceil(maxPage / batchSize)} batches = ${Math.ceil(maxPage / batchSize)} total requests`);

    // Process all departments and page batches sequentially
    let successCount = 0;
    let errorCount = 0;
    const totalJobs = Math.ceil(maxPage / batchSize);

    const createNotaryListingsJob = buildCreateNotaryListingsJobBody(QUEUES_MONITOR_URL + '/scraping/jobs/notary-listings', headers);

    console.log('\\n🚀 Starting notary listings job creation...\\n');

    // Process pages in batches of 100
    for (let startPage = 1; startPage <= maxPage; startPage += batchSize) {
        const endPage = Math.min(startPage + batchSize - 1, maxPage);
        
        const success = await createNotaryListingsJob(startPage, endPage);

        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Summary
    console.log('🎉 Notary listings job creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successful jobs: ${successCount}`);
    console.log(`   ❌ Failed jobs: ${errorCount}`);
    console.log(`   📈 Total jobs: ${totalJobs}`);
    console.log(`   🎯 Success rate: ${((successCount / totalJobs) * 100).toFixed(1)}%`);

})();

function getEnv(): Env {
    const envResult = envSchema.safeParse({
        QUEUES_MONITOR_URL: process.env.QUEUES_MONITOR_URL,
        QUEUES_MONITOR_USERNAME: process.env.QUEUES_MONITOR_USERNAME || process.env.BASIC_AUTH_USERNAME,
        QUEUES_MONITOR_PASSWORD: process.env.QUEUES_MONITOR_PASSWORD || process.env.BASIC_AUTH_PASSWORD,
    });

    if (envResult.success) return envResult.data;

    console.error('❌ Environment validation failed:');
    envResult.error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
}

function buildCreateNotaryListingsJobBody(endpointUrl: string, headers: Record<string, string>) {
    return async function createNotaryListingsJob(startPage: number, endPage: number): Promise<boolean> {
        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    startPage,
                    endPage,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to create job for pages ${startPage}-${endPage}: ${response.status} ${response.statusText} - ${errorText}`);
                return false;
            }

            await response.text();
            console.log(`✅ Created notary listings job for pages ${startPage}-${endPage}`);
            return true;

        } catch (error) {
            console.error(`❌ Error creating job for pages ${startPage}-${endPage}:`, error);
            return false;
        }
    };
}