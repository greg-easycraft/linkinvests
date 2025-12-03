import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mockClass } from '~/test-utils/mock-class';
import { LiquidationService } from './services/liquidation.service';
import { LiquidationsController } from './liquidations.controller';
import type { Liquidation } from '@linkinvests/shared';

describe('LiquidationsController', () => {
  let app: INestApplication;
  let mockLiquidationService: jest.Mocked<LiquidationService>;

  const mockLiquidation: Liquidation = {
    id: 'liquidation-123',
    label: 'Test Liquidation',
    address: '123 Test St',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    siret: '12345678901234',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaginatedResponse = {
    opportunities: [mockLiquidation],
    page: 1,
    pageSize: 20,
  };

  beforeEach(async () => {
    mockLiquidationService = mockClass(LiquidationService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LiquidationsController],
      providers: [
        { provide: LiquidationService, useValue: mockLiquidationService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /liquidations/search', () => {
    it('should return 200 with paginated data when service succeeds', async () => {
      mockLiquidationService.getLiquidationsData.mockResolvedValue(
        mockPaginatedResponse,
      );

      const response = await request(app.getHttpServer())
        .post('/liquidations/search')
        .send({})
        .expect(201);

      expect(response.body).toEqual({
        ...mockPaginatedResponse,
        opportunities: [
          {
            ...mockLiquidation,
            createdAt: mockLiquidation.createdAt.toISOString(),
            updatedAt: mockLiquidation.updatedAt.toISOString(),
          },
        ],
      });
      expect(mockLiquidationService.getLiquidationsData).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockLiquidationService.getLiquidationsData.mockResolvedValue(
        mockPaginatedResponse,
      );

      const filters = {
        departments: ['75'],
        page: 2,
        pageSize: 10,
      };

      await request(app.getHttpServer())
        .post('/liquidations/search')
        .send(filters)
        .expect(201);

      expect(mockLiquidationService.getLiquidationsData).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  describe('POST /liquidations/count', () => {
    it('should return 200 with count object', async () => {
      mockLiquidationService.getLiquidationsCount.mockResolvedValue(42);

      const response = await request(app.getHttpServer())
        .post('/liquidations/count')
        .send({})
        .expect(201);

      expect(response.body).toEqual({ count: 42 });
      expect(mockLiquidationService.getLiquidationsCount).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockLiquidationService.getLiquidationsCount.mockResolvedValue(10);

      const filters = {
        departments: ['75'],
      };

      await request(app.getHttpServer())
        .post('/liquidations/count')
        .send(filters)
        .expect(201);

      expect(mockLiquidationService.getLiquidationsCount).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  describe('GET /liquidations/:id', () => {
    it('should return 200 with liquidation when found', async () => {
      mockLiquidationService.getLiquidationById.mockResolvedValue(
        mockLiquidation,
      );

      const response = await request(app.getHttpServer())
        .get('/liquidations/liquidation-123')
        .expect(200);

      expect(response.body).toEqual({
        ...mockLiquidation,
        createdAt: mockLiquidation.createdAt.toISOString(),
        updatedAt: mockLiquidation.updatedAt.toISOString(),
      });
      expect(mockLiquidationService.getLiquidationById).toHaveBeenCalledWith(
        'liquidation-123',
      );
    });

    it('should return 404 when liquidation not found', async () => {
      mockLiquidationService.getLiquidationById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/liquidations/non-existent')
        .expect(404);

      expect(mockLiquidationService.getLiquidationById).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });

  describe('POST /liquidations/export', () => {
    it('should return CSV file with correct headers', async () => {
      const mockBlob = new Blob(['id,label\n1,Test'], { type: 'text/csv' });
      mockLiquidationService.exportList.mockResolvedValue(mockBlob);

      const response = await request(app.getHttpServer())
        .post('/liquidations/export')
        .send({ format: 'csv' })
        .expect(201);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="liquidations.csv"',
      );
      expect(mockLiquidationService.exportList).toHaveBeenCalledWith({}, 'csv');
    });

    it('should return XLSX file with correct headers', async () => {
      const mockBlob = new Blob(['xlsx data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockLiquidationService.exportList.mockResolvedValue(mockBlob);

      const response = await request(app.getHttpServer())
        .post('/liquidations/export')
        .send({ format: 'xlsx' })
        .expect(201);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="liquidations.xlsx"',
      );
      expect(mockLiquidationService.exportList).toHaveBeenCalledWith(
        {},
        'xlsx',
      );
    });

    it('should pass filters to service when provided', async () => {
      const mockBlob = new Blob(['data']);
      mockLiquidationService.exportList.mockResolvedValue(mockBlob);

      const filters = { departments: ['75'] };

      await request(app.getHttpServer())
        .post('/liquidations/export')
        .send({ format: 'csv', filters })
        .expect(201);

      expect(mockLiquidationService.exportList).toHaveBeenCalledWith(
        filters,
        'csv',
      );
    });

    it('should return 400 for invalid format', async () => {
      await request(app.getHttpServer())
        .post('/liquidations/export')
        .send({ format: 'pdf' })
        .expect(400);
    });
  });
});
