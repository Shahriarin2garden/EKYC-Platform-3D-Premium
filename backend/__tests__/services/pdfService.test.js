const fs = require('node:fs');
const path = require('node:path');
const pdfService = require('../../src/services/pdfService');

// Mock logger
jest.mock('../../src/config/logger', () => ({
  pdf: jest.fn(),
  error: jest.fn()
}));

// Mock PDFKit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    fontSize: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    strokeColor: jest.fn().mockReturnThis(),
    lineWidth: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    pipe: jest.fn(),
    end: jest.fn(),
    page: { height: 792, width: 612 },
    y: 100
  }));
});

describe('PDF Service Tests', () => {
  const mockKycData = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St, City, Country',
    nid: '1234567890',
    occupation: 'Software Engineer',
    status: 'pending',
    submittedAt: new Date('2024-01-01'),
    aiSummary: 'This is a test AI summary for the KYC application.'
  };

  const PDF_DIR = pdfService.getPdfDirectory();

  beforeAll(() => {
    // Ensure PDF directory exists
    if (!fs.existsSync(PDF_DIR)) {
      fs.mkdirSync(PDF_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test PDFs
    if (fs.existsSync(PDF_DIR)) {
      const files = fs.readdirSync(PDF_DIR);
      files.forEach(file => {
        if (file.startsWith('kyc_') && file.endsWith('.pdf')) {
          fs.unlinkSync(path.join(PDF_DIR, file));
        }
      });
    }
  });

  describe('PDF Generation', () => {
    test('should generate PDF successfully', async () => {
      const pdfPath = await pdfService.generateKycPdf(mockKycData);

      expect(pdfPath).toBeDefined();
      expect(typeof pdfPath).toBe('string');
      expect(pdfPath).toContain('kyc_');
      expect(pdfPath).toContain('.pdf');
    });

    test('should create PDF in correct directory', async () => {
      const pdfPath = await pdfService.generateKycPdf(mockKycData);
      const directory = path.dirname(pdfPath);

      expect(directory).toBe(PDF_DIR);
    });

    test('should generate unique filenames', async () => {
      const path1 = await pdfService.generateKycPdf(mockKycData);
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const path2 = await pdfService.generateKycPdf(mockKycData);

      expect(path1).not.toBe(path2);
    });

    test('should handle KYC data without optional fields', async () => {
      const minimalKycData = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'pending',
        submittedAt: new Date()
      };

      const pdfPath = await pdfService.generateKycPdf(minimalKycData);

      expect(pdfPath).toBeDefined();
      expect(pdfPath).toContain('.pdf');
    });
  });

  describe('PDF Directory Management', () => {
    test('should return correct PDF directory', () => {
      const directory = pdfService.getPdfDirectory();

      expect(directory).toBeDefined();
      expect(typeof directory).toBe('string');
      expect(directory).toContain('pdfs');
    });

    test('should ensure PDF directory exists', () => {
      const directory = pdfService.getPdfDirectory();
      const exists = fs.existsSync(directory);

      expect(exists).toBe(true);
    });
  });

  describe('PDF File Operations', () => {
    test('should check if PDF exists', async () => {
      const pdfPath = await pdfService.generateKycPdf(mockKycData);
      const exists = pdfService.pdfExists(pdfPath);

      expect(exists).toBe(true);
    });

    test('should return false for non-existent PDF', () => {
      const fakePath = path.join(PDF_DIR, 'nonexistent.pdf');
      const exists = pdfService.pdfExists(fakePath);

      expect(exists).toBe(false);
    });

    test('should delete PDF successfully', async () => {
      const pdfPath = await pdfService.generateKycPdf(mockKycData);
      
      expect(pdfService.pdfExists(pdfPath)).toBe(true);
      
      await pdfService.deletePdf(pdfPath);
      
      expect(pdfService.pdfExists(pdfPath)).toBe(false);
    });

    test('should handle deletion of non-existent file', async () => {
      const fakePath = path.join(PDF_DIR, 'nonexistent.pdf');
      const result = await pdfService.deletePdf(fakePath);

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid KYC data gracefully', async () => {
      const invalidData = null;

      await expect(pdfService.generateKycPdf(invalidData)).rejects.toThrow();
    });

    test('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe'
        // Missing required fields
      };

      await expect(pdfService.generateKycPdf(incompleteData)).rejects.toThrow();
    });
  });
});
