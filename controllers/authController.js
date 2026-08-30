const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../data/users');

// تسجيل حساب جديد
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // تحقق بسيط: هل الإيميل مسجل قبل كده؟
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'الإيميل ده مسجل قبل كده' });
    }

    // نشفر الباسورد قبل ما نحفظه
    const hashedPassword = await bcrypt.hash(password, 10);

    const crypto = require('crypto'); // ضيفها فوق الملف مع باقي الـ requires

    const newUser = {
      id: crypto.randomUUID(), // ← بدل users.length + 1
      name,
      email,
      password: hashedPassword,
      role: 'user'
    };
    users.push(newUser);

    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });
  } catch (error) {
    next(error);
  }
}

// تسجيل الدخول
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'الإيميل أو الباسورد غلط' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'الإيميل أو الباسورد غلط' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'تم تسجيل الدخول بنجاح', token });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };