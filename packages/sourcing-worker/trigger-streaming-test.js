const { Queue } = require('bullmq');
const Redis = require('ioredis');

const redis = new Redis({ host: 'localhost', port: 6379 });

const SOURCE_DECEASES_CSV_INGEST_QUEUE = 'source-deceases-csv-ingest';

async function triggerStreamingTest() {
  const queue = new Queue(SOURCE_DECEASES_CSV_INGEST_QUEUE, {
    connection: redis,
  });

  console.log('🧪 Triggering streaming test with small CSV...');

  const job = await queue.add('process', {
    s3Path: 's3://linkinvest-bucket/deceases/raw/test-streaming.csv',
  });

  console.log(`✅ Streaming test job enqueued with ID: ${job.id}`);
  console.log('📊 Check logs for streaming CSV parsing messages...');

  await redis.disconnect();
}

triggerStreamingTest().catch(console.error);