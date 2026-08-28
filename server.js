require('dotenv').config();
const express = require('express');
const cors = require('cors');
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth'); // ← جديد

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/posts', postsRoutes);
app.use('/api/auth', authRoutes); // ← جديد

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
  });
}

module.exports = app;