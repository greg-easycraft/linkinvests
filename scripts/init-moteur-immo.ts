import { config } from 'dotenv';
import { z } from 'zod';
import { isBefore, parseISO, subWeeks } from 'date-fns';

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
    const weeks = generateWeeksForYears(2024, 2025);
    console.log(`Generated ${weeks.length} weeks for processing`);

    const today = new Date();
    const twelveWeeksAgo = subWeeks(today, 12);
    // Process all departments and weeks sequentially
    let successCount = 0;
    let errorCount = 0;
    const totalJobs = allDepartments.length * weeks.length;

    const createMoteurImmoJob = buildCreateMoteurImmoJobBody(QUEUES_MONITOR_URL + '/sourcing/jobs/listings', headers);

    console.log('\n🚀 Starting energy sieves job creation...\n');

    for (const department of allDepartments) {
        console.log(`📍 Processing department ${department}/${allDepartments.length}...`);
        for (const week of weeks) {
            const weekDate = parseISO(week.sinceDate);
            const energySievesOnly = isBefore(weekDate, twelveWeeksAgo);
            const success = await createMoteurImmoJob(department, week.sinceDate, week.beforeDate, energySievesOnly);

            if (success) {
                successCount++;
            } else {
                errorCount++;
            }

            await new Promise(resolve => setTimeout(resolve, 10));
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

function generateWeeksForYears(startYear: number, endYear: number): { year: number, week: number, sinceDate: string, beforeDate: string }[] {
    const weeks: { year: number, week: number, sinceDate: string, beforeDate: string }[] = [];

    // Start from the first Monday of the start year
    const startDate = new Date(startYear, 0, 1);
    const firstMonday = new Date(startDate);
    const dayOfWeek = firstMonday.getDay();
    if (dayOfWeek !== 1) { // If not Monday
        firstMonday.setDate(firstMonday.getDate() + (8 - dayOfWeek) % 7);
    }

    // End at the last day of the end year
    const endDate = new Date(endYear, 11, 31);

    let currentWeekStart = new Date(firstMonday);
    let weekNumber = 1;

    while (currentWeekStart <= endDate) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6); // Sunday of the same week

        // Only include complete weeks that don't extend significantly beyond the end date
        if (currentWeekStart.getFullYear() <= endYear) {
            weeks.push({
                year: currentWeekStart.getFullYear(),
                week: weekNumber,
                sinceDate: currentWeekStart.toISOString().split('T')[0], // YYYY-MM-DD format
                beforeDate: (currentWeekEnd > endDate ? endDate : currentWeekEnd).toISOString().split('T')[0]
            });
        }

        // Move to next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekNumber++;

        // Reset week number at the start of each year
        if (currentWeekStart.getMonth() === 0 && currentWeekStart.getDate() <= 7) {
            weekNumber = 1;
        }
    }

    return weeks;
};

function buildCreateMoteurImmoJobBody(endpointUrl: string, headers: Record<string, string>) {
    return async function createMoteurImmoJob(departmentId: number, afterDate: string, beforeDate: string, energySievesOnly = false): Promise<boolean> {
        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    departmentCode: departmentId.toString().padStart(2, '0'),
                    afterDate,
                    beforeDate,
                    maxEnergyGrade: energySievesOnly ? 'E' : undefined,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to create job for department ${departmentId}, period ${afterDate}-${beforeDate}: ${response.status} ${response.statusText} - ${errorText}`);
                return false;
            }

            await response.text();
            console.log(`✅ Created energy sieves job for department ${departmentId}, period ${afterDate} to ${beforeDate}`);
            return true;

        } catch (error) {
            console.error(`❌ Error creating job for department ${departmentId}, period ${afterDate}-${beforeDate}:`, error);
            return false;
        }
    };
}