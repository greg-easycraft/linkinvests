# Energy Sieves (Passoires Thermiques) Sourcing Specification

## Overview

**Purpose**: Source real estate opportunities from buildings with poor energy performance (F or G ratings), known as "passoires thermiques" (energy sieves) in France.

**Business Goal**: Identify properties with low energy efficiency ratings that may require renovation or represent investment opportunities for energy transition projects.

**Data Source**: ADEME (Agence de la transition écologique) DPE (Diagnostic de Performance Énergétique) public dataset.

---

## Data Flow

```
Job Triggered → Fetch DPE Data from ADEME API → Transform Records → Insert Opportunities → Complete
                 (Filter: F/G ratings)           (Map to schema)     (Type: PASSOIRE_THERMIQUE)
```

### Job Parameters
- `departmentId` (number): French department code (e.g., 75 for Paris)
- `energyClasses` (string[]): Array of energy classes to fetch (default: ["F", "G"])

---

## ADEME API Documentation

### Base Information
- **API Base URL**: `https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant`
- **Dataset Size**: 13,178,351+ records
- **Authentication**: Optional (public access available)
- **Format**: JSON (lines endpoint)

### Key Endpoints

#### 1. Fetch DPE Records
```
GET /lines?size={size}&select={fields}&where={filter}
```

**Query Parameters**:
- `size`: Number of records per page (max recommended: 1000)
- `select`: Comma-separated list of fields to return
- `where`: SQL-like filter expression
- `page`: Page number for pagination (1-indexed)

**Example Request**:
```bash
GET https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?
  size=1000&
  select=numero_dpe,adresse_ban,code_postal_ban,nom_commune_ban,code_departement_ban,
         etiquette_dpe,etiquette_ges,_geopoint,type_batiment,annee_construction&
  where=code_departement_ban="75" AND (etiquette_dpe="F" OR etiquette_dpe="G")&
  page=1
```

### Field Mapping

| ADEME API Field | Database Field | Type | Notes |
|----------------|----------------|------|-------|
| `adresse_ban` | `address` | text | Standardized address |
| `code_postal_ban` | `zipCode` | integer | Postal code |
| `code_departement_ban` | `department` | integer | Department code |
| `_geopoint` | `latitude`, `longitude` | double | Format: "lat,lon" |
| `adresse_ban` or `nom_commune_ban` | `label` | varchar | Opportunity name |
| N/A (no SIRET) | `siret` | varchar | NULL for energy sieves |
| Fixed: "PASSOIRE_THERMIQUE" | `type` | enum | Opportunity type |
| Fixed: "pending_review" | `status` | text | Initial status |

### Additional Fields (for reference/filtering)
- `numero_dpe`: DPE certificate number (unique identifier)
- `etiquette_dpe`: Energy efficiency rating (A-G scale)
- `etiquette_ges`: GHG emissions rating (A-G scale)
- `type_batiment`: Building type (appartement, maison, immeuble)
- `annee_construction`: Construction year
- `surface_habitable_logement`: Living area in m²

---

## Implementation Checklist

### 1. Shared Package (`@linkinvest/shared`)
- [ ] Add `SOURCE_ENERGY_SIEVES_QUEUE` constant in `src/constants/queues.ts`
- [ ] Rebuild package: `pnpm --filter @linkinvest/shared build`

### 2. Domain Structure (`packages/sourcing-worker/src/domains/energy-sieves/`)

#### Types
- [ ] `types/energy-sieves.types.ts`
  - [ ] `DpeRecord` interface (ADEME API response shape)
  - [ ] `EnergySieveJobData` interface (job parameters)
  - [ ] `DpeApiResponse` interface (paginated response)

#### Services
- [ ] `services/ademe-api.service.ts`
  - [ ] `fetchDpeByDepartment(department, energyClasses, page)` method
  - [ ] Handle pagination (iterate until all records fetched)
  - [ ] Parse `_geopoint` field (format: "lat,lon")
  - [ ] Error handling for API failures

- [ ] `services/index.ts` - Export all services

#### Processor
- [ ] `energy-sieves.processor.ts`
  - [ ] Extend `WorkerHost`
  - [ ] Implement `process(job: Job<EnergySieveJobData>)` method
  - [ ] Fetch all DPE records for department
  - [ ] Transform records to opportunity schema
  - [ ] Batch insert into database (handle duplicates)
  - [ ] Log processing statistics

