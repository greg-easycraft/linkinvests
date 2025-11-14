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

    const allDepartments = Array
        .from({ length: 95 }, (_, i) => i + 1);
    const months = generateMonthsFromOneYearAgo();
    console.log(`Generated ${months.length} months for processing (from one year ago to now)`);
    console.log(`Will process ${allDepartments.length} departments x ${months.length} months = ${allDepartments.length * months.length} total requests`);

    // Process all departments and weeks sequentially
    let successCount = 0;
    let errorCount = 0;
    const totalJobs = allDepartments.length * months.length;

    const createLiquidationJob = buildCreateLiquidationJobBody(QUEUES_MONITOR_URL + '/sourcing/jobs/failing-companies', headers);

    console.log('\\n🚀 Starting liquidation job creation...\\n');

    for (const department of allDepartments) {
        console.log(`📍 Processing department ${department}/${allDepartments.length}...`);
        for (const month of months) {
            const success = await createLiquidationJob(department, month.sinceDate, month.beforeDate);

            if (success) {
                successCount++;
            } else {
                errorCount++;
            }

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 40));
        }

        console.log(`✅ Completed department ${department}\\n`);
    }

    // Summary
    console.log('🎉 Liquidation job creation completed!');
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

function generateMonthsFromOneYearAgo(): { month: number, sinceDate: string, beforeDate: string }[] {
    const months: { month: number, sinceDate: string, beforeDate: string }[] = [];
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Start from the Monday of the week containing the one-year-ago date
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 0 = Sunday, 1 = Monday
    startDate.setDate(startDate.getDate() + mondayOffset);

    let currentDate = new Date(startDate);
    let month = 1;

    while (currentDate <= now) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sunday of the same week

        // Don't go beyond today
        if (weekEnd > now) {
            weekEnd.setTime(now.getTime());
        }

        months.push({
            month,
            sinceDate: weekStart.toISOString().split('T')[0], // YYYY-MM-DD format
            beforeDate: weekEnd.toISOString().split('T')[0]
        });

        // Move to next week (next Monday)
        currentDate.setDate(currentDate.getDate() + 30);
        month++;
    }

    return months;
}

function buildCreateLiquidationJobBody(endpointUrl: string, headers: Record<string, string>) {
    return async function createLiquidationJob(departmentId: number, sinceDate: string, beforeDate: string): Promise<boolean> {
        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    departmentId,
                    sinceDate,
                    beforeDate
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to create job for department ${departmentId}, week ${sinceDate}-${beforeDate}: ${response.status} ${response.statusText} - ${errorText}`);
                return false;
            }

            await response.text();
            console.log(`✅ Created liquidation job for department ${departmentId}, period ${sinceDate} to ${beforeDate}`);
            return true;

        } catch (error) {
            console.error(`❌ Error creating job for department ${departmentId}, week ${sinceDate}-${beforeDate}:`, error);
            return false;
        }
    };
}