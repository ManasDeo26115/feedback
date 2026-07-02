import express from 'express';
import SpitOutPost from '../models/SpitOutPost.js';

const router = express.Router();

const BAD_WORDS = ['spam', 'abuse', 'fuck', 'shit', 'bitch', 'asshole']; // Basic word list

const filterProfanity = (text) => {
  let cleaned = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '*'.repeat(word.length));
  });
  return cleaned;
};

// Create a new post in an organization's Spit Out board
router.post('/spitout', async (req, res) => {
  try {
    const { organization, text, author, isAnonymous } = req.body;
    
    if (!organization || !text || !text.trim()) {
      return res.status(400).json({ error: 'Organization and message text are required.' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Message must be under 500 characters.' });
    }
    
    const cleanedText = filterProfanity(text.trim());
    
    const newPost = new SpitOutPost({
      organization: organization.toLowerCase().trim(),
      text: cleanedText,
      author: author ? author.trim() : '',
      isAnonymous: isAnonymous !== undefined ? isAnonymous : true
    });
    
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating Spit Out post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve posts for a specific organization board with pagination
router.get('/spitout/:organization', async (req, res) => {
  try {
    const org = req.params.organization.toLowerCase().trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const posts = await SpitOutPost.find({ organization: org })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json(posts);
  } catch (error) {
    console.error('Error retrieving Spit Out posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like a post
router.post('/spitout/:id/like', async (req, res) => {
  try {
    const post = await SpitOutPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dislike a post
router.post('/spitout/:id/dislike', async (req, res) => {
  try {
    const post = await SpitOutPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
