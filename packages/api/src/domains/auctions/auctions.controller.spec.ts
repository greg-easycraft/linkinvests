import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mockClass } from '~/test-utils/mock-class';
import {
  AuctionService,
  AuctionServiceErrorReason,
} from './services/auction.service';
import { AuctionsController } from './auctions.controller';
import {
  type Auction,
  EnergyClass,
  GazClass,
  AuctionSource,
  AuctionOccupationStatus,
} from '@linkinvests/shared';
import { succeed, refuse } from '~/common/utils/operation-result';

describe('AuctionsController', () => {
  let app: INestApplication;
  let mockAuctionService: jest.Mocked<AuctionService>;

  const mockAuction: Auction = {
    id: 'auction-123',
    label: 'Test Auction',
    streetAddress: '123 Test St',
    city: 'Paris',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    url: 'https://example.com/auction/123',
    energyClass: EnergyClass.F,
    gazClass: GazClass.F,
    source: AuctionSource.ENCHERES_PUBLIQUES,
    occupationStatus: AuctionOccupationStatus.FREE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaginatedResponse = {
    opportunities: [mockAuction],
    page: 1,
    pageSize: 20,
  };

  beforeEach(async () => {
    mockAuctionService = mockClass(AuctionService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuctionsController],
      providers: [{ provide: AuctionService, useValue: mockAuctionService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auctions/search', () => {
    it('should return 200 with paginated data when service succeeds', async () => {
      mockAuctionService.getAuctionsData.mockResolvedValue(
        succeed(mockPaginatedResponse),
      );

      const response = await request(app.getHttpServer())
        .post('/auctions/search')
        .send({})
        .expect(201);

      expect(response.body).toEqual({
        ...mockPaginatedResponse,
        opportunities: [
          {
            ...mockAuction,
            createdAt: mockAuction.createdAt.toISOString(),
            updatedAt: mockAuction.updatedAt.toISOString(),
          },
        ],
      });
      expect(mockAuctionService.getAuctionsData).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockAuctionService.getAuctionsData.mockResolvedValue(
        succeed(mockPaginatedResponse),
      );

      const filters = {
        departments: ['75'],
        page: 2,
        pageSize: 10,
      };

      await request(app.getHttpServer())
        .post('/auctions/search')
        .send(filters)
        .expect(201);

      expect(mockAuctionService.getAuctionsData).toHaveBeenCalledWith(filters);
    });

    it('should return 500 when service returns error', async () => {
      mockAuctionService.getAuctionsData.mockResolvedValue(
        refuse(AuctionServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer())
        .post('/auctions/search')
        .send({})
        .expect(500);
    });
  });

  describe('POST /auctions/count', () => {
    it('should return 200 with count object', async () => {
      mockAuctionService.getAuctionsCount.mockResolvedValue(succeed(42));

      const response = await request(app.getHttpServer())
        .post('/auctions/count')
        .send({})
        .expect(201);

      expect(response.body).toEqual({ count: 42 });
      expect(mockAuctionService.getAuctionsCount).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockAuctionService.getAuctionsCount.mockResolvedValue(succeed(10));

      const filters = {
        departments: ['75'],
      };

      await request(app.getHttpServer())
        .post('/auctions/count')
        .send(filters)
        .expect(201);

      expect(mockAuctionService.getAuctionsCount).toHaveBeenCalledWith(filters);
    });

    it('should return 500 when service returns error', async () => {
      mockAuctionService.getAuctionsCount.mockResolvedValue(
        refuse(AuctionServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer())
        .post('/auctions/count')
        .send({})
        .expect(500);
    });
  });

  describe('GET /auctions/:id', () => {
    it('should return 200 with auction when found', async () => {
      mockAuctionService.getAuctionById.mockResolvedValue(succeed(mockAuction));

      const response = await request(app.getHttpServer())
        .get('/auctions/auction-123')
        .expect(200);

      expect(response.body).toEqual({
        ...mockAuction,
        createdAt: mockAuction.createdAt.toISOString(),
        updatedAt: mockAuction.updatedAt.toISOString(),
      });
      expect(mockAuctionService.getAuctionById).toHaveBeenCalledWith(
        'auction-123',
      );
    });

    it('should return 404 when auction not found', async () => {
      mockAuctionService.getAuctionById.mockResolvedValue(
        refuse(AuctionServiceErrorReason.NOT_FOUND),
      );

      await request(app.getHttpServer())
        .get('/auctions/non-existent')
        .expect(404);

      expect(mockAuctionService.getAuctionById).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });

  describe('POST /auctions/export', () => {
    it('should return CSV file with correct headers', async () => {
      const mockBlob = new Blob(['id,label\n1,Test'], { type: 'text/csv' });
      mockAuctionService.exportList.mockResolvedValue(succeed(mockBlob));

      const response = await request(app.getHttpServer())
        .post('/auctions/export')
        .send({ format: 'csv' })
        .expect(201);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="auctions.csv"',
      );
      expect(mockAuctionService.exportList).toHaveBeenCalledWith({}, 'csv');
    });

    it('should return XLSX file with correct headers', async () => {
      const mockBlob = new Blob(['xlsx data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockAuctionService.exportList.mockResolvedValue(succeed(mockBlob));

      const response = await request(app.getHttpServer())
        .post('/auctions/export')
        .send({ format: 'xlsx' })
        .expect(201);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="auctions.xlsx"',
      );
      expect(mockAuctionService.exportList).toHaveBeenCalledWith({}, 'xlsx');
    });

    it('should pass filters to service when provided', async () => {
      const mockBlob = new Blob(['data']);
      mockAuctionService.exportList.mockResolvedValue(succeed(mockBlob));

      const filters = { departments: ['75'] };

      await request(app.getHttpServer())
        .post('/auctions/export')
        .send({ format: 'csv', filters })
        .expect(201);

      expect(mockAuctionService.exportList).toHaveBeenCalledWith(
        filters,
        'csv',
      );
    });

    it('should return 400 for invalid format', async () => {
      await request(app.getHttpServer())
        .post('/auctions/export')
        .send({ format: 'pdf' })
        .expect(400);
    });

    it('should return 400 when export limit exceeded', async () => {
      mockAuctionService.exportList.mockResolvedValue(
        refuse(AuctionServiceErrorReason.EXPORT_LIMIT_EXCEEDED),
      );

      await request(app.getHttpServer())
        .post('/auctions/export')
        .send({ format: 'csv' })
        .expect(400);
    });

    it('should return 400 for unsupported format from service', async () => {
      mockAuctionService.exportList.mockResolvedValue(
        refuse(AuctionServiceErrorReason.UNSUPPORTED_FORMAT),
      );

      await request(app.getHttpServer())
        .post('/auctions/export')
        .send({ format: 'csv' })
        .expect(400);
    });
  });
});
