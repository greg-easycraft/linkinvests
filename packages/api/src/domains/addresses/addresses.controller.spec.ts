import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mockClass } from '~/test-utils/mock-class';
import { AddressSearchService } from './services/address-search.service';
import { AddressesController } from './addresses.controller';
import type { AddressSearchResult } from '@linkinvests/shared';
import { EnergyClass } from '@linkinvests/shared';
import type { DiagnosticLink } from './lib.types';

describe('AddressesController', () => {
  let app: INestApplication;
  let mockAddressSearchService: jest.Mocked<AddressSearchService>;

  const mockAddressSearchResult: AddressSearchResult = {
    id: 'energy-diagnostic-123',
    address: '123 Test St',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    squareFootage: 75,
    energyClass: 'F',
    matchScore: 95,
    energyDiagnosticId: 'external-123',
  };

  const mockDiagnosticLink: DiagnosticLink = {
    id: 'link-123',
    energyDiagnosticId: 'energy-diagnostic-123',
    matchScore: 95,
    energyDiagnostic: {
      id: 'energy-diagnostic-123',
      address: '123 Test St',
      zipCode: '75001',
      energyClass: 'F',
      squareFootage: 75,
      opportunityDate: '2024-01-15',
      externalId: 'external-123',
    },
  };

  beforeEach(async () => {
    mockAddressSearchService = mockClass(AddressSearchService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [
        { provide: AddressSearchService, useValue: mockAddressSearchService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /addresses/search', () => {
    it('should return 200 with plausible addresses', async () => {
      mockAddressSearchService.getPlausibleAddresses.mockResolvedValue([
        mockAddressSearchResult,
      ]);

      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 75,
      };

      const response = await request(app.getHttpServer())
        .post('/addresses/search')
        .send(input)
        .expect(201);

      expect(response.body).toEqual([mockAddressSearchResult]);
      expect(
        mockAddressSearchService.getPlausibleAddresses,
      ).toHaveBeenCalledWith(input);
    });

    it('should return empty array when no results found', async () => {
      mockAddressSearchService.getPlausibleAddresses.mockResolvedValue([]);

      const input = {
        zipCode: '99999',
        energyClass: EnergyClass.A,
        squareFootage: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/addresses/search')
        .send(input)
        .expect(201);

      expect(response.body).toEqual([]);
    });

    it('should return 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post('/addresses/search')
        .send({ zipCode: '123' }) // Invalid: too short and missing required fields
        .expect(400);
    });
  });

  describe('POST /addresses/link', () => {
    it('should return 200 with link results for auction', async () => {
      mockAddressSearchService.searchAndLinkForOpportunity.mockResolvedValue([
        mockDiagnosticLink,
      ]);

      const body = {
        input: {
          zipCode: '75001',
          energyClass: EnergyClass.F,
          squareFootage: 75,
        },
        opportunityId: '550e8400-e29b-41d4-a716-446655440000',
        opportunityType: 'auction',
      };

      const response = await request(app.getHttpServer())
        .post('/addresses/link')
        .send(body)
        .expect(201);

      expect(response.body).toEqual([mockDiagnosticLink]);
      expect(
        mockAddressSearchService.searchAndLinkForOpportunity,
      ).toHaveBeenCalledWith(
        body.input,
        body.opportunityId,
        body.opportunityType,
      );
    });

    it('should return 200 with link results for listing', async () => {
      const listingLink = {
        ...mockDiagnosticLink,
        opportunityId: 'listing-123',
      };
      mockAddressSearchService.searchAndLinkForOpportunity.mockResolvedValue([
        listingLink,
      ]);

      const body = {
        input: {
          zipCode: '75001',
          energyClass: EnergyClass.F,
          squareFootage: 75,
        },
        opportunityId: '550e8400-e29b-41d4-a716-446655440001',
        opportunityType: 'listing',
      };

      await request(app.getHttpServer())
        .post('/addresses/link')
        .send(body)
        .expect(201);

      expect(
        mockAddressSearchService.searchAndLinkForOpportunity,
      ).toHaveBeenCalledWith(
        body.input,
        body.opportunityId,
        body.opportunityType,
      );
    });

    it('should return 400 for invalid opportunity ID', async () => {
      await request(app.getHttpServer())
        .post('/addresses/link')
        .send({
          input: {
            zipCode: '75001',
            energyClass: EnergyClass.F,
            squareFootage: 75,
          },
          opportunityId: 'invalid-uuid',
          opportunityType: 'auction',
        })
        .expect(400);
    });

    it('should return 400 for invalid opportunity type', async () => {
      await request(app.getHttpServer())
        .post('/addresses/link')
        .send({
          input: {
            zipCode: '75001',
            energyClass: EnergyClass.F,
            squareFootage: 75,
          },
          opportunityId: '550e8400-e29b-41d4-a716-446655440000',
          opportunityType: 'invalid-type',
        })
        .expect(400);
    });
  });

  describe('GET /addresses/links/:opportunityId', () => {
    it('should return 200 with diagnostic links for auction', async () => {
      mockAddressSearchService.getDiagnosticLinks.mockResolvedValue([
        mockDiagnosticLink,
      ]);

      const response = await request(app.getHttpServer())
        .get('/addresses/links/550e8400-e29b-41d4-a716-446655440000')
        .query({ opportunityType: 'auction' })
        .expect(200);

      expect(response.body).toEqual([mockDiagnosticLink]);
      expect(mockAddressSearchService.getDiagnosticLinks).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'auction',
      );
    });

    it('should return 200 with diagnostic links for listing', async () => {
      mockAddressSearchService.getDiagnosticLinks.mockResolvedValue([
        mockDiagnosticLink,
      ]);

      await request(app.getHttpServer())
        .get('/addresses/links/550e8400-e29b-41d4-a716-446655440001')
        .query({ opportunityType: 'listing' })
        .expect(200);

      expect(mockAddressSearchService.getDiagnosticLinks).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440001',
        'listing',
      );
    });

    it('should return empty array when no links found', async () => {
      mockAddressSearchService.getDiagnosticLinks.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/addresses/links/550e8400-e29b-41d4-a716-446655440002')
        .query({ opportunityType: 'auction' })
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 400 for missing opportunityType query param', async () => {
      await request(app.getHttpServer())
        .get('/addresses/links/550e8400-e29b-41d4-a716-446655440000')
        .expect(400);
    });

    it('should return 400 for invalid opportunityType query param', async () => {
      await request(app.getHttpServer())
        .get('/addresses/links/550e8400-e29b-41d4-a716-446655440000')
        .query({ opportunityType: 'invalid' })
        .expect(400);
    });
  });
});
