const express = require('express');
const router = express.Router();
const crypto = require("crypto")
const posts = require('../data/posts');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/uploadMiddleware');
const comments = require('../data/comments');
// GET - جيب كل البوستات
router.get('/', (req, res) => {
  res.json(posts);
});

// POST - إضافة بوست جديد (محتاج تسجيل دخول)
router.post('/', authenticate, upload.single('image'), (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'العنوان والمحتوى مطلوبين' });
  }

  const newPost = {
      id: crypto.randomUUID(),
    title,
    content,
    author: req.user.name,
    authorId: req.user.id, 
    image: req.file
  ? `http://localhost:5000/uploads/${req.file.filename}`
  : null,
   likedBy: []
  };

  posts.push(newPost);

  res.status(201).json({ message: 'تم إضافة البوست بنجاح', post: newPost });
});

// DELETE - حذف بوست (صاحبه بس أو الأدمن)// POST - عمل/إلغاء Like لبوست
router.post('/:id/like', authenticate, (req, res) => {
  const postId = req.params.id;
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ message: 'البوست مش موجود' });
  }

  const userId = req.user.id;
  const alreadyLiked = post.likedBy.includes(userId);

  if (alreadyLiked) {
    // اليوزر عمل لايك قبل كده، فهنشيله (Unlike)
    post.likedBy = post.likedBy.filter(id => id !== userId);
  } else {
    // اليوزر مش عامل لايك، فهنضيفه
    post.likedBy.push(userId);
  }

  res.json({
    message: alreadyLiked ? 'تم إلغاء الإعجاب' : 'تم الإعجاب بالبوست',
    likesCount: post.likedBy.length,
    liked: !alreadyLiked
  });
});
// GET - جيب كل تعليقات بوست معين
router.get('/:id/comments', (req, res) => {
  const postId = req.params.id;
  const postComments = comments.filter(c => c.postId === postId);
  res.json(postComments);
});

// POST - إضافة تعليق على بوست معين (محتاج تسجيل دخول)
router.post('/:id/comments', authenticate, (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ message: 'البوست مش موجود' });
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'محتوى التعليق مطلوب' });
  }

  const newComment = {
    id: crypto.randomUUID(),
    postId,
    content,
    authorId: req.user.id,
    authorName: req.user.name
  };

  comments.push(newComment);

  res.status(201).json({ message: 'تم إضافة التعليق', comment: newComment });
});
router.delete('/:id', authenticate, (req, res) => {
const postId = parseInt(req.params.id);
const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ message: 'البوست مش موجود' });
  }

  const post = posts[postIndex];

  const isOwner = post.authorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'مالكش صلاحية تحذف البوست ده' });
  }

  posts.splice(postIndex, 1); // نمسح البوست من الـ array

  res.json({ message: 'تم حذف البوست بنجاح' });
});

module.exports = router;