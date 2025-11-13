const Admin = require('../models/Admin');
const Kyc = require('../models/Kyc');
const pdfProducer = require('../services/pdfProducer');
const pdfService = require('../services/pdfService');
const path = require('node:path');
const fs = require('node:fs');

// Register a new admin
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password // Will be hashed by pre-save middleware
    });

    await admin.save();

    // Generate JWT token
    const token = admin.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by credentials
    const admin = await Admin.findByCredentials(email, password);

    // Update last login
    await admin.updateLastLogin();

    // Generate JWT token
    const token = admin.generateAuthToken();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    // req.admin is set by auth middleware
    const admin = await Admin.findById(req.admin.id).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: admin
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (name) admin.name = name;
    
    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isPasswordMatch = await admin.comparePassword(currentPassword);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all admins (super admin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Admins retrieved successfully',
      data: admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate PDF for a KYC application
exports.generatePdf = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { priority } = req.body;

    // Validate KYC ID
    const kyc = await Kyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    try {
      // Try to use RabbitMQ if available
      await pdfProducer.requestPdfGeneration(
        kycId,
        req.admin.id,
        priority || 5
      );

      res.json({
        success: true,
        message: 'PDF generation request queued successfully',
        data: {
          kycId,
          status: 'queued',
          message: 'PDF is being generated. You can download it once it\'s ready.'
        }
      });
    } catch (queueError) {
      // Fallback to synchronous PDF generation if RabbitMQ is not available
      console.log('RabbitMQ not available, generating PDF synchronously...', queueError.message);
      
      // Generate PDF synchronously
      const pdfPath = await pdfService.generateKycPdf(kyc);
      
      // Update KYC record
      kyc.pdfPath = pdfPath;
      kyc.pdfGeneratedAt = new Date();
      kyc.pdfError = null;
      kyc.pdfErrorAt = null;
      await kyc.save();

      res.json({
        success: true,
        message: 'PDF generated successfully',
        data: {
          kycId,
          status: 'completed',
          pdfPath,
          generatedAt: kyc.pdfGeneratedAt,
          message: 'PDF is ready to download.'
        }
      });
    }
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Download PDF for a KYC application
exports.downloadPdf = async (req, res) => {
  try {
    const { kycId } = req.params;

    // Fetch KYC record
    const kyc = await Kyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    // Check if PDF exists
    if (!kyc.pdfPath || !pdfService.pdfExists(kyc.pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found. Please generate the PDF first.',
        data: {
          kycId,
          pdfGenerated: false
        }
      });
    }

    // Get the filename
    const filename = path.basename(kyc.pdfPath);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the PDF file
    const fileStream = fs.createReadStream(kyc.pdfPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to download PDF'
        });
      }
    });

  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get PDF status for a KYC application
exports.getPdfStatus = async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await Kyc.findById(kycId).select('pdfPath pdfGeneratedAt pdfError pdfErrorAt');
    
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    const status = {
      kycId,
      pdfGenerated: !!kyc.pdfPath,
      pdfPath: kyc.pdfPath,
      generatedAt: kyc.pdfGeneratedAt,
      error: kyc.pdfError,
      errorAt: kyc.pdfErrorAt
    };

    res.json({
      success: true,
      message: 'PDF status retrieved successfully',
      data: status
    });
  } catch (error) {
    console.error('Get PDF status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PDF status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Batch generate PDFs for multiple KYC applications
exports.batchGeneratePdf = async (req, res) => {
  try {
    const { kycIds, priority } = req.body;

    if (!Array.isArray(kycIds) || kycIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'kycIds must be a non-empty array'
      });
    }

    try {
      // Try to use RabbitMQ if available
      const results = await pdfProducer.requestBatchPdfGeneration(
        kycIds,
        req.admin.id,
        priority || 3
      );

      res.json({
        success: true,
        message: 'Batch PDF generation request queued successfully',
        data: results
      });
    } catch (queueError) {
      // Fallback to synchronous PDF generation if RabbitMQ is not available
      console.log('RabbitMQ not available, generating PDFs synchronously...', queueError.message);
      
      const results = [];
      for (const kycId of kycIds) {
        try {
          const kyc = await Kyc.findById(kycId);
          if (!kyc) {
            results.push({ kycId, success: false, error: 'KYC not found' });
            continue;
          }

          const pdfPath = await pdfService.generateKycPdf(kyc);
          kyc.pdfPath = pdfPath;
          kyc.pdfGeneratedAt = new Date();
          kyc.pdfError = null;
          kyc.pdfErrorAt = null;
          await kyc.save();

          results.push({ kycId, success: true, status: 'completed' });
        } catch (error) {
          results.push({ kycId, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        message: 'Batch PDF generation completed',
        data: results
      });
    }
  } catch (error) {
    console.error('Batch generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDFs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get PDF queue status
exports.getPdfQueueStatus = async (req, res) => {
  try {
    const status = await pdfProducer.getQueueStatus();

    res.json({
      success: true,
      message: 'Queue status retrieved successfully',
      data: status.data
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
