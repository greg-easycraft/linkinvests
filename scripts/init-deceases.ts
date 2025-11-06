import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment variables validation schema
const envSchema = z.object({
    QUEUES_MONITOR_URL: z.url('Invalid URL'),
    QUEUES_MONITOR_USERNAME: z.string('Invalid username').min(1, 'Username is required'),
    QUEUES_MONITOR_PASSWORD: z.string('Invalid password').min(1, 'Password is required'),
    ENDPOINT: z.string('Invalid endpoint').min(1, 'Endpoint is required'),
});

const FILE_PATHES = [
    'deceases/Deces_2025_M01.csv',
    'deceases/Deces_2025_M02.csv',
    'deceases/Deces_2025_M03.csv',
    'deceases/Deces_2025_M04.csv',
    'deceases/Deces_2025_M05.csv',
    'deceases/Deces_2025_M06.csv',
    'deceases/Deces_2025_M07.csv',
    'deceases/Deces_2025_M08.csv',
    'deceases/Deces_2025_M09.csv',
    'deceases/Deces_2025_M10.csv',
    'deceases/Deces_2024.csv',
];

(async () => {
    const { QUEUES_MONITOR_URL, QUEUES_MONITOR_USERNAME, QUEUES_MONITOR_PASSWORD, ENDPOINT } = getEnv();

    // Display configuration
    console.log('🔧 Configuration loaded:');
    console.log(`   📡 Queues Monitor URL: ${QUEUES_MONITOR_URL}${ENDPOINT}`);
    console.log(`   👤 Username: ${QUEUES_MONITOR_USERNAME}`);
    console.log(`   🔐 Password: ${'*'.repeat(QUEUES_MONITOR_PASSWORD.length)}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const totalJobs = FILE_PATHES.length;

    // Create Basic Auth header
    const auth = Buffer.from(`${QUEUES_MONITOR_USERNAME}:${QUEUES_MONITOR_PASSWORD}`).toString('base64');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
    };

    const createDeceasesCsvProcessJob = buildCreateDeceasesCsvProcessJob(QUEUES_MONITOR_URL + ENDPOINT, headers);

    console.log('\n🚀 Starting energy sieves job creation...\n');

    for (const filePath of FILE_PATHES) {
        console.log(`📍 Processing file ${filePath}...`);
        const success = await createDeceasesCsvProcessJob(filePath);

        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        console.log(`✅ Completed file ${filePath}\n`);
    }

    // Summary
    console.log('🎉 Energy sieves job creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successful jobs: ${successCount}`);
    console.log(`   ❌ Failed jobs: ${errorCount}`);
    console.log(`   📈 Total jobs: ${totalJobs}`);
    console.log(`   🎯 Success rate: ${((successCount / totalJobs) * 100).toFixed(1)}%`);

})();

function buildCreateDeceasesCsvProcessJob(endpointUrl: string, headers: Record<string, string>) {
    return async function createDeceasesCsvProcessJob(filePath: string): Promise<boolean> {
        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    filePath
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to create job for file ${filePath}: ${response.status} ${response.statusText} - ${errorText}`);
                return false;
            }

            await response.text();
            console.log(`✅ Created job for file ${filePath}`);
            return true;

        } catch (error) {
            console.error(`❌ Error creating job for file ${filePath}:`, error);
            return false;
        }
    };
}

function getEnv(): z.infer<typeof envSchema> {
    const envResult = envSchema.safeParse({
        QUEUES_MONITOR_HOST: process.env.QUEUES_MONITOR_HOST,
        QUEUES_MONITOR_PORT: process.env.QUEUES_MONITOR_PORT,
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