const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../config/firebaseConfig'); // ייבוא קובץ החיבור ל-Firebase
const { env } = require('../../config/env');

const router = express.Router();

// רישום משתמש חדש
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // שמירה למסד הנתונים של Firebase
    await db.ref(env + 'users/' + username).set({
      username: username,
      password: hashedPassword
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'User registration failed', error });
  }
});

// התחברות משתמש וקבלת טוקן גישה ורענון
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // חיפוש המשתמש במסד הנתונים של Firebase
    const userSnapshot = await db.ref(env + 'users/' + username).once('value');
    const user = userSnapshot.val();
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const accessToken = generateAccessToken({ username: user.username });
        const refreshToken = jwt.sign({ username: user.username }, process.env.REFRESH_TOKEN_SECRET);
        
        // שמירה על טוקן הרענון במסד הנתונים
        await db.ref(env + 'refreshTokens/' + username).set({ token: refreshToken });
        res.json({ accessToken, refreshToken });
      } else {
        res.status(403).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error });
    }
  });

// רענון טוקן
router.post('/token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // בדיקת טוקן הרענון במסד הנתונים
  const refreshTokenSnapshot = await db.ref(env + 'refreshTokens').orderByChild('token').equalTo(token).once('value');
  
  if (!refreshTokenSnapshot.exists()) return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// יצירת טוקן גישה
function generateAccessToken(user) {
    return jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }

// יצירת נקודה מוגנת הדורשת אימות טוקן גישה
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the protected route, user: ' + req.user.username });
});

// Middleware לאימות טוקן גישה
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader || authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// מחיקת טוקן רענון
router.delete('/logout', async (req, res) => {
  const { token } = req.body;
  
  // מחיקת טוקן הרענון ממסד הנתונים
  const refreshTokenSnapshot = await db.ref(env + 'refreshTokens').orderByChild('token').equalTo(token).once('value');
  if (refreshTokenSnapshot.exists()) {
    const key = Object.keys(refreshTokenSnapshot.val())[0];
    await db.ref(env + 'refreshTokens/' + key).remove();
  }

  res.status(204).send();
});

module.exports = router; // ייצוא ה-router
