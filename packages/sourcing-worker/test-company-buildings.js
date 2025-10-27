// Simple test script to trigger company buildings job
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

async function triggerJob() {
  try {
    console.log('Adding job to queue...');

    const job = await queue.add('source-company-buildings', {
      sourceFile: 's3://linkinvest-sourcing/failing-companies/dept-75/2024-01-01.csv',
    }, {
      removeOnComplete: 100,
      removeOnFail: 100,
    });

    console.log(`✅ Job added successfully with ID: ${job.id}`);
    console.log('Job data:', job.data);
    console.log('\nWatch the worker logs to see the processing...');

    await queue.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding job:', error);
    await queue.close();
    process.exit(1);
  }
}

triggerJob();
