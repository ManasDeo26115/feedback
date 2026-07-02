import express from 'express';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

const router = express.Router();

// Submit feedback for a user
router.post('/feedback/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { ratings, strength, improvement, message, reviewerName, reviewerEmail, isAnonymous } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'Recipient user not found.' });
    }

    // Input length limits
    if (strength && strength.length > 500) return res.status(400).json({ error: 'Strength feedback must be under 500 characters.' });
    if (improvement && improvement.length > 500) return res.status(400).json({ error: 'Improvement feedback must be under 500 characters.' });
    if (message && message.length > 1000) return res.status(400).json({ error: 'Message must be under 1000 characters.' });
    if (reviewerName && reviewerName.length > 80) return res.status(400).json({ error: 'Reviewer name must be under 80 characters.' });
    if (reviewerEmail && reviewerEmail.length > 100) return res.status(400).json({ error: 'Reviewer email must be under 100 characters.' });
    
    // Check if at least one rating is provided
    let hasRating = false;
    if (ratings && typeof ratings === 'object') {
      const keys = [
        'communication', 'confidence', 'leadership', 'teamwork', 'helpfulness',
        'creativity', 'emotionalIntelligence', 'reliability', 'problemSolving', 'attitude'
      ];
      for (const key of keys) {
        if (ratings[key] !== undefined && ratings[key] !== null && ratings[key] !== '') {
          const numValue = Number(ratings[key]);
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
            hasRating = true;
            break;
          }
        }
      }
    }
    
    // Check if at least one written response is provided
    const hasWritten = (strength && strength.trim() !== '') ||
                       (improvement && improvement.trim() !== '') ||
                       (message && message.trim() !== '');
                       
    if (!hasRating && !hasWritten) {
      return res.status(400).json({ error: 'You must fill at least one rating or write a message/strength/improvement.' });
    }
    
    // Build sanitized ratings object
    const sanitizedRatings = {};
    if (ratings && typeof ratings === 'object') {
      const keys = [
        'communication', 'confidence', 'leadership', 'teamwork', 'helpfulness',
        'creativity', 'emotionalIntelligence', 'reliability', 'problemSolving', 'attitude'
      ];
      for (const key of keys) {
        const val = ratings[key];
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (!isNaN(num) && num >= 1 && num <= 10) {
            sanitizedRatings[key] = num;
          }
        }
      }
    }
    
    const newFeedback = new Feedback({
      userId,
      ratings: sanitizedRatings,
      strength: strength ? strength.trim() : '',
      improvement: improvement ? improvement.trim() : '',
      message: message ? message.trim() : '',
      reviewerName: reviewerName ? reviewerName.trim() : '',
      reviewerEmail: reviewerEmail ? reviewerEmail.trim() : '',
      isAnonymous: isAnonymous !== undefined ? isAnonymous : true
    });
    
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback stats for a user
router.get('/feedback/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const feedbacks = await Feedback.find({ userId });
    const count = feedbacks.length;

    const traitKeys = [
      'communication', 'confidence', 'leadership', 'teamwork', 'helpfulness',
      'creativity', 'emotionalIntelligence', 'reliability', 'problemSolving', 'attitude'
    ];

    const sums = {};
    const counts = {};
    traitKeys.forEach(k => { sums[k] = 0; counts[k] = 0; });

    let overallSum = 0;
    let overallCount = 0;

    feedbacks.forEach(f => {
      if (f.ratings) {
        traitKeys.forEach(k => {
          const r = f.ratings[k];
          if (r !== undefined && r !== null) {
            sums[k] += r;
            counts[k]++;
            overallSum += r;
            overallCount++;
          }
        });
      }
    });

    const averages = {};
    traitKeys.forEach(k => {
      averages[k] = counts[k] > 0 ? Math.round((sums[k] / counts[k]) * 10) / 10 : null;
    });

    res.json({
      totalReviews: count,
      overallScore: overallCount > 0 ? Math.round((overallSum / overallCount) * 10) / 10 : null,
      averages,
    });
  } catch (error) {
    console.error('Error calculating feedback stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback for a user (to display on Dashboard with pagination support)
router.get('/feedback/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    // Check if user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'Recipient user not found.' });
    }
    
    const feedbacks = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json(feedbacks);
  } catch (error) {
    console.error('Error retrieving feedbacks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
