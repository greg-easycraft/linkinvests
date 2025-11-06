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

type Env = z.infer<typeof envSchema>;


(async () => {
    const { QUEUES_MONITOR_URL, QUEUES_MONITOR_USERNAME, QUEUES_MONITOR_PASSWORD, ENDPOINT } = getEnv();

    // Display configuration
    console.log('🔧 Configuration loaded:');
    console.log(`   📡 Queues Monitor URL: ${QUEUES_MONITOR_URL}${ENDPOINT}`);
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
        .from({ length: 95 }, (_, i) => i + 1);
    const months = generateMonthsForYears(2024, 2025);
    const energyClasses = ['F', 'G'];
    console.log(`Generated ${months.length} months for processing`);
    console.log(`Will process 2 classes x ${allDepartments.length} departments x ${months.length} months = ${2 * allDepartments.length * months.length} total requests`);

    // Process all departments and months sequentially
    let successCount = 0;
    let errorCount = 0;
    const totalJobs = allDepartments.length * months.length;

    const createEnergySievesJob = buildCreateEnergySievesJobBody(QUEUES_MONITOR_URL + ENDPOINT, headers);

    console.log('\n🚀 Starting energy sieves job creation...\n');

    for (const department of allDepartments) {
        console.log(`📍 Processing department ${department}/${allDepartments.length}...`);
        for (const month of months) {
            for (const energyClass of energyClasses) {
                const success = await createEnergySievesJob(department, month.sinceDate, month.beforeDate, [energyClass]);

                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }

                await new Promise(resolve => setTimeout(resolve, 40));
            }
        }

        console.log(`✅ Completed department ${department}\n`);
    }

    // Summary
    console.log('🎉 Energy sieves job creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successful jobs: ${successCount}`);
    console.log(`   ❌ Failed jobs: ${errorCount}`);
    console.log(`   📈 Total jobs: ${totalJobs}`);
    console.log(`   🎯 Success rate: ${((successCount / totalJobs) * 100).toFixed(1)}%`);

})();

function getEnv(): Env {
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

function generateMonthsForYears(startYear: number, endYear: number): { year: number, month: number, sinceDate: string, beforeDate: string }[] {
    const months: { year: number, month: number, sinceDate: string, beforeDate: string }[] = [];
    for (let year = startYear; year <= endYear; year++) {
        for (let month = 1; month <= 12; month++) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of the month

            months.push({
                year,
                month,
                sinceDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
                beforeDate: endDate.toISOString().split('T')[0]
            });
        }
    }
    return months;
};

function buildCreateEnergySievesJobBody(endpointUrl: string, headers: Record<string, string>) {
    return async function createEnergySievesJob(departmentId: number, sinceDate: string, beforeDate: string, energyClasses: string[]): Promise<boolean> {
        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    departmentId,
                    sinceDate,
                    beforeDate,
                    energyClasses
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to create job for department ${departmentId}, month ${sinceDate}-${beforeDate}: ${response.status} ${response.statusText} - ${errorText}`);
                return false;
            }

            await response.text();
            console.log(`✅ Created energy sieves job for department ${departmentId}, period ${sinceDate} to ${beforeDate}`);
            return true;

        } catch (error) {
            console.error(`❌ Error creating job for department ${departmentId}, month ${sinceDate}-${beforeDate}:`, error);
            return false;
        }
    };
}