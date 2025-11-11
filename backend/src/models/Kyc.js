const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    index: true // Create index for faster queries
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  nid: {
    type: String,
    trim: true,
    sparse: true, // Allow multiple null values, but unique non-null values
    index: true
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters']
  },
  
  // AI-Generated Summary
  aiSummary: {
    type: String,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
    index: true
  },
  
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
kycSchema.index({ submittedAt: -1 }); // Sort by submission date
kycSchema.index({ status: 1, submittedAt: -1 }); // Filter by status and date
kycSchema.index({ email: 1, status: 1 }); // Compound index

// Virtual for formatted submission date
kycSchema.virtual('formattedSubmissionDate').get(function() {
  return this.submittedAt.toLocaleString();
});

// Pre-save middleware to update the updatedAt field
kycSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get statistics
kycSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
};

// Instance method to generate summary
kycSchema.methods.generateSummary = function() {
  return `KYC application for ${this.name} (${this.email}). 
    National ID: ${this.nid || 'N/A'}. 
    Occupation: ${this.occupation || 'N/A'}. 
    Address: ${this.address || 'N/A'}. 
    Status: ${this.status}. 
    Submitted on ${this.submittedAt.toLocaleDateString()}.`;
};

const Kyc = mongoose.model('Kyc', kycSchema);

module.exports = Kyc;
