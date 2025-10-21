# Leboncoin Real Estate Scraper

A TypeScript-based web scraper using Playwright to extract real estate listings from leboncoin.fr in the Somme department (80).

## Features

- Scrapes real estate listings from leboncoin.fr
- Filters by department (default: 80 - Somme)
- Retrieves listings from the last 7 days
- Extracts comprehensive listing information:
  - Basic info: title, price, location, description, publication date, URL
  - Property details: surface area, rooms, property type, energy rating
  - Seller information: name and type (professional/individual)
- Exports data to CSV format
- Includes rate limiting to avoid being blocked
- Handles pagination (up to 3 pages by default)

## Prerequisites

- Node.js 18 or higher
- pnpm (specified package manager)

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Install Playwright browsers:
```bash
pnpm exec playwright install chromium
```

## Usage

### Build and run the scraper:

```bash
pnpm start
```

This will:
1. Compile the TypeScript code
2. Run the scraper
3. Generate a `leboncoin_listings.csv` file with the results

### Run individual commands:

Build only:
```bash
pnpm build
```

Scrape only (after building):
```bash
pnpm scrape
```

## Configuration

You can modify the scraper configuration in `src/scraper.ts`:

```typescript
const DEFAULT_CONFIG: ScraperConfig = {
  department: '80',        // Department code (80 = Somme)
  daysBack: 7,            // Number of days to look back
  headless: true,         // Run browser in headless mode
  outputFile: 'leboncoin_listings.csv',  // Output filename
};
```

## Output

The scraper generates a CSV file with the following columns:

- Title
- Price
- Location
- Description
- Publication Date
- URL
- Surface Area
- Rooms
- Property Type
- Energy Rating
- Seller Name
- Seller Type

## Rate Limiting

The scraper includes built-in delays:
- 1-2 seconds between individual listings
- 2-3 seconds between pages
- Slowmo 100ms for browser actions

This helps avoid detection and being blocked by the website.

## Limitations

- Currently scrapes up to 3 pages of results (configurable in code)
- Date filtering relies on French date formats
- Some listings may not have all fields available
- Seller information may not always be publicly accessible

## Project Structure

```
linkinvest/
├── src/
│   ├── scraper.ts           # Main scraper logic
│   ├── types.ts             # TypeScript type definitions
│   └── utils/
│       └── csv-writer.ts    # CSV export utility
├── dist/                     # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Playwright installation issues

If you encounter issues with Playwright, try:
```bash
pnpm exec playwright install --with-deps chromium
```

### Scraper getting blocked

If the scraper is being blocked:
1. Increase delays in `src/scraper.ts`
2. Run in non-headless mode (set `headless: false`)
3. Reduce the number of pages scraped

### No listings found

Make sure:
1. The department code is correct (80 for Somme)
2. There are active listings in the last 7 days
3. Check the leboncoin.fr website structure hasn't changed

## Legal Notice

This scraper is for educational purposes. Always respect:
- Leboncoin's terms of service
- robots.txt directives
- Rate limiting and reasonable usage
- Personal data protection regulations (GDPR)

Use responsibly and consider using official APIs when available.
