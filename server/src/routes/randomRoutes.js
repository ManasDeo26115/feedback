import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Retrieve a list of random user profiles for the "Discover People" page
router.get('/random-users', async (req, res) => {
  try {
    // Return a random sample of up to 10 users
    const randomUsers = await User.aggregate([{ $sample: { size: 10 } }]);
    res.json(randomUsers);
  } catch (error) {
    console.error('Error fetching random users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
