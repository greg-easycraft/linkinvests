// Configuration for the queues-monitor service
const QUEUES_MONITOR_URL = 'https://bull.easycraft.cloud';
const ENDPOINT = '/sourcing/jobs/energy-sieves';
const USERNAME = 'admin';
const PASSWORD = 'secure_password_here';

// Create Basic Auth header
const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
};

(async () => {
    const allDepartments = Array
        .from({ length: 95 }, (_, i) => i + 1);
    const months = generateMonthsForYears(2024, 2025);
    const energyClasses = ['F', 'G'];
    console.log(`Generated ${months.length} months for processing`);
    console.log(`Will process ${allDepartments.length} departments x ${months.length} months = ${allDepartments.length * months.length} total requests`);

    // Process all departments and months sequentially
    let successCount = 0;
    let errorCount = 0;
    const totalJobs = allDepartments.length * months.length;

    const createEnergySievesJob = buildCreateEnergySievesJobBody(QUEUES_MONITOR_URL + ENDPOINT, headers);

    console.log('\n🚀 Starting energy sieves job creation...\n');

    for (const department of allDepartments) {
        console.log(`📍 Processing department ${department}/${allDepartments.length}...`);
        for (const month of months) {
            console.log(`  📅 Processing ${month.year}-${month.month.toString().padStart(2, '0')}...`);
            for (const energyClass of energyClasses) {
                const success = await createEnergySievesJob(department, month.sinceDate, month.beforeDate, [energyClass]);

                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }

                console.log(`    ⏳ Waiting 100 ms before next request...`);
                await new Promise(resolve => setTimeout(resolve, 100));
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