const express = require('express');
const router = express.Router();
const comments = require('../data/comments');
const posts = require('../data/posts');
const authenticate = require('../middlewares/authenticate');

// DELETE - حذف تعليق (صاحبه، أو صاحب البوست، أو الأدمن)
router.delete('/:id', authenticate, (req, res) => {
  const commentId = req.params.id;
  const commentIndex = comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ message: 'التعليق مش موجود' });
  }

  const comment = comments[commentIndex];
  const post = posts.find(p => p.id === comment.postId);

  const isCommentOwner = comment.authorId === req.user.id;
  const isPostOwner = post && post.authorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCommentOwner && !isPostOwner && !isAdmin) {
    return res.status(403).json({ message: 'مالكش صلاحية تحذف التعليق ده' });
  }

  comments.splice(commentIndex, 1);

  res.json({ message: 'تم حذف التعليق بنجاح' });
});

module.exports = router;