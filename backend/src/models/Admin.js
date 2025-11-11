const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
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
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in query results by default
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

// Pre-save middleware to hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate JWT token
adminSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };

  const secret = process.env.JWT_SECRET || 'default_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

// Instance method to update last login
adminSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  await this.save({ validateBeforeSave: false });
};

// Static method to find admin by credentials
adminSchema.statics.findByCredentials = async function(email, password) {
  // Find admin and include password field
  const admin = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await admin.comparePassword(password);
  
  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  return admin;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
