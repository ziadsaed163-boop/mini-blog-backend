const express = require('express');
const router = express.Router();
const posts = require('../data/posts');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/uploadMiddleware');

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
    id: posts.length + 1,
    title,
    content,
    author: req.user.name,
    authorId: req.user.id, // ← جديد: هنحتاجه عشان نتأكد مين صاحب البوست
    image: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null
  };

  posts.push(newPost);

  res.status(201).json({ message: 'تم إضافة البوست بنجاح', post: newPost });
});

// DELETE - حذف بوست (صاحبه بس أو الأدمن)
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