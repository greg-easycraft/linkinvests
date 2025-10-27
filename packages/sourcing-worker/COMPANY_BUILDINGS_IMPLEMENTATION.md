# Company Buildings Processor Implementation Plan

## Overview
Implement the `CompanyBuildingsProcessor` to download CSV files from S3, extract SIREN numbers, fetch all establishments from the Annuaire des Entreprises API, geocode addresses, and store them in the database.

---

## Research Findings

### Data Flow
1. **Input**: S3 CSV file path (e.g., `s3://bucket/failing-companies/dept-75/2025-01-01.csv`)
2. **CSV Structure**:
   - Contains `listepersonnes` field with JSON data
   - SIREN (9-digit) found in `numeroIdentification` within the JSON
   - No SIRET directly available in CSV
3. **Output**: Opportunities in database with type `LIQUIDATION` or `SUCCESSION`

### APIs to Use

#### 1. Recherche Entreprises API
- **Endpoint**: `https://recherche-entreprises.api.gouv.fr/search?q={SIREN}`
- **Authentication**: None required
- **Rate Limits**: Unknown (need to implement conservative rate limiting)
- **Response Structure**:
  ```json
  {
    "results": [{
      "siren": "843747643",
      "nom_complet": "BAMA FRANCE",
      "nombre_etablissements": 1,
      "siege": {
        "siret": "84374764300016",
        "adresse": "37 RUE DES MATHURINS 75008 PARIS",
        "code_postal": "75008",
        "libelle_commune": "PARIS",
        "latitude": 48.8734,
        "longitude": 2.3256
      },
      "matching_etablissements": []
    }]
  }
  ```

#### 2. API Adresse (Geocoding)
- **Endpoint**: `https://api-adresse.data.gouv.fr/search/?q={address}`
- **Authentication**: None required
- **Rate Limit**: 50 requests/second/IP
- **Response Structure**:
  ```json
  {
    "features": [{
      "geometry": {
        "coordinates": [longitude, latitude]  // Note: lon/lat order!
      },
      "properties": {
        "score": 0.89,
        "label": "8 Boulevard du Port 75015 Paris"
      }
    }]
  }
  ```

---

## Implementation Checklist

### Phase 1: Dependencies & Setup
- [ ] Add CSV parsing library
  - Decision: Use `csv-parse` (already part of Node ecosystem)
  - Command: `npm install csv-parse`
- [ ] Review S3Service for download capabilities
  - [ ] Add `downloadFile(s3Path: string): Promise<Buffer>` method

### Phase 2: Database Schema Updates
- [ ] Review `opportunities` table schema
- [ ] Decide if SIRET field needed for deduplication
  - Current fields: `id, label, zipCode, department, latitude, longitude, type, status, createdAt, updatedAt`
  - Missing: `siret` (for deduplication), `address` (for context)
- [ ] Update schema if needed
- [ ] Run database migration

### Phase 3: Core Processor Implementation

#### 3.1 CSV Download & Parsing
- [ ] Implement S3 file download
  - [ ] Parse S3 path (extract bucket and key)
  - [ ] Use AWS SDK to download file
  - [ ] Handle download errors
- [ ] Parse CSV data
  - [ ] Use csv-parse with headers
  - [ ] Extract and validate required columns
  - [ ] Log row count
- [ ] Extract SIREN numbers
  - [ ] Parse `listepersonnes` JSON field
  - [ ] Extract `numeroIdentification` (SIREN)
  - [ ] Validate SIREN format (9 digits)
  - [ ] Deduplicate SIRENs in same file
  - [ ] Handle malformed JSON gracefully

#### 3.2 Fetch Establishments from API
- [ ] Create API client service/helper
  - [ ] Implement rate limiting (conservative: 10 req/sec)
  - [ ] Add retry logic with exponential backoff
  - [ ] Handle HTTP errors (404, 500, etc.)
