import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  college: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  institution: {
    type: String,
    index: true,
    trim: true
  },
  hobby: {
    type: String,
    required: true,
    trim: true
  },
  howUseful: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say', ''],
    default: ''
  },
  photo: {
    type: String, // Storing base64 data URL or external URL
    default: ''
  },
  profilePhoto: {
    type: String, // Legacy compatibility
    default: ''
  },
  usefulness: {
    type: String, // Legacy compatibility
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to compute primary institution before saving
userSchema.pre('save', function (next) {
  // If institution is not explicitly set, compute it from college -> school -> company
  if (!this.institution) {
    this.institution = this.college || this.school || this.company || '';
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
