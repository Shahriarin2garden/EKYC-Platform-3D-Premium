const Kyc = require('../models/Kyc');
const aiService = require('../services/aiService');
const logger = require('../config/logger');

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

    // Generate AI summary using OpenRouter (or fallback to basic summary)
    logger.ai('Generating AI summary for KYC application', { email });
    kyc.aiSummary = await aiService.generateKycSummary({
      name,
      email,
      address,
      nid,
      occupation,
      submittedAt: new Date()
    });

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
    logger.error('KYC submission error', { error: error.message, email: req.body.email });

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
      .limit(Number.parseInt(limit, 10))
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
          page: Number.parseInt(page, 10),
          limit: Number.parseInt(limit, 10),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all KYC error', { error: error.message });
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
    logger.error('Get KYC by ID error', { error: error.message, id: req.params.id });
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
    logger.error('Update KYC status error', { error: error.message, id: req.params.id });
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
    logger.error('Get KYC statistics error', { error: error.message });
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
    logger.error('Delete KYC error', { error: error.message, id: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete KYC application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Regenerate AI Summary (for admin)
exports.regenerateAiSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await Kyc.findById(id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    logger.ai('Regenerating AI summary', { email: kyc.email, kycId: id });

    // Generate new AI summary
    const newSummary = await aiService.generateKycSummary({
      name: kyc.name,
      email: kyc.email,
      address: kyc.address,
      nid: kyc.nid,
      occupation: kyc.occupation,
      submittedAt: kyc.submittedAt
    });

    kyc.aiSummary = newSummary;
    await kyc.save();

    res.json({
      success: true,
      message: 'AI summary regenerated successfully',
      data: {
        aiSummary: newSummary
      }
    });
  } catch (error) {
    logger.error('Regenerate AI summary error', { error: error.message, id: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate AI summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Batch regenerate AI summaries (for admin)
exports.batchRegenerateAiSummaries = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const kycs = await Kyc.find(query).limit(50); // Limit to 50 for safety

    if (kycs.length === 0) {
      return res.json({
        success: true,
        message: 'No applications found to process',
        data: { processed: 0 }
      });
    }

    logger.ai(`Batch regenerating AI summaries for ${kycs.length} applications`);

    let successCount = 0;
    let failCount = 0;

    // Process in batches to avoid overwhelming the API
    for (const kyc of kycs) {
      try {
        const newSummary = await aiService.generateKycSummary({
          name: kyc.name,
          email: kyc.email,
          address: kyc.address,
          nid: kyc.nid,
          occupation: kyc.occupation,
          submittedAt: kyc.submittedAt
        });

        kyc.aiSummary = newSummary;
        await kyc.save();
        successCount++;

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error('Failed to regenerate summary', { email: kyc.email, error: error.message });
        failCount++;
      }
    }

    res.json({
      success: true,
      message: `AI summaries regenerated: ${successCount} succeeded, ${failCount} failed`,
      data: {
        total: kycs.length,
        succeeded: successCount,
        failed: failCount
      }
    });
  } catch (error) {
    logger.error('Batch regenerate AI summaries error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to batch regenerate AI summaries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
