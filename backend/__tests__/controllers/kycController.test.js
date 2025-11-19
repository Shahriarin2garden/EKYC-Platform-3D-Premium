const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const kycController = require('../../src/controllers/kycController');
const Kyc = require('../../src/models/Kyc');
const Admin = require('../../src/models/Admin');
const auth = require('../../src/middleware/auth');

// Mock logger
jest.mock('../../src/config/logger', () => ({
  error: jest.fn(),
  ai: jest.fn()
}));

// Mock AI service
jest.mock('../../src/services/aiService', () => ({
  generateKycSummary: jest.fn().mockResolvedValue('AI Generated Summary')
}));

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/kyc/submit', kycController.submitKyc);
app.get('/kyc/all', auth, kycController.getAllKyc);
app.get('/kyc/:id', auth, kycController.getKycById);
app.put('/kyc/:id/status', auth, kycController.updateKycStatus);
app.get('/kyc/stats', auth, kycController.getKycStatistics);
app.delete('/kyc/:id', auth, kycController.deleteKyc);
app.post('/kyc/:id/regenerate-summary', auth, kycController.regenerateAiSummary);

let mongoServer;
let authToken;

describe('KYC Controller Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create admin for authenticated routes
    const admin = await Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123'
    });
    authToken = admin.generateAuthToken();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Kyc.deleteMany({});
  });

  describe('POST /kyc/submit', () => {
    test('should submit KYC application successfully', async () => {
      const kycData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        nid: '1234567890',
        occupation: 'Engineer'
      };

      const response = await request(app)
        .post('/kyc/submit')
        .send(kycData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(kycData.name);
      expect(response.body.data.email).toBe(kycData.email);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.summary).toBeDefined();
    });

    test('should reject duplicate email submission', async () => {
      const kycData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St'
      };

      await request(app).post('/kyc/submit').send(kycData);

      const response = await request(app)
        .post('/kyc/submit')
        .send(kycData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should reject invalid email format', async () => {
      const kycData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/kyc/submit')
        .send(kycData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should accept submission without optional fields', async () => {
      const minimalData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const response = await request(app)
        .post('/kyc/submit')
        .send(minimalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(minimalData.email);
    });
  });

  describe('GET /kyc/all', () => {
    beforeEach(async () => {
      await Kyc.create([
        { name: 'User 1', email: 'user1@example.com', status: 'pending' },
        { name: 'User 2', email: 'user2@example.com', status: 'approved' },
        { name: 'User 3', email: 'user3@example.com', status: 'pending' }
      ]);
    });

    test('should get all KYC applications', async () => {
      const response = await request(app)
        .get('/kyc/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.kycs.length).toBe(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/kyc/all?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.kycs.length).toBe(2);
      expect(response.body.data.kycs.every(k => k.status === 'pending')).toBe(true);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/kyc/all?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.kycs.length).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/kyc/all')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /kyc/:id', () => {
    test('should get KYC application by ID', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const response = await request(app)
        .get(`/kyc/${kyc._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john@example.com');
    });

    test('should return 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/kyc/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /kyc/:id/status', () => {
    test('should update KYC status successfully', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com',
        status: 'pending'
      });

      const response = await request(app)
        .put(`/kyc/${kyc._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'approved',
          reviewNotes: 'Application approved'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.reviewNotes).toBe('Application approved');
    });

    test('should reject invalid status', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const response = await request(app)
        .put(`/kyc/${kyc._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status');
    });
  });

  describe('DELETE /kyc/:id', () => {
    test('should delete KYC application successfully', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const response = await request(app)
        .delete(`/kyc/${kyc._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      const deletedKyc = await Kyc.findById(kyc._id);
      expect(deletedKyc).toBeNull();
    });

    test('should return 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/kyc/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /kyc/:id/regenerate-summary', () => {
    test('should regenerate AI summary successfully', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com',
        aiSummary: 'Old summary'
      });

      const response = await request(app)
        .post(`/kyc/${kyc._id}/regenerate-summary`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.aiSummary).toBe('AI Generated Summary');
    });
  });
});