#### Module
- [ ] `energy-sieves.module.ts`
  - [ ] Register `SOURCE_ENERGY_SIEVES_QUEUE` with BullMQ
  - [ ] Provide `EnergySievesProcessor`
  - [ ] Provide `AdemeApiService`
  - [ ] Export `BullModule` for queue injection

- [ ] `index.ts` - Export module

### 3. Application Integration
- [ ] Update `app.module.ts`
  - [ ] Import `EnergySievesModule`

- [ ] Update `app.controller.ts`
  - [ ] Add `POST /jobs/energy-sieves` endpoint
  - [ ] Inject `SOURCE_ENERGY_SIEVES_QUEUE`
  - [ ] Validate job parameters (departmentId, energyClasses)

- [ ] Update Bull Board configuration (if needed)
  - [ ] Ensure new queue appears in dashboard

---

## Technical Details

### Energy Sieve Identification
Buildings are classified as "energy sieves" if:
- `etiquette_dpe = "F"` (high energy consumption)
- `etiquette_dpe = "G"` (very high energy consumption)

These represent the worst performers on the A-G energy efficiency scale.

### Coordinate Parsing
The ADEME API returns coordinates in `_geopoint` field as a string:
```json
{
  "_geopoint": "48.8566,2.3522"
}
```

Must be split into:
```typescript
const [lat, lon] = record._geopoint.split(',').map(Number);
```

### Pagination Strategy
With 13M+ records, pagination is critical:
1. Start with `page=1, size=1000`
2. Continue until API returns fewer records than `size`
3. Track progress in logs (e.g., "Fetched 5000/50000 records")

### Duplicate Handling
Since there's no SIRET for addresses:
- Cannot use SIRET-based uniqueness
- Consider using `numero_dpe` as external reference (optional)
- May need to add address-based deduplication logic
- Use `onConflictDoNothing()` to skip duplicates on insertion

### Performance Considerations
- Batch inserts (e.g., 500 records at a time)
- Process one department at a time to avoid memory issues
- Consider adding rate limiting for ADEME API (if needed)
- Log progress every N records

---

## API Examples

### Sample Request
```bash
curl "https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines?size=2&select=numero_dpe,adresse_ban,code_postal_ban,_geopoint,etiquette_dpe&where=code_departement_ban=%2275%22%20AND%20etiquette_dpe=%22F%22"
```

### Sample Response
```json
{
  "total": 45821,
  "results": [
    {
      "numero_dpe": "2275E0123456",
      "adresse_ban": "123 rue de la République",
      "code_postal_ban": "75011",
      "_geopoint": "48.8566,2.3522",
      "etiquette_dpe": "F"
    },
    {
      "numero_dpe": "2275E0234567",
      "adresse_ban": "456 avenue des Champs",
      "code_postal_ban": "75008",
      "_geopoint": "48.8698,2.3078",
      "etiquette_dpe": "F"
    }
  ]
}
```

---

## Testing & Validation

### Manual Testing
```bash
# Trigger job for Paris (75) with F and G ratings
curl -X POST http://localhost:8080/jobs/energy-sieves \
  -H "Content-Type: application/json" \
  -d '{
    "departmentId": 75,
    "energyClasses": ["F", "G"]
  }'
```

### Expected Results
- Job enqueued successfully with job ID
- Worker processes records in batches
- Opportunities inserted with type `PASSOIRE_THERMIQUE`
- Statistics logged: total fetched, inserted, errors

### Validation Queries
```sql
-- Check inserted opportunities
SELECT COUNT(*) FROM opportunity
WHERE type = 'PASSOIRE_THERMIQUE' AND department = 75;

-- Verify coordinates are valid
SELECT * FROM opportunity
WHERE type = 'PASSOIRE_THERMIQUE'
  AND (latitude = 0 OR longitude = 0);
```

---

## Future Enhancements
- [ ] Add filtering by construction year (target old buildings)
- [ ] Add filtering by building type (appartement vs maison)
- [ ] Store `numero_dpe` for reference (requires schema update)
- [ ] Add enrichment with cadastral data
- [ ] Implement CRON job for periodic updates
- [ ] Add dashboard metrics for energy sieve opportunities
