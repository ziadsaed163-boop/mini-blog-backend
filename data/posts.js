const crypto = require('crypto');

let posts = [
  {
    id: crypto.randomUUID(),
    title: 'أول بوست في المدونة',
    content: 'بوست اولي للتجربة',
    author: 'أحمد',
    authorId: null,
    image: null,
    likedBy: [] // ← جديد
  },
  {
    id: crypto.randomUUID(),
    title: 'بوست تاني',
    content: 'بوست ثاني للتجربة',
    author: 'سارة',
    authorId: null,
    image: null,
    likedBy: [] // ← جديد
  }
];

module.exports = posts;