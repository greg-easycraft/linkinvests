import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mockClass } from '~/test-utils/mock-class';
import {
  EnergyDiagnosticsService,
  EnergyDiagnosticsServiceErrorReason,
} from './services/energy-diagnostics.service';
import { EnergyDiagnosticsController } from './energy-diagnostics.controller';
import { EnergyClass, GazClass, type EnergyDiagnostic } from '@linkinvests/shared';
import { succeed, refuse } from '~/common/utils/operation-result';

describe('EnergyDiagnosticsController', () => {
  let app: INestApplication;
  let mockEnergyDiagnosticsService: jest.Mocked<EnergyDiagnosticsService>;

  const mockEnergyDiagnostic: EnergyDiagnostic = {
    id: 'energy-diagnostic-123',
    label: 'Test Energy Diagnostic',
    address: '123 Test St',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    squareFootage: 75,
    energyClass: EnergyClass.F,
    gazClass: GazClass.F,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaginatedResponse = {
    opportunities: [mockEnergyDiagnostic],
    page: 1,
    pageSize: 20,
  };

  beforeEach(async () => {
    mockEnergyDiagnosticsService = mockClass(EnergyDiagnosticsService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EnergyDiagnosticsController],
      providers: [
        {
          provide: EnergyDiagnosticsService,
          useValue: mockEnergyDiagnosticsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /energy-diagnostics/search', () => {
    it('should return 200 with paginated data when service succeeds', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticsData.mockResolvedValue(
        succeed(mockPaginatedResponse),
      );

      const response = await request(app.getHttpServer())
        .post('/energy-diagnostics/search')
        .send({})
        .expect(201);

      expect(response.body).toEqual({
        ...mockPaginatedResponse,
        opportunities: [
          {
            ...mockEnergyDiagnostic,
            createdAt: mockEnergyDiagnostic.createdAt.toISOString(),
            updatedAt: mockEnergyDiagnostic.updatedAt.toISOString(),
          },
        ],
      });
      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticsData,
      ).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticsData.mockResolvedValue(
        succeed(mockPaginatedResponse),
      );

      const filters = {
        departments: ['75'],
        page: 2,
        pageSize: 10,
      };

      await request(app.getHttpServer())
        .post('/energy-diagnostics/search')
        .send(filters)
        .expect(201);

      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticsData,
      ).toHaveBeenCalledWith(filters);
    });

    it('should return 500 when service returns error', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticsData.mockResolvedValue(
        refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer())
        .post('/energy-diagnostics/search')
        .send({})
        .expect(500);
    });
  });

  describe('POST /energy-diagnostics/count', () => {
    it('should return 200 with count object', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticsCount.mockResolvedValue(
        succeed(42),
      );

      const response = await request(app.getHttpServer())
        .post('/energy-diagnostics/count')
        .send({})
        .expect(201);

      expect(response.body).toEqual({ count: 42 });
      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticsCount,
      ).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticsCount.mockResolvedValue(
        succeed(10),
      );

      const filters = {
        departments: ['75'],
      };

      await request(app.getHttpServer())
        .post('/energy-diagnostics/count')
        .send(filters)
        .expect(201);

      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticsCount,
      ).toHaveBeenCalledWith(filters);
    });

    it('should return 500 when service returns error', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticsCount.mockResolvedValue(
        refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR),
      );

      await request(app.getHttpServer())
        .post('/energy-diagnostics/count')
        .send({})
        .expect(500);
    });
  });

  describe('GET /energy-diagnostics/:id', () => {
    it('should return 200 with energy diagnostic when found', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticById.mockResolvedValue(
        succeed(mockEnergyDiagnostic),
      );

      const response = await request(app.getHttpServer())
        .get('/energy-diagnostics/energy-diagnostic-123')
        .expect(200);

      expect(response.body).toEqual({
        ...mockEnergyDiagnostic,
        createdAt: mockEnergyDiagnostic.createdAt.toISOString(),
        updatedAt: mockEnergyDiagnostic.updatedAt.toISOString(),
      });
      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticById,
      ).toHaveBeenCalledWith('energy-diagnostic-123');
    });

    it('should return 404 when energy diagnostic not found', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticById.mockResolvedValue(
        refuse(EnergyDiagnosticsServiceErrorReason.NOT_FOUND),
      );

      await request(app.getHttpServer())
        .get('/energy-diagnostics/non-existent')
        .expect(404);

      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticById,
      ).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('GET /energy-diagnostics/external/:externalId', () => {
    it('should return 200 with energy diagnostic when found by external ID', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticByExternalId.mockResolvedValue(
        succeed(mockEnergyDiagnostic),
      );

      const response = await request(app.getHttpServer())
        .get('/energy-diagnostics/external/external-123')
        .expect(200);

      expect(response.body).toEqual({
        ...mockEnergyDiagnostic,
        createdAt: mockEnergyDiagnostic.createdAt.toISOString(),
        updatedAt: mockEnergyDiagnostic.updatedAt.toISOString(),
      });
      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticByExternalId,
      ).toHaveBeenCalledWith('external-123');
    });

    it('should return 404 when energy diagnostic not found by external ID', async () => {
      mockEnergyDiagnosticsService.getEnergyDiagnosticByExternalId.mockResolvedValue(
        refuse(EnergyDiagnosticsServiceErrorReason.NOT_FOUND),
      );

      await request(app.getHttpServer())
        .get('/energy-diagnostics/external/non-existent-external')
        .expect(404);

      expect(
        mockEnergyDiagnosticsService.getEnergyDiagnosticByExternalId,
      ).toHaveBeenCalledWith('non-existent-external');
    });
  });

  describe('POST /energy-diagnostics/export', () => {
    it('should return CSV file with correct headers', async () => {
      const mockBlob = new Blob(['id,label\n1,Test'], { type: 'text/csv' });
      mockEnergyDiagnosticsService.exportList.mockResolvedValue(
        succeed(mockBlob),
      );

      const response = await request(app.getHttpServer())
        .post('/energy-diagnostics/export')
        .send({ format: 'csv' })
        .expect(201);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="energy-diagnostics.csv"',
      );
      expect(mockEnergyDiagnosticsService.exportList).toHaveBeenCalledWith(
        {},
        'csv',
      );
    });

    it('should return XLSX file with correct headers', async () => {
      const mockBlob = new Blob(['xlsx data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockEnergyDiagnosticsService.exportList.mockResolvedValue(
        succeed(mockBlob),
      );

      const response = await request(app.getHttpServer())
        .post('/energy-diagnostics/export')
        .send({ format: 'xlsx' })
        .expect(201);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="energy-diagnostics.xlsx"',
      );
      expect(mockEnergyDiagnosticsService.exportList).toHaveBeenCalledWith(
        {},
        'xlsx',
      );
    });

    it('should pass filters to service when provided', async () => {
      const mockBlob = new Blob(['data']);
      mockEnergyDiagnosticsService.exportList.mockResolvedValue(
        succeed(mockBlob),
      );

      const filters = { departments: ['75'] };

      await request(app.getHttpServer())
        .post('/energy-diagnostics/export')
        .send({ format: 'csv', filters })
        .expect(201);

      expect(mockEnergyDiagnosticsService.exportList).toHaveBeenCalledWith(
        filters,
        'csv',
      );
    });

    it('should return 400 for invalid format', async () => {
      await request(app.getHttpServer())
        .post('/energy-diagnostics/export')
        .send({ format: 'pdf' })
        .expect(400);
    });

    it('should return 400 when export limit exceeded', async () => {
      mockEnergyDiagnosticsService.exportList.mockResolvedValue(
        refuse(EnergyDiagnosticsServiceErrorReason.EXPORT_LIMIT_EXCEEDED),
      );

      await request(app.getHttpServer())
        .post('/energy-diagnostics/export')
        .send({ format: 'csv' })
        .expect(400);
    });

    it('should return 400 for unsupported format from service', async () => {
      mockEnergyDiagnosticsService.exportList.mockResolvedValue(
        refuse(EnergyDiagnosticsServiceErrorReason.UNSUPPORTED_FORMAT),
      );

      await request(app.getHttpServer())
        .post('/energy-diagnostics/export')
        .send({ format: 'csv' })
        .expect(400);
    });
  });
});
