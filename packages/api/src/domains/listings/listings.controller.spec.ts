import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mockClass } from '~/test-utils/mock-class';
import {
  ListingService,
  ListingServiceErrorReason,
} from './services/listing.service';
import { ListingsController } from './listings.controller';
import {
  type Listing,
  EnergyClass,
  GazClass,
  PropertyType,
} from '@linkinvests/shared';
import { succeed, refuse } from '~/common/utils/operation-result';

describe('ListingsController', () => {
  let app: INestApplication;
  let mockListingService: jest.Mocked<ListingService>;

  const mockListing: Listing = {
    id: 'listing-123',
    label: 'Test Listing',
    streetAddress: '123 Test St',
    city: 'Paris',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    source: 'leboncoin',
    price: 250000,
    url: 'https://example.com/listing/123',
    propertyType: PropertyType.FLAT,
    lastChangeDate: '2024-01-15',
    energyClass: EnergyClass.D,
    gazClass: GazClass.D,
    isSoldRented: false,
    sellerType: 'professional',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaginatedResponse = {
    opportunities: [mockListing],
    page: 1,
    pageSize: 20,
  };

  beforeEach(async () => {
    mockListingService = mockClass(ListingService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [{ provide: ListingService, useValue: mockListingService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /listings/search', () => {
    it('should return 200 with paginated data when service succeeds', async () => {
      mockListingService.getListingsData.mockResolvedValue(
        succeed(mockPaginatedResponse),
      );

      const response = await request(app.getHttpServer())
        .post('/listings/search')
        .send({})
        .expect(201);

      expect(response.body).toEqual({
        ...mockPaginatedResponse,
        opportunities: [
          {
            ...mockListing,
            createdAt: mockListing.createdAt.toISOString(),
            updatedAt: mockListing.updatedAt.toISOString(),
          },
        ],
      });
      expect(mockListingService.getListingsData).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockListingService.getListingsData.mockResolvedValue(
        succeed(mockPaginatedResponse),
      );

      const filters = {
        departments: ['75'],
        page: 2,
        pageSize: 10,
      };

      await request(app.getHttpServer())
        .post('/listings/search')
        .send(filters)
        .expect(201);

      expect(mockListingService.getListingsData).toHaveBeenCalledWith(filters);
    });

    it('should return 500 when service returns error', async () => {
      mockListingService.getListingsData.mockResolvedValue(
        refuse(ListingServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer())
        .post('/listings/search')
        .send({})
        .expect(500);
    });
  });

  describe('POST /listings/count', () => {
    it('should return 200 with count object', async () => {
      mockListingService.getListingsCount.mockResolvedValue(succeed(42));

      const response = await request(app.getHttpServer())
        .post('/listings/count')
        .send({})
        .expect(201);

      expect(response.body).toEqual({ count: 42 });
      expect(mockListingService.getListingsCount).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockListingService.getListingsCount.mockResolvedValue(succeed(10));

      const filters = {
        departments: ['75'],
      };

      await request(app.getHttpServer())
        .post('/listings/count')
        .send(filters)
        .expect(201);

      expect(mockListingService.getListingsCount).toHaveBeenCalledWith(filters);
    });

    it('should return 500 when service returns error', async () => {
      mockListingService.getListingsCount.mockResolvedValue(
        refuse(ListingServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer())
        .post('/listings/count')
        .send({})
        .expect(500);
    });
  });

  describe('GET /listings/:id', () => {
    it('should return 200 with listing when found', async () => {
      mockListingService.getListingById.mockResolvedValue(succeed(mockListing));

      const response = await request(app.getHttpServer())
        .get('/listings/listing-123')
        .expect(200);

      expect(response.body).toEqual({
        ...mockListing,
        createdAt: mockListing.createdAt.toISOString(),
        updatedAt: mockListing.updatedAt.toISOString(),
      });
      expect(mockListingService.getListingById).toHaveBeenCalledWith(
        'listing-123',
      );
    });

    it('should return 404 when listing not found', async () => {
      mockListingService.getListingById.mockResolvedValue(
        refuse(ListingServiceErrorReason.NOT_FOUND),
      );

      await request(app.getHttpServer())
        .get('/listings/non-existent')
        .expect(404);

      expect(mockListingService.getListingById).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });

  describe('GET /listings/sources', () => {
    it('should return 200 with sources array', async () => {
      const mockSources = ['leboncoin', 'seloger', 'bienici'];
      mockListingService.getAvailableSources.mockResolvedValue(
        succeed(mockSources),
      );

      const response = await request(app.getHttpServer())
        .get('/listings/sources')
        .expect(200);

      expect(response.body).toEqual({ sources: mockSources });
      expect(mockListingService.getAvailableSources).toHaveBeenCalled();
    });

    it('should return 500 when service returns error', async () => {
      mockListingService.getAvailableSources.mockResolvedValue(
        refuse(ListingServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer()).get('/listings/sources').expect(500);
    });
  });

  describe('POST /listings/export', () => {
    it('should return CSV file with correct headers', async () => {
      const mockBlob = new Blob(['id,label\n1,Test'], { type: 'text/csv' });
      mockListingService.exportList.mockResolvedValue(succeed(mockBlob));

      const response = await request(app.getHttpServer())
        .post('/listings/export')
        .send({ format: 'csv' })
        .expect(201);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="listings.csv"',
      );
      expect(mockListingService.exportList).toHaveBeenCalledWith({}, 'csv');
    });

    it('should return XLSX file with correct headers', async () => {
      const mockBlob = new Blob(['xlsx data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockListingService.exportList.mockResolvedValue(succeed(mockBlob));

      const response = await request(app.getHttpServer())
        .post('/listings/export')
        .send({ format: 'xlsx' })
        .expect(201);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="listings.xlsx"',
      );
      expect(mockListingService.exportList).toHaveBeenCalledWith({}, 'xlsx');
    });

    it('should pass filters to service when provided', async () => {
      const mockBlob = new Blob(['data']);
      mockListingService.exportList.mockResolvedValue(succeed(mockBlob));

      const filters = { departments: ['75'] };

      await request(app.getHttpServer())
        .post('/listings/export')
        .send({ format: 'csv', filters })
        .expect(201);

      expect(mockListingService.exportList).toHaveBeenCalledWith(
        filters,
        'csv',
      );
    });

    it('should return 400 for invalid format', async () => {
      await request(app.getHttpServer())
        .post('/listings/export')
        .send({ format: 'pdf' })
        .expect(400);
    });

    it('should return 400 when export limit exceeded', async () => {
      mockListingService.exportList.mockResolvedValue(
        refuse(ListingServiceErrorReason.EXPORT_LIMIT_EXCEEDED),
      );

      await request(app.getHttpServer())
        .post('/listings/export')
        .send({ format: 'csv' })
        .expect(400);
    });

    it('should return 400 for unsupported format from service', async () => {
      mockListingService.exportList.mockResolvedValue(
        refuse(ListingServiceErrorReason.UNSUPPORTED_FORMAT),
      );

      await request(app.getHttpServer())
        .post('/listings/export')
        .send({ format: 'csv' })
        .expect(400);
    });
  });
});
