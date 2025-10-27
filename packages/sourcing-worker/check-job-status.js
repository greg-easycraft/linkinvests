// Check job status in BullMQ
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

async function checkStatus() {
  try {
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    console.log('📊 Queue Status:');
    console.log(`  Waiting: ${waiting.length}`);
    console.log(`  Active: ${active.length}`);
    console.log(`  Completed: ${completed.length}`);
    console.log(`  Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\n❌ Failed Jobs:');
      for (const job of failed) {
        console.log(`\n  Job ID: ${job.id}`);
        console.log(`  Data:`, job.data);
        console.log(`  Failure Reason:`, job.failedReason);
        console.log(`  Stack Trace:`, job.stacktrace?.join('\n'));
      }
    }

    if (active.length > 0) {
      console.log('\n⏳ Active Jobs:');
      for (const job of active) {
        console.log(`\n  Job ID: ${job.id}`);
        console.log(`  Data:`, job.data);
        console.log(`  Progress:`, await job.progress());
      }
    }

    await queue.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await queue.close();
  }
}

checkStatus();
