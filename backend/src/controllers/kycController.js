const Kyc = require('../models/Kyc');

// Submit KYC Application
exports.submitKyc = async (req, res) => {
  try {
    const { name, email, address, nid, occupation } = req.body;

    // Check if KYC already exists for this email
    const existingKyc = await Kyc.findOne({ email });
    
    if (existingKyc) {
      return res.status(400).json({
        success: false,
        message: 'KYC application already exists for this email',
        data: {
          status: existingKyc.status,
          submittedAt: existingKyc.submittedAt
        }
      });
    }

    // Create new KYC application
    const kyc = new Kyc({
      name,
      email,
      address,
      nid,
      occupation
    });

    // Generate AI summary (placeholder - can be enhanced with actual AI)
    kyc.aiSummary = kyc.generateSummary();

    // Save to database
    await kyc.save();

    res.status(201).json({
      success: true,
      message: 'KYC application submitted successfully',
      data: {
        id: kyc._id,
        name: kyc.name,
        email: kyc.email,
        status: kyc.status,
        submittedAt: kyc.submittedAt
      },
      summary: kyc.aiSummary
    });
  } catch (error) {
    console.error('KYC submission error:', error);

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
        message: 'A KYC application with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit KYC application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all KYC applications (for admin)
exports.getAllKyc = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'submittedAt', order = 'desc' } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    // Fetch KYC applications
    const kycs = await Kyc.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Kyc.countDocuments(query);

    res.json({
      success: true,
      message: 'KYC applications retrieved successfully',
      data: {
        kycs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve KYC applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get KYC by ID
exports.getKycById = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await Kyc.findById(id).select('-__v');

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    res.json({
      success: true,
      message: 'KYC application retrieved successfully',
      data: kyc
    });
  } catch (error) {
    console.error('Get KYC by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve KYC application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update KYC status (for admin)
exports.updateKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find and update KYC
    const kyc = await Kyc.findById(id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    kyc.status = status;
    if (reviewNotes) {
      kyc.reviewNotes = reviewNotes;
    }
    kyc.reviewedAt = Date.now();
    
    // If admin info is available from auth middleware
    if (req.admin) {
      kyc.reviewedBy = req.admin.id;
    }

    await kyc.save();

    res.json({
      success: true,
      message: 'KYC status updated successfully',
      data: kyc
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update KYC status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get KYC statistics (for admin dashboard)
exports.getKycStatistics = async (req, res) => {
  try {
    const stats = await Kyc.getStatistics();
    
    const total = await Kyc.countDocuments();
    const recentSubmissions = await Kyc.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('name email status submittedAt');

    res.json({
      success: true,
      message: 'KYC statistics retrieved successfully',
      data: {
        total,
        statusBreakdown: stats,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Get KYC statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve KYC statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete KYC (for admin)
exports.deleteKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await Kyc.findByIdAndDelete(id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    res.json({
      success: true,
      message: 'KYC application deleted successfully'
    });
  } catch (error) {
    console.error('Delete KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete KYC application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
