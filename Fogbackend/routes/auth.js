const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const name = `${firstName} ${lastName}`;
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password_hash]
    );
    const payload = { user: { id: newUser.rows[0].id, name, email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6m' });
    res.json({ token, user: payload.user });
  } catch (err) {
    res.status(500).json({ message: 'User Can not be created now! Please try again' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id, name: user.name, email: user.email } };
    const name = user.name;
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6m' });
    res.json({ token, user: payload.user.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;