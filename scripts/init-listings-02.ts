import { config } from 'dotenv';
import { z } from 'zod';
import { subMonths } from 'date-fns';

// Load environment variables
config();

// Environment variables validation schema
const envSchema = z.object({
    QUEUES_MONITOR_URL: z.url('Invalid URL'),
    QUEUES_MONITOR_USERNAME: z.string('Invalid username').min(1, 'Username is required'),
    QUEUES_MONITOR_PASSWORD: z.string('Invalid password').min(1, 'Password is required'),
});

type Env = z.infer<typeof envSchema>;


const today = new Date();

const MONTHS_PERIOD = [3, 6, 9, 12];
const MONTHS_STEP = 3;


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

    const allDepartments = Array
        .from({ length: 95 }, (_, i) => i + 1).reverse();

    // Process all departments and weeks sequentially
    let successCount = 0;
    let errorCount = 0;

    const createMoteurImmoJob = buildCreateMoteurImmoJobBody(QUEUES_MONITOR_URL + '/sourcing/jobs/listings', headers);

    console.log('\n🚀 Starting listings job creation...\n');

    for (const monthsPeriod of MONTHS_PERIOD) {
        const beforeDate = subMonths(today, monthsPeriod);
        const afterDate = subMonths(beforeDate, MONTHS_STEP);
            for (const department of allDepartments) {
                const success = await createMoteurImmoJob({
                    departmentId: department,
                    afterDate: afterDate.toISOString().split('T')[0],
                    beforeDate: beforeDate.toISOString().split('T')[0],
                });

                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }

                //console.log({ afterDate, beforeDate, energyClass, department });
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        console.log(`✅ Completed months period ${monthsPeriod}\n`);
    }
    

    // Summary
    console.log('🎉 Listings job creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successful jobs: ${successCount}`);
    console.log(`   ❌ Failed jobs: ${errorCount}`);

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

function buildCreateMoteurImmoJobBody(endpointUrl: string, headers: Record<string, string>) {
    return async function createMoteurImmoJob({
        departmentId,
        afterDate,
        beforeDate,
    }: { departmentId: number, afterDate: string, beforeDate: string }): Promise<boolean> {
        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    departmentCode: departmentId.toString().padStart(2, '0'),
                    afterDate,
                    beforeDate,
                    propertyTypes: ['land'],
                    usePublicationDate: true,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to create job for department ${departmentId}, period ${afterDate}-${beforeDate}: ${response.status} ${response.statusText} - ${errorText}`);
                return false;
            }

            await response.text();
            //console.log(`✅ Created listings job for department ${departmentId}, period ${afterDate} to ${beforeDate}, energy class ${energyClass}`);
            return true;

        } catch (error) {
            console.error(`❌ Error creating job for department ${departmentId}, period ${afterDate}-${beforeDate}:`, error);
            return false;
        }
    };
}