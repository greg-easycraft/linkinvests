#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "running"'; do
  echo "Waiting for LocalStack S3..."
  sleep 2
done

echo "LocalStack is ready!"

# Configure AWS CLI to use LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=eu-west-3

# Create the S3 bucket
BUCKET_NAME="linkinvest-sourcing"

echo "Creating S3 bucket: $BUCKET_NAME"
aws --endpoint-url=http://localhost:4566 s3 mb s3://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"

# List buckets to verify
echo "Available S3 buckets:"
aws --endpoint-url=http://localhost:4566 s3 ls

echo "LocalStack initialization complete!"
