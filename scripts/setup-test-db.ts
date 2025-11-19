#!/usr/bin/env tsx

/**
 * Setup Test Database Script
 *
 * This script creates and sets up the test database for the application.
 * It will:
 * 1. Connect to PostgreSQL (via Docker or psql)
 * 2. Drop the test database if it exists
 * 3. Create a fresh test database
 * 4. Run migrations to set up the schema
 *
 * Usage:
 *   pnpm db:test:setup
 */

import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { config } from 'dotenv'

config()

const execAsync = promisify(exec)

// Parse DATABASE_URL to extract connection details
interface DbConfig {
  user: string
  password: string
  host: string
  port: string
  database: string
  testDatabase: string
}

function parseTestDatabaseUrl(url: string): DbConfig {
  // Format: postgresql://user:password@host:port/database
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

  if (!match) {
    throw new Error('Invalid TEST_DATABASE_URL format')
  }

  const [, user, password, host, port, testDatabase] = match

  return {
    user: user!,
    password: password!,
    host: host!,
    port: port!,
    database: 'postgres', // Connect to default postgres DB to create test DB
    testDatabase: testDatabase!,
  }
}

async function checkCommand(command: string): Promise<boolean> {
  try {
    await execAsync(`command -v ${command}`)
    return true
  } catch {
    return false
  }
}

async function runCommand(command: string, description: string): Promise<void> {
  console.log(`\n🔄 ${description}...`)
  try {
    const { stdout, stderr } = await execAsync(command)
    if (stdout) console.log(stdout.trim())
    if (stderr && !stderr.includes('does not exist')) console.error(stderr.trim())
    console.log(`✅ ${description} - Done`)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${description} - Failed:`, error.message)
      throw error
    }
    throw error
  }
}

async function setupTestDatabase(): Promise<void> {
  console.log('🚀 Setting up test database...\n')

  // Get TEST_DATABASE_URL from environment
  const testDbUrl = process.env.TEST_DATABASE_URL

  if (!testDbUrl) {
    throw new Error(
      'TEST_DATABASE_URL environment variable is not set. Please check your .env file.'
    )
  }

  console.log(`📋 Test Database URL: ${testDbUrl.replace(/:[^:@]+@/, ':****@')}`)

  const dbConfig = parseTestDatabaseUrl(testDbUrl)

  // Check if psql is available
  const hasPsql = await checkCommand('psql')

  if (!hasPsql) {
    console.error('\n❌ psql command not found.')
    console.error('\nPlease install PostgreSQL client:')
    console.error('  macOS:   brew install postgresql')
    console.error('  Ubuntu:  sudo apt-get install postgresql-client')
    console.error('  Windows: Download from https://www.postgresql.org/download/windows/')
    console.error('\nAfter installation, run this script again.')
    process.exit(1)
  }

  const psqlCommand = `PGPASSWORD=${dbConfig.password} psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user}`

  // Step 1: Check if PostgreSQL is running
  try {
    await runCommand(
      `${psqlCommand} -d ${dbConfig.database} -c "SELECT version();"`,
      'Checking PostgreSQL connection'
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('\n❌ Cannot connect to PostgreSQL.')
    console.error('Please ensure PostgreSQL is running.')
    console.error(`   Host: ${dbConfig.host}`)
    console.error(`   Port: ${dbConfig.port}`)
    console.error(`   User: ${dbConfig.user}`)
    console.error('\nTo start PostgreSQL:')
    console.error('  - With Docker: docker-compose up -d')
    console.error('  - Locally: brew services start postgresql')
    process.exit(1)
  }

  // Step 2: Drop test database if it exists
  try {
    await runCommand(
      `${psqlCommand} -d ${dbConfig.database} -c "DROP DATABASE IF EXISTS \\"${dbConfig.testDatabase}\\";"`,
      `Dropping test database '${dbConfig.testDatabase}' if it exists`
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn('⚠️  Could not drop database (it may not exist)')
  }

  // Step 3: Create test database
  await runCommand(
    `${psqlCommand} -d ${dbConfig.database} -c "CREATE DATABASE \\"${dbConfig.testDatabase}\\";"`,
    `Creating test database '${dbConfig.testDatabase}'`
  )

  console.log('\n✅ Test database setup complete!')
  console.log(`\n📊 Database: ${dbConfig.testDatabase}`)
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`)
  console.log(`   User: ${dbConfig.user}`)
  console.log('\n💡 You can now run repository tests with: pnpm test:e2e')
}

// Run the setup
setupTestDatabase().catch((error) => {
  console.error('\n💥 Test database setup failed:', error)
  process.exit(1)
})
