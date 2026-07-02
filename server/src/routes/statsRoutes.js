import express from 'express';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// GET /api/stats — aggregate platform statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalFeedbacks, avgResult] = await Promise.all([
      User.countDocuments(),
      Feedback.countDocuments(),
      Feedback.aggregate([
        { $project: {
          allRatings: {
            $filter: {
              input: { $objectToArray: '$ratings' },
              cond: { $and: [{ $ne: ['$$this.v', null] }, { $gte: ['$$this.v', 1] }, { $lte: ['$$this.v', 10] }] }
            }
          }
        }},
        { $unwind: '$allRatings' },
        { $group: { _id: null, avgScore: { $avg: '$allRatings.v' } } },
      ]),
    ]);

    const avgScore = avgResult.length > 0 ? avgResult[0].avgScore : null;

    res.json({
      totalUsers,
      totalFeedbacks,
      avgScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
