# Scripts

## LocalStack Setup

### init-localstack.sh

This script initializes LocalStack S3 with the required bucket for local development.

**Usage:**

1. Start all services including LocalStack:
   ```bash
   docker-compose up -d
   ```

2. Run the initialization script:
   ```bash
   ./scripts/init-localstack.sh
   ```

This will:
- Wait for LocalStack to be ready
- Create the `linkinvests-failing-companies` S3 bucket
- List all available buckets

### Manual S3 Operations with LocalStack

You can interact with LocalStack S3 using the AWS CLI:

```bash
# Set environment variables
export S3_ACCESS_KEY_ID=test
export S3_SECRET_ACCESS_KEY=test
export S3_DEFAULT_REGION=eu-west-3

# List buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# List objects in a bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://linkinvests-failing-companies/

# Download a file
aws --endpoint-url=http://localhost:4566 s3 cp s3://linkinvests-failing-companies/your-file.csv ./

# Upload a file
aws --endpoint-url=http://localhost:4566 s3 cp ./file.csv s3://linkinvests-failing-companies/
```

### Accessing LocalStack Dashboard

LocalStack provides a web UI for easier management:
- URL: http://localhost:4566/_localstack/health
- S3 Console: Available through LocalStack Pro (optional)
