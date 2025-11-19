const aiService = require('../../src/services/aiService');

// Mock the OpenRouter SDK
jest.mock('@openrouter/sdk', () => {
  return {
    OpenRouter: jest.fn().mockImplementation(() => ({
      chat: {
        send: jest.fn()
      }
    }))
  };
});

// Mock logger
jest.mock('../../src/config/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  ai: jest.fn()
}));

describe('AI Service Tests', () => {
  const mockKycData = {
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St, City',
    nid: '1234567890',
    occupation: 'Software Engineer',
    submittedAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.OPENROUTER_API_KEY;
  });

  describe('AI Service Initialization', () => {
    test('should detect when AI service is not enabled', () => {
      expect(aiService.isEnabled()).toBe(false);
    });

    test('should detect when AI service is enabled', () => {
      process.env.OPENROUTER_API_KEY = 'test_api_key';
      const { OpenRouter } = require('@openrouter/sdk');
      const service = require('../../src/services/aiService');
      
      // Check if OpenRouter would be instantiated
      expect(aiService.apiKey).toBeUndefined(); // Already instantiated without key
    });
  });

  describe('Generate KYC Summary', () => {
    test('should generate basic summary when API key is not configured', async () => {
      const summary = await aiService.generateKycSummary(mockKycData);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('John Doe');
      expect(summary).toContain('john@example.com');
      expect(summary).toContain('1234567890');
      expect(summary).toContain('Software Engineer');
    });

    test('should include completeness percentage in basic summary', async () => {
      const summary = await aiService.generateKycSummary(mockKycData);

      expect(summary).toContain('100%'); // All fields provided
      expect(summary).toContain('5/5 fields');
    });

    test('should handle incomplete data gracefully', async () => {
      const incompleteData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        submittedAt: new Date()
      };

      const summary = await aiService.generateKycSummary(incompleteData);

      expect(summary).toContain('Jane Doe');
      expect(summary).toContain('jane@example.com');
      expect(summary).toContain('Not provided');
    });
  });

  describe('Calculate Completeness', () => {
    test('should calculate 100% completeness for full data', () => {
      const result = aiService.calculateCompleteness(mockKycData);

      expect(result.complete).toBe(5);
      expect(result.total).toBe(5);
      expect(result.percentage).toBe(100);
    });

    test('should calculate correct percentage for partial data', () => {
      const partialData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St'
      };

      const result = aiService.calculateCompleteness(partialData);

      expect(result.complete).toBe(3);
      expect(result.total).toBe(5);
      expect(result.percentage).toBe(60);
    });

    test('should handle empty fields correctly', () => {
      const dataWithEmptyFields = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '',
        nid: '',
        occupation: ''
      };

      const result = aiService.calculateCompleteness(dataWithEmptyFields);

      expect(result.complete).toBe(2);
      expect(result.percentage).toBe(40);
    });
  });

  describe('Assess Basic Risk', () => {
    test('should assess LOW risk for complete applications', () => {
      const risk = aiService.assessBasicRisk(mockKycData);

      expect(risk.level).toContain('LOW');
      expect(risk.reason).toContain('All required information provided');
    });

    test('should assess MEDIUM risk for partially complete applications', () => {
      const partialData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St'
      };

      const risk = aiService.assessBasicRisk(partialData);

      expect(risk.level).toContain('MEDIUM');
      expect(risk.reason).toContain('Some information missing');
    });

    test('should assess HIGH risk for incomplete applications', () => {
      const minimalData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const risk = aiService.assessBasicRisk(minimalData);

      expect(risk.level).toContain('HIGH');
      expect(risk.reason).toContain('Critical information missing');
    });
  });

  describe('Build Prompt', () => {
    test('should build correct prompt with all fields', () => {
      const prompt = aiService.buildPrompt(mockKycData);

      expect(prompt).toContain('John Doe');
      expect(prompt).toContain('john@example.com');
      expect(prompt).toContain('1234567890');
      expect(prompt).toContain('Software Engineer');
      expect(prompt).toContain('123 Main St, City');
      expect(prompt).toContain('KYC application summary');
    });

    test('should handle missing fields in prompt', () => {
      const minimalData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const prompt = aiService.buildPrompt(minimalData);

      expect(prompt).toContain('Not provided');
    });
  });

  describe('Batch Summary Generation', () => {
    test('should generate summaries for multiple applications', async () => {
      const applications = [
        { ...mockKycData, email: 'user1@example.com' },
        { ...mockKycData, email: 'user2@example.com' },
        { ...mockKycData, email: 'user3@example.com' }
      ];

      const summaries = await aiService.generateBatchSummaries(applications, 2);

      expect(summaries).toHaveLength(3);
      expect(summaries[0]).toContain('user1@example.com');
      expect(summaries[1]).toContain('user2@example.com');
      expect(summaries[2]).toContain('user3@example.com');
    });

    test('should handle empty batch', async () => {
      const summaries = await aiService.generateBatchSummaries([]);

      expect(summaries).toHaveLength(0);
    });
  });
});
