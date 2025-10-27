import { Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { S3Service } from '~/storage';
import {
  CsvParserService,
  GeocodingApiService,
  RechercheEntreprisesApiService,
} from './services';
import { domainSchema } from '@linkinvest/db';
import {
  OpportunityType,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '@linkinvest/shared';
import type { Etablissement } from './types/recherche-entreprises.types';
import type { CompanyEstablishment, FailingCompanyCsvRow } from './types/failing-companies.types';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

interface CompanyBuildingsJobData {
  sourceFile: string;
}

@Processor(SOURCE_COMPANY_BUILDINGS_QUEUE)
export class CompanyBuildingsProcessor extends WorkerHost {
  private readonly logger = new Logger(CompanyBuildingsProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
    private readonly s3Service: S3Service,
    private readonly csvParserService: CsvParserService,
    private readonly rechercheEntreprisesApi: RechercheEntreprisesApiService,
    private readonly geocodingApi: GeocodingApiService,
  ) {
    super();
  }

  async process(job: Job<CompanyBuildingsJobData>): Promise<void> {
    const { sourceFile } = job.data;
    const startTime = Date.now();
    this.logger.log(
      `Starting to process company buildings from: ${sourceFile}`,
    );

    const stats = {
      totalSirens: 0,
      establishmentsFound: 0,
      geocodingAttempts: 0,
      geocodingSuccesses: 0,
      geocodingFailures: 0,
      opportunitiesInserted: 0,
      errors: 0,
    };

    const failedRows: any[] = [];
    let csvBuffer: Buffer;

    try {
      // Step 1: Download CSV from S3
      this.logger.log('Step 1/6: Downloading CSV from S3...');
      csvBuffer = await this.s3Service.downloadFile(sourceFile);

      // Step 2: Parse CSV and extract SIRENs
      this.logger.log('Step 2/6: Parsing CSV and extracting SIRENs...');
      const csvRows = this.csvParserService.parseCsv(csvBuffer);
      const sirens = this.csvParserService.extractSirensFromRows(csvRows);
      stats.totalSirens = sirens.length;
      this.logger.log(`Found ${sirens.length} unique SIREN(s) to process`);

      // Step 3: Fetch establishments for each SIREN
      this.logger.log('Step 3/6: Fetching establishments from API...');
      const allEstablishments: CompanyEstablishment[] = [];

      for (const [index, { siren, row }] of sirens.entries()) {
        try {
          this.logger.log(
            `Processing SIREN ${index + 1}/${sirens.length}: ${siren}`,
          );

          const establishments =
            await this.rechercheEntreprisesApi.getEstablishmentsBySiren(siren);
          stats.establishmentsFound += establishments.length;

          if (establishments.length === 0) {
            this.logger.warn(`No establishments found for SIREN ${siren}`);
            failedRows.push({
              ...row,
              error_reason: 'No establishments found',
            });
            stats.errors++;
            continue;
          }

          // Step 4: Geocode and transform establishments
          for (const etablissement of establishments) {
            const transformed = await this.transformEstablishment(
              etablissement,
              row.dateparution, // Pass the parution date from CSV
              stats,
            );
            if (transformed) {
              allEstablishments.push(transformed);
            } else {
              failedRows.push({
                ...row,
                error_reason: `Geocoding failed for establishment ${etablissement.siret}`,
              });
              stats.errors++;
            }
          }
        } catch (error) {
          stats.errors++;
          failedRows.push({
            ...row,
            error_reason: (error as Error).message,
          });
          this.logger.error(
            `Error processing SIREN ${siren}: ${(error as Error).message}`,
          );
        }
      }

      this.logger.log(
        `Step 4/6: Transformed ${allEstablishments.length} establishment(s) to opportunities`,
      );

      // Step 5: Insert into database
      this.logger.log('Step 5/6: Inserting opportunities into database...');
      if (allEstablishments.length > 0) {
        const opportunities = allEstablishments.map((est) => ({
          label: est.companyName,
          siret: est.siret,
          address: est.address,
          zipCode: parseInt(est.zipCode, 10),
          department: est.department,
          latitude: est.latitude,
          longitude: est.longitude,
          type: OpportunityType.LIQUIDATION,
          status: 'pending_review',
          opportunityDate: est.opportunityDate || null,
        }));

        await this.db
          .insert(domainSchema.opportunities)
          .values(opportunities)
          .onConflictDoNothing(); // Skip duplicates if SIRET already exists

        stats.opportunitiesInserted = opportunities.length;
      }

      // Step 6: Upload failed rows (if any) and delete source file
      this.logger.log('Step 6/6: Cleanup and error handling...');
      if (failedRows.length > 0) {
        await this.uploadFailedRows(sourceFile, failedRows);
        this.logger.warn(
          `Uploaded ${failedRows.length} failed row(s) to S3 with _failed suffix`,
        );
      }

      // Delete the source file after successful processing
      await this.s3Service.deleteFile(sourceFile);
      this.logger.log(`Deleted source file: ${sourceFile}`);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Successfully processed company buildings from: ${sourceFile}`,
      );
      this.logger.log(`Processing stats:
        - Duration: ${duration}ms
        - Total SIRENs processed: ${stats.totalSirens}
        - Establishments found: ${stats.establishmentsFound}
        - Geocoding attempts: ${stats.geocodingAttempts}
        - Geocoding successes: ${stats.geocodingSuccesses}
        - Geocoding failures: ${stats.geocodingFailures}
        - Opportunities inserted: ${stats.opportunitiesInserted}
        - Errors: ${stats.errors}
        - Failed rows: ${failedRows.length}
      `);
    } catch (error) {
      this.logger.error(
        `Failed to process company buildings from ${sourceFile}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Upload failed rows to S3 with _failed suffix
   */
  private async uploadFailedRows(
    sourceFile: string,
    failedRows: FailingCompanyCsvRow[],
  ): Promise<void> {
    try {
      // Generate failed file path
      const failedFilePath = sourceFile.replace(/\.csv$/, '_failed.csv');

      if (!failedRows[0]) {
        return;
      }

      // Convert failed rows to CSV
      const headers = Object.keys(failedRows[0]).join(';');
      const csvData = [
        headers,
        ...failedRows.map((row) => Object.values(row).join(';')),
      ].join('\n');

      const buffer = Buffer.from(csvData, 'utf-8');

      // Extract S3 key from full path
      const match = failedFilePath.match(/^s3:\/\/[^/]+\/(.+)$/);
      if (!match) {
        throw new Error(`Invalid S3 path format: ${failedFilePath}`);
      }

      const key = match[1];
      if (!key) {
        throw new Error(`Invalid S3 key: ${failedFilePath}`);
      }
      await this.s3Service.uploadFile(buffer, key);

      this.logger.log(`Uploaded failed rows to: ${failedFilePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to upload failed rows: ${(error as Error).message}`,
      );
      // Don't throw - this is not critical
    }
  }

  /**
   * Transform an establishment to CompanyEstablishment with geocoding if needed
   */
  private async transformEstablishment(
    etablissement: Etablissement,
    opportunityDate: string,
    stats: any,
  ): Promise<CompanyEstablishment | null> {
    try {
      let latitude = etablissement.latitude;
      let longitude = etablissement.longitude;

      // If coordinates are not provided by the API, geocode the address
      if (!latitude || !longitude) {
        stats.geocodingAttempts++;
        const fullAddress = `${etablissement.adresse} ${etablissement.code_postal} ${etablissement.libelle_commune}`;
        const coordinates = await this.geocodingApi.geocodeAddress(fullAddress);

        if (coordinates) {
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;
          stats.geocodingSuccesses++;
        } else {
          stats.geocodingFailures++;
          this.logger.warn(
            `Failed to geocode establishment ${etablissement.siret} at address: ${fullAddress}. Skipping.`,
          );
          return null; // Skip this establishment if geocoding fails
        }
      }

      // Extract department from postal code (first 2 digits)
      const department = parseInt(
        etablissement.code_postal.substring(0, 2),
        10,
      );

      return {
        siret: etablissement.siret,
        companyName: etablissement.commune || 'Unknown Company',
        address: etablissement.adresse,
        zipCode: etablissement.code_postal,
        city: etablissement.libelle_commune,
        department,
        latitude,
        longitude,
        opportunityDate,
      };
    } catch (error) {
      this.logger.error(
        `Failed to transform establishment ${etablissement.siret}: ${(error as Error).message}`,
      );
      return null;
    }
  }
}
