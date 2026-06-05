const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create comment (protected)
router.post('/', authenticateToken, (req, res) => {
  const { post_id, content } = req.body;

  if (!post_id || !content) {
    return res.status(400).json({ error: 'Post ID and content are required' });
  }

  db.get('SELECT id FROM posts WHERE id = ?', [post_id], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    db.run(
      'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
      [post_id, req.user.id, content],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Comment added', commentId: this.lastID });
      }
    );
  });
});

// Delete comment (protected - owner only)
router.delete('/:id', authenticateToken, (req, res) => {
  const commentId = req.params.id;

  db.get('SELECT * FROM comments WHERE id = ?', [commentId], (err, comment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    db.run('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Comment deleted successfully' });
    });
  });
});

module.exports = router;
