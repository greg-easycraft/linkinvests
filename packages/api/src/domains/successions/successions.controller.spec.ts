import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mockClass } from '~/test-utils/mock-class';
import { SuccessionService } from './services/succession.service';
import { SuccessionsController } from './successions.controller';
import type { Succession } from '@linkinvests/shared';

describe('SuccessionsController', () => {
  let app: INestApplication;
  let mockSuccessionService: jest.Mocked<SuccessionService>;

  const mockSuccession: Succession = {
    id: 'succession-123',
    label: 'Test Succession',
    address: '123 Test St',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: 'external-123',
    firstName: 'Jean',
    lastName: 'Dupont',
    mairieContact: {
      name: 'Mairie de Paris',
      address: {
        complement1: '',
        complement2: '',
        numero_voie: "4 place de l'Hotel de Ville",
        service_distribution: '',
        code_postal: '75001',
        nom_commune: 'PARIS',
      },
      phone: '01 42 76 40 40',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaginatedResponse = {
    opportunities: [mockSuccession],
    page: 1,
    pageSize: 20,
  };

  beforeEach(async () => {
    mockSuccessionService = mockClass(SuccessionService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SuccessionsController],
      providers: [
        { provide: SuccessionService, useValue: mockSuccessionService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /successions/search', () => {
    it('should return 200 with paginated data when service succeeds', async () => {
      mockSuccessionService.getSuccessionsData.mockResolvedValue(
        mockPaginatedResponse,
      );

      const response = await request(app.getHttpServer())
        .post('/successions/search')
        .send({})
        .expect(201);

      expect(response.body).toEqual({
        ...mockPaginatedResponse,
        opportunities: [
          {
            ...mockSuccession,
            createdAt: mockSuccession.createdAt.toISOString(),
            updatedAt: mockSuccession.updatedAt.toISOString(),
          },
        ],
      });
      expect(mockSuccessionService.getSuccessionsData).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockSuccessionService.getSuccessionsData.mockResolvedValue(
        mockPaginatedResponse,
      );

      const filters = {
        departments: ['75'],
        page: 2,
        pageSize: 10,
      };

      await request(app.getHttpServer())
        .post('/successions/search')
        .send(filters)
        .expect(201);

      expect(mockSuccessionService.getSuccessionsData).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  describe('POST /successions/count', () => {
    it('should return 200 with count object', async () => {
      mockSuccessionService.getSuccessionsCount.mockResolvedValue(42);

      const response = await request(app.getHttpServer())
        .post('/successions/count')
        .send({})
        .expect(201);

      expect(response.body).toEqual({ count: 42 });
      expect(mockSuccessionService.getSuccessionsCount).toHaveBeenCalled();
    });

    it('should pass filters to service correctly', async () => {
      mockSuccessionService.getSuccessionsCount.mockResolvedValue(10);

      const filters = {
        departments: ['75'],
      };

      await request(app.getHttpServer())
        .post('/successions/count')
        .send(filters)
        .expect(201);

      expect(mockSuccessionService.getSuccessionsCount).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  describe('GET /successions/:id', () => {
    it('should return 200 with succession when found', async () => {
      mockSuccessionService.getSuccessionById.mockResolvedValue(mockSuccession);

      const response = await request(app.getHttpServer())
        .get('/successions/succession-123')
        .expect(200);

      expect(response.body).toEqual({
        ...mockSuccession,
        createdAt: mockSuccession.createdAt.toISOString(),
        updatedAt: mockSuccession.updatedAt.toISOString(),
      });
      expect(mockSuccessionService.getSuccessionById).toHaveBeenCalledWith(
        'succession-123',
      );
    });

    it('should return 404 when succession not found', async () => {
      mockSuccessionService.getSuccessionById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/successions/non-existent')
        .expect(404);

      expect(mockSuccessionService.getSuccessionById).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });

  describe('POST /successions/export', () => {
    it('should return CSV file with correct headers', async () => {
      const mockBlob = new Blob(['id,label\n1,Test'], { type: 'text/csv' });
      mockSuccessionService.exportList.mockResolvedValue(mockBlob);

      const response = await request(app.getHttpServer())
        .post('/successions/export')
        .send({ format: 'csv' })
        .expect(201);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="successions.csv"',
      );
      expect(mockSuccessionService.exportList).toHaveBeenCalledWith({}, 'csv');
    });

    it('should return XLSX file with correct headers', async () => {
      const mockBlob = new Blob(['xlsx data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockSuccessionService.exportList.mockResolvedValue(mockBlob);

      const response = await request(app.getHttpServer())
        .post('/successions/export')
        .send({ format: 'xlsx' })
        .expect(201);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename="successions.xlsx"',
      );
      expect(mockSuccessionService.exportList).toHaveBeenCalledWith({}, 'xlsx');
    });

    it('should pass filters to service when provided', async () => {
      const mockBlob = new Blob(['data']);
      mockSuccessionService.exportList.mockResolvedValue(mockBlob);

      const filters = { departments: ['75'] };

      await request(app.getHttpServer())
        .post('/successions/export')
        .send({ format: 'csv', filters })
        .expect(201);

      expect(mockSuccessionService.exportList).toHaveBeenCalledWith(
        filters,
        'csv',
      );
    });

    it('should return 400 for invalid format', async () => {
      await request(app.getHttpServer())
        .post('/successions/export')
        .send({ format: 'pdf' })
        .expect(400);
    });
  });
});