- [ ] For each SIREN:
  - [ ] Call `recherche-entreprises.api.gouv.fr/search?q={SIREN}`
  - [ ] Parse response JSON
  - [ ] Extract `siege` (headquarters)
  - [ ] Extract all `matching_etablissements`
  - [ ] Combine into single establishments array
  - [ ] Log establishments found count
- [ ] Handle edge cases:
  - [ ] Company not found (404)
  - [ ] No establishments returned
  - [ ] Multiple establishments

#### 3.3 Geocoding
- [ ] Determine which establishments need geocoding
  - If API already provides lat/long, use those
  - Otherwise, geocode the address
- [ ] Create geocoding service/helper
  - [ ] Implement rate limiting (45 req/sec with buffer)
  - [ ] Batch geocoding requests if possible
  - [ ] Add retry logic
  - [ ] Handle failed geocoding (log and skip or null coords?)
- [ ] For each establishment without coordinates:
  - [ ] Build address query string
  - [ ] Call API Adresse
  - [ ] Parse response (note: coordinates are [lon, lat])
  - [ ] Check score threshold (e.g., > 0.5)
  - [ ] Extract coordinates
  - [ ] Handle low-confidence results

#### 3.4 Database Storage
- [ ] Transform establishments to opportunities
  - [ ] Map SIRET to appropriate field
  - [ ] Map company name to `label`
  - [ ] Extract zip code (first 2 digits = department)
  - [ ] Set `type` to appropriate OpportunityType
  - [ ] Set `status` (e.g., "pending_review")
  - [ ] Set coordinates
- [ ] Implement deduplication strategy
  - [ ] Check existing opportunities by SIRET
  - [ ] Or use database UNIQUE constraint
- [ ] Batch insert to database
  - [ ] Use Drizzle's batch insert
  - [ ] Handle conflicts (upsert vs ignore)
  - [ ] Log inserted count

### Phase 4: Error Handling & Observability
- [ ] Add comprehensive error handling
  - [ ] S3 download failures
  - [ ] CSV parsing errors
  - [ ] JSON parsing errors (listepersonnes)
  - [ ] API failures (both APIs)
  - [ ] Database insertion errors
- [ ] Add detailed logging
  - [ ] Log each processing stage start/complete
  - [ ] Log counts (rows, SIRENs, establishments, inserted)
  - [ ] Log errors with full context
  - [ ] Log processing duration
- [ ] Add metrics/stats summary
  - [ ] Total rows in CSV
  - [ ] Valid SIRENs extracted
  - [ ] Establishments found
  - [ ] Geocoding success rate
  - [ ] Opportunities inserted
  - [ ] Errors encountered

### Phase 5: Testing
- [ ] Unit tests
  - [ ] CSV parsing logic
  - [ ] SIREN extraction from JSON
  - [ ] Data transformation logic
- [ ] Integration tests
  - [ ] Mock API responses
  - [ ] Test full flow with sample data
- [ ] Manual testing
  - [ ] Test with real S3 file from LocalStack
  - [ ] Verify data in database
  - [ ] Check error scenarios

---

## Technical Decisions to Make

### 1. Database Schema
**Question**: Add `siret` field to opportunities table?
- **Option A**: Add SIRET field for deduplication and traceability
  - Pros: Clear deduplication, better traceability
  - Cons: Schema migration needed
- **Option B**: Use existing fields (label + zipCode + type)
  - Pros: No migration
  - Cons: Fuzzy matching, potential duplicates

**Recommendation**: Add SIRET field

### 2. Failed Geocoding
**Question**: What to do when geocoding fails?
- **Option A**: Skip the establishment (log warning)
  - Pros: Clean data
  - Cons: Lose potential opportunities
- **Option B**: Insert with null coordinates
  - Pros: Capture all data
  - Cons: Requires nullable lat/long in schema
- **Option C**: Use approximate coordinates (city center)
  - Pros: Some location data
  - Cons: Inaccurate

**Recommendation**: Option B - Insert with null coordinates (requires schema update)

