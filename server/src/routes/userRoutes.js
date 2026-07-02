import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Helper function to generate a unique short alphanumeric ID
const generateUniqueId = async () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  let isUnique = false;
  
  while (!isUnique) {
    id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check if ID already exists
    const existingUser = await User.findOne({ userId: id });
    if (!existingUser) {
      isUnique = true;
    }
  }
  return id;
};

// Create a new user profile
router.post('/create-user', async (req, res) => {
  try {
    const { name, hobby, city, college, school, company, gender, photo, howUseful } = req.body;
    
    if (!name || !name.trim() || !hobby || !hobby.trim()) {
      return res.status(400).json({ error: 'Name and Hobby are required fields.' });
    }

    // Input length validations
    if (name.length > 80) return res.status(400).json({ error: 'Name must be under 80 characters.' });
    if (hobby.length > 100) return res.status(400).json({ error: 'Hobby must be under 100 characters.' });
    if (city && city.length > 80) return res.status(400).json({ error: 'City must be under 80 characters.' });
    if (college && college.length > 100) return res.status(400).json({ error: 'College must be under 100 characters.' });
    if (school && school.length > 100) return res.status(400).json({ error: 'School must be under 100 characters.' });
    if (company && company.length > 100) return res.status(400).json({ error: 'Company must be under 100 characters.' });
    if (howUseful && howUseful.length > 250) return res.status(400).json({ error: 'How I Am Useful bio must be under 250 characters.' });
    
    const userId = await generateUniqueId();
    
    const newUser = new User({
      userId,
      name: name.trim(),
      hobby: hobby.trim(),
      city: city ? city.trim() : '',
      college: college ? college.trim() : '',
      school: school ? school.trim() : '',
      company: company ? company.trim() : '',
      gender: gender || '',
      photo: photo || '',
      howUseful: howUseful ? howUseful.trim() : ''
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search user profiles
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const searchRegex = new RegExp(q.trim(), 'i');
    const matches = await User.find({
      $or: [
        { name: searchRegex },
        { college: searchRegex },
        { school: searchRegex },
        { company: searchRegex }
      ]
    }).limit(20);
    res.json(matches);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve a user profile
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
