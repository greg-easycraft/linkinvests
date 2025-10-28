<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS worker service for real estate sourcing with BullMQ job queue integration.

## Features

- BullMQ-based job queue system
- Redis integration for queue backend
- PostgreSQL database with Drizzle ORM
- Bull Board dashboard for queue monitoring
- Two job queues:
  - `SOURCE_FAILING_COMPANIES_REQUESTED` - Process sourcing of failing companies
  - `SOURCE_COMPANY_BUILDINGS` - Process sourcing of company buildings from files

## Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose (for Redis and PostgreSQL)

## Project setup

1. Install dependencies:
```bash
$ pnpm install
```

2. Create a `.env` file based on `.env.example`:
```bash
$ cp ../../.env.example .env
```

3. Start Docker services (Redis & PostgreSQL):
```bash
$ docker-compose up -d
```

## Environment Variables

```env
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://linkinvest:linkinvest@localhost:5432/linkinvest
PORT=8080
```

## Compile and run the project

```bash
# development
$ pnpm run dev

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run build
$ pnpm run start:prod
```

## API Endpoints

### Enqueue Jobs

- `POST /jobs/failing-companies` - Enqueue a job to source failing companies
- `POST /jobs/company-buildings` - Enqueue a job to source company buildings
  ```json
  {
    "sourceFile": "path/to/file.csv"
  }
  ```

### Bull Board Dashboard

Access the queue monitoring dashboard at: `http://localhost:8080/admin/queues`

## Architecture

- `src/database/` - Database module with Drizzle ORM
- `src/bullmq/` - BullMQ module with queue providers and service
- `src/workers/` - Worker services that process jobs
- `src/app.controller.ts` - REST endpoints for enqueueing jobs
- `src/main.ts` - Application bootstrap with Bull Board integration

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## CURL Examples for Triggering Jobs

Below are examples of CURL requests to trigger each job type. Make sure the service is running on `http://localhost:8080` (or update the URL accordingly).

### 1. Failing Companies Job

Sources failing companies data for a specific department since a given date.

**Required Parameters:**
- `departmentId` (number): French department code (e.g., 75 for Paris)
- `sinceDate` (string): Filter records since this date (format: YYYY-MM-DD)

```bash
curl -X POST http://localhost:8080/jobs/failing-companies \
  -H "Content-Type: application/json" \
  -d '{
    "departmentId": 75,
    "sinceDate": "2024-01-01"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "jobId": "12345",
  "message": "Job enqueued successfully"
}
```

### 2. Company Buildings Job

Sources company buildings from a CSV file.

**Required Parameters:**
- `sourceFile` (string): Path to the CSV file containing company data

```bash
curl -X POST http://localhost:8080/jobs/company-buildings \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFile": "/path/to/companies.csv"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "jobId": "12346",
  "message": "Job enqueued successfully"
}
```

### 3. Energy Sieves Job

Sources energy-inefficient buildings (DPE records with poor energy ratings) from ADEME API.

**Required Parameters:**
- `departmentId` (number): French department code (e.g., 75 for Paris)
- `sinceDate` (string): Filter DPE records since this date (format: YYYY-MM-DD)

**Optional Parameters:**
- `energyClasses` (string[]): Array of energy classes to fetch (default: ["F", "G"])

```bash
# Basic request (defaults to F and G energy classes)
curl -X POST http://localhost:8080/jobs/energy-sieves \
  -H "Content-Type: application/json" \
  -d '{
    "departmentId": 75,
    "sinceDate": "2024-01-01"
  }'

# With custom energy classes
curl -X POST http://localhost:8080/jobs/energy-sieves \
  -H "Content-Type: application/json" \
  -d '{
    "departmentId": 75,
    "sinceDate": "2024-01-01",
    "energyClasses": ["E", "F", "G"]
  }'
```

**Example Response:**
```json
{
  "success": true,
  "jobId": "12347",
  "message": "Job enqueued successfully"
}
```

### Monitoring Jobs

Once a job is enqueued, you can monitor its progress using the Bull Board dashboard:

```
http://localhost:8080/admin/queues
```

The dashboard provides real-time monitoring of:
- Job status (waiting, active, completed, failed)
- Job logs and errors
- Queue metrics and statistics
- Ability to retry failed jobs
