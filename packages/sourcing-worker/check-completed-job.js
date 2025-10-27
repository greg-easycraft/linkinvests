// Check completed job details
const { Queue } = require('bullmq');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisHost = new URL(redisUrl).hostname;
const redisPort = parseInt(new URL(redisUrl).port || '6379');

const queue = new Queue('SOURCE_COMPANY_BUILDINGS', {
  connection: {
    host: redisHost,
    port: redisPort,
  },
});

async function checkCompletedJob() {
  try {
    const completed = await queue.getCompleted();

    if (completed.length > 0) {
      console.log(`✅ Found ${completed.length} completed job(s):\n`);
      for (const job of completed) {
        console.log(`Job ID: ${job.id}`);
        console.log(`Data:`, job.data);
        console.log(`Return Value:`, job.returnvalue);
        console.log(`Processed On:`, new Date(job.processedOn));
        console.log(`Finished On:`, new Date(job.finishedOn));
        console.log(`Duration: ${job.finishedOn - job.processedOn}ms`);
        console.log(`Logs:`, job.logs);
        console.log('\n---\n');
      }
    } else {
      console.log('No completed jobs found');
    }

    await queue.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await queue.close();
  }
}

checkCompletedJob();
