import mongoose from 'mongoose';

const spitOutPostSchema = new mongoose.Schema({
  organization: {
    type: String,
    required: true,
    index: true,
    trim: true,
    lowercase: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true,
    default: ''
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SpitOutPost = mongoose.model('SpitOutPost', spitOutPostSchema);
export default SpitOutPost;