### 3. OpportunityType
**Question**: Which type to use for failing companies?
- `LIQUIDATION` - for companies in liquidation
- `SUCCESSION` - for companies needing succession

**Recommendation**: Use `LIQUIDATION` by default, could parse from `typeavis_lib` if needed

### 4. Rate Limiting Strategy
**Question**: How to handle API rate limits?
- **Option A**: Simple delay between requests
  - Pros: Easy to implement
  - Cons: May be too slow
- **Option B**: Token bucket algorithm
  - Pros: Efficient use of quota
  - Cons: More complex
- **Option C**: Use p-queue or bottleneck library
  - Pros: Battle-tested, handles concurrency
  - Cons: Extra dependency

**Recommendation**: Option A initially, upgrade to C if performance issues

---

## File Structure

```
src/domains/failing-companies/
├── processors/
│   ├── failing-companies.processor.ts (existing)
│   └── company-buildings.processor.ts (main implementation)
├── services/
│   ├── recherche-entreprises-api.service.ts (new)
│   ├── geocoding-api.service.ts (new)
│   └── csv-parser.service.ts (new)
├── types/
│   ├── recherche-entreprises.types.ts (new)
│   └── failing-companies.types.ts (new)
└── constants.ts (existing)

src/storage/
└── s3.service.ts (update with download method)
```

---

## Implementation Order

1. **S3 Download** - Update S3Service with download capability ✅
2. **CSV Parsing** - Extract SIREN numbers from CSV ✅
3. **Recherche Entreprises API** - Fetch establishments ✅
4. **Geocoding** - Add coordinates ✅
5. **Database Schema** - Add necessary fields ✅
6. **Database Storage** - Insert opportunities ✅
7. **Error Handling** - Comprehensive error handling ✅
8. **File Cleanup** - Delete processed files and upload failed rows ✅
9. **Testing** - Validate with real data ⏳

---

## Progress Tracking

- [x] Phase 1: Dependencies & Setup
- [x] Phase 2: Database Schema Updates
- [x] Phase 3.1: CSV Download & Parsing
- [x] Phase 3.2: Fetch Establishments
- [x] Phase 3.3: Geocoding
- [x] Phase 3.4: Database Storage
- [x] Phase 4: Error Handling & Observability
- [x] Phase 4.1: File Cleanup (Delete source file)
- [x] Phase 4.2: Failed Rows Handling (Upload with _failed suffix)
- [ ] Phase 5: Testing
- [ ] Final Review & Deployment

---

## New Features Added

### File Cleanup
After successful processing, the source file is automatically deleted from S3 to prevent reprocessing.

### Failed Rows Handling
Any rows that encounter errors during processing are:
1. Tracked with their error reason
2. Exported to a new CSV file with `_failed` suffix
3. Uploaded back to S3 in the same directory as the source file
4. Include an `error_reason` column explaining what went wrong

**Example:**
- Source: `s3://bucket/failing-companies/dept-75/2024-01-01.csv`
- Failed: `s3://bucket/failing-companies/dept-75/2024-01-01_failed.csv`

### Error Tracking
Failed rows are tracked for the following reasons:
- No SIREN found in the row
- SIREN not found in Recherche Entreprises API
- No establishments returned for the SIREN
- Geocoding failed (coordinates couldn't be determined)
- Any other processing errors

---

## Notes & Questions

1. **Sample Data**: Need access to LocalStack S3 to see actual CSV structure
2. **Performance**: Processing large CSV files may require streaming/batching
3. **Monitoring**: Consider adding metrics to track daily processing stats
4. **Deduplication**: How to handle same company appearing multiple times?
5. **Historical Data**: Should we track when a company status changes?

---

## Resources

- [API Recherche Entreprises](https://recherche-entreprises.api.gouv.fr/docs/)
- [API Adresse Documentation](https://adresse.data.gouv.fr/api-doc/adresse)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [csv-parse Documentation](https://csv.js.org/parse/)
