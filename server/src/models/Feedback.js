import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  communication: { type: Number, min: 1, max: 10 },
  confidence: { type: Number, min: 1, max: 10 },
  leadership: { type: Number, min: 1, max: 10 },
  teamwork: { type: Number, min: 1, max: 10 },
  helpfulness: { type: Number, min: 1, max: 10 },
  creativity: { type: Number, min: 1, max: 10 },
  emotionalIntelligence: { type: Number, min: 1, max: 10 },
  reliability: { type: Number, min: 1, max: 10 },
  problemSolving: { type: Number, min: 1, max: 10 },
  attitude: { type: Number, min: 1, max: 10 }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  ratings: {
    type: ratingSchema,
    default: () => ({})
  },
  strength: {
    type: String,
    trim: true,
    default: ''
  },
  improvement: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  reviewerName: {
    type: String,
    trim: true,
    default: ''
  },
  reviewerEmail: {
    type: String,
    trim: true,
    default: ''
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
