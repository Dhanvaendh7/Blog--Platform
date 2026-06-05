const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', (req, res) => {
  db.all(`
    SELECT p.*, u.username as author_name 
    FROM posts p 
    JOIN users u ON p.author_id = u.id 
    ORDER BY p.created_at DESC
  `, [], (err, posts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(posts);
  });
});

// Get single post with comments
router.get('/:id', (req, res) => {
  const postId = req.params.id;

  db.get(`
    SELECT p.*, u.username as author_name 
    FROM posts p 
    JOIN users u ON p.author_id = u.id 
    WHERE p.id = ?
  `, [postId], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    db.all(`
      SELECT c.*, u.username as author_name 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.post_id = ? 
      ORDER BY c.created_at ASC
    `, [postId], (err, comments) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...post, comments });
    });
  });
});

// Create post (protected)
router.post('/', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.run(
    'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
    [title, content, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Post created', postId: this.lastID });
    }
  );
});

// Update post (protected - owner only)
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;

  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    db.run(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title || post.title, content || post.content, postId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Post updated successfully' });
      }
    );
  });
});

// Delete post (protected - owner only)
router.delete('/:id', authenticateToken, (req, res) => {
  const postId = req.params.id;

  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Post deleted successfully' });
    });
  });
});

module.exports = router;
