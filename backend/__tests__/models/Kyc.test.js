const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Kyc = require('../../src/models/Kyc');

let mongoServer;

describe('Kyc Model Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Kyc.deleteMany({});
  });

  describe('KYC Creation', () => {
    test('should create a valid KYC application', async () => {
      const validKyc = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        nid: '1234567890',
        occupation: 'Engineer'
      };

      const kyc = await Kyc.create(validKyc);

      expect(kyc._id).toBeDefined();
      expect(kyc.name).toBe(validKyc.name);
      expect(kyc.email).toBe(validKyc.email);
      expect(kyc.address).toBe(validKyc.address);
      expect(kyc.nid).toBe(validKyc.nid);
      expect(kyc.occupation).toBe(validKyc.occupation);
      expect(kyc.status).toBe('pending'); // Default status
      expect(kyc.submittedAt).toBeDefined();
    });

    test('should fail to create KYC without required fields', async () => {
      const invalidKyc = {
        name: 'John Doe'
      };

      await expect(Kyc.create(invalidKyc)).rejects.toThrow();
    });

    test('should fail to create KYC with invalid email', async () => {
      const invalidKyc = {
        name: 'John Doe',
        email: 'invalid-email',
        address: '123 Main St'
      };

      await expect(Kyc.create(invalidKyc)).rejects.toThrow();
    });

    test('should not allow duplicate emails', async () => {
      const kycData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St'
      };

      await Kyc.create(kycData);
      await expect(Kyc.create(kycData)).rejects.toThrow();
    });

    test('should create KYC with optional fields', async () => {
      const minimalKyc = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const kyc = await Kyc.create(minimalKyc);

      expect(kyc._id).toBeDefined();
      expect(kyc.name).toBe(minimalKyc.name);
      expect(kyc.email).toBe(minimalKyc.email);
      expect(kyc.address).toBeUndefined();
      expect(kyc.nid).toBeUndefined();
      expect(kyc.occupation).toBeUndefined();
    });
  });

  describe('Status Management', () => {
    test('should have default status of pending', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      expect(kyc.status).toBe('pending');
    });

    test('should allow valid status updates', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];

      for (const status of validStatuses) {
        kyc.status = status;
        await kyc.save();
        expect(kyc.status).toBe(status);
      }
    });

    test('should reject invalid status', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      kyc.status = 'invalid_status';
      await expect(kyc.save()).rejects.toThrow();
    });
  });

  describe('Statistics', () => {
    test('should calculate statistics correctly', async () => {
      // Create KYC applications with different statuses
      await Kyc.create([
        { name: 'User 1', email: 'user1@example.com', status: 'pending' },
        { name: 'User 2', email: 'user2@example.com', status: 'pending' },
        { name: 'User 3', email: 'user3@example.com', status: 'approved' },
        { name: 'User 4', email: 'user4@example.com', status: 'rejected' },
        { name: 'User 5', email: 'user5@example.com', status: 'under_review' }
      ]);

      const stats = await Kyc.getStatistics();

      expect(stats.pending).toBe(2);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.under_review).toBe(1);
    });

    test('should return empty object when no applications exist', async () => {
      const stats = await Kyc.getStatistics();
      expect(stats).toEqual({});
    });
  });

  describe('Generate Summary', () => {
    test('should generate correct summary', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        nid: '1234567890',
        occupation: 'Engineer'
      });

      const summary = kyc.generateSummary();

      expect(summary).toContain('John Doe');
      expect(summary).toContain('john@example.com');
      expect(summary).toContain('1234567890');
      expect(summary).toContain('Engineer');
      expect(summary).toContain('123 Main St');
      expect(summary).toContain('pending');
    });

    test('should handle missing optional fields in summary', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const summary = kyc.generateSummary();

      expect(summary).toContain('John Doe');
      expect(summary).toContain('john@example.com');
      expect(summary).toContain('N/A');
    });
  });

  describe('Timestamps', () => {
    test('should automatically set submittedAt', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      expect(kyc.submittedAt).toBeDefined();
      expect(kyc.submittedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on save', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const originalUpdatedAt = kyc.updatedAt;

      // Wait a bit and update
      await new Promise(resolve => setTimeout(resolve, 10));
      kyc.status = 'approved';
      await kyc.save();

      expect(kyc.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('PDF Tracking', () => {
    test('should track PDF generation', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      expect(kyc.pdfPath).toBeUndefined();
      expect(kyc.pdfGeneratedAt).toBeUndefined();

      kyc.pdfPath = '/path/to/pdf.pdf';
      kyc.pdfGeneratedAt = new Date();
      await kyc.save();

      expect(kyc.pdfPath).toBe('/path/to/pdf.pdf');
      expect(kyc.pdfGeneratedAt).toBeDefined();
    });

    test('should track PDF errors', async () => {
      const kyc = await Kyc.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      kyc.pdfError = 'Generation failed';
      kyc.pdfErrorAt = new Date();
      await kyc.save();

      expect(kyc.pdfError).toBe('Generation failed');
      expect(kyc.pdfErrorAt).toBeDefined();
    });
  });
});
