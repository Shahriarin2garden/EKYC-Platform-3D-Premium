const jwt = require('jsonwebtoken');
const auth = require('../../src/middleware/auth');
const Admin = require('../../src/models/Admin');

// Mock dependencies
jest.mock('../../src/models/Admin');
jest.mock('../../src/config/logger', () => ({
  error: jest.fn()
}));

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Token Validation', () => {
    test('should reject request without Authorization header', async () => {
      req.header.mockReturnValue(undefined);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided, authorization denied'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid Authorization format', async () => {
      req.header.mockReturnValue('InvalidFormat token123');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided, authorization denied'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', async () => {
      req.header.mockReturnValue('Bearer invalid_token');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'user123', email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.header.mockReturnValue(`Bearer ${expiredToken}`);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Admin Validation', () => {
    test('should reject if admin not found', async () => {
      const validToken = jwt.sign(
        { id: 'nonexistent_id', email: 'test@example.com' },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${validToken}`);
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token or admin account is inactive'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject if admin is inactive', async () => {
      const validToken = jwt.sign(
        { id: 'admin123', email: 'test@example.com' },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${validToken}`);
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'admin123',
          email: 'test@example.com',
          role: 'admin',
          isActive: false
        })
      });

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token or admin account is inactive'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Successful Authentication', () => {
    test('should authenticate valid token with active admin', async () => {
      const adminData = {
        _id: 'admin123',
        email: 'test@example.com',
        role: 'admin',
        isActive: true
      };

      const validToken = jwt.sign(
        { id: adminData._id, email: adminData.email },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${validToken}`);
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(adminData)
      });

      await auth(req, res, next);

      expect(req.admin).toEqual({
        id: adminData._id,
        email: adminData.email,
        role: adminData.role
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should extract token correctly from Bearer header', async () => {
      const adminData = {
        _id: 'admin123',
        email: 'test@example.com',
        role: 'super_admin',
        isActive: true
      };

      const validToken = jwt.sign(
        { id: adminData._id, email: adminData.email, role: adminData.role },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${validToken}`);
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(adminData)
      });

      await auth(req, res, next);

      expect(Admin.findById).toHaveBeenCalledWith(adminData._id);
      expect(req.admin.role).toBe('super_admin');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const validToken = jwt.sign(
        { id: 'admin123', email: 'test@example.com' },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${validToken}`);
      Admin.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization failed'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
