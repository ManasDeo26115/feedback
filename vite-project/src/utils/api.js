const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost:5001/api';
  }
  const hostname = window.location.hostname;
  return `http://${hostname}:5001/api`;
};

const API_BASE = getApiBase();

export const api = {
  // User profile operations
  createUser: async (userData) => {
    const res = await fetch(`${API_BASE}/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create profile');
    }
    return res.json();
  },

  getUser: async (userId) => {
    const res = await fetch(`${API_BASE}/user/${userId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to retrieve profile');
    }
    return res.json();
  },

  // Feedback operations
  submitFeedback: async (userId, feedbackData) => {
    const res = await fetch(`${API_BASE}/feedback/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit feedback');
    }
    return res.json();
  },

  getFeedback: async (userId) => {
    const res = await fetch(`${API_BASE}/feedback/${userId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to retrieve feedback');
    }
    return res.json();
  },

  // Discover operations
  getRandomUsers: async () => {
    const res = await fetch(`${API_BASE}/random-users`);
    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }
    return res.json();
  },

  // Platform wide stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }
    return res.json();
  },

  // Search users by name or school/company
  searchUsers: async (query) => {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error('Failed to search users');
    }
    return res.json();
  },

  // Spit Out Zone operations
  getSpitOutPosts: async (organization) => {
    const res = await fetch(`${API_BASE}/spitout/${organization}`);
    if (!res.ok) {
      throw new Error('Failed to load discussions');
    }
    return res.json();
  },

  createSpitOutPost: async (postData) => {
    const res = await fetch(`${API_BASE}/spitout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish post');
    }
    return res.json();
  },

  likePost: async (postId) => {
    const res = await fetch(`${API_BASE}/spitout/${postId}/like`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('Failed to like post');
    }
    return res.json();
  },

  dislikePost: async (postId) => {
    const res = await fetch(`${API_BASE}/spitout/${postId}/dislike`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('Failed to dislike post');
    }
    return res.json();
  },
};
