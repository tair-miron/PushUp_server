const express = require('express');
const db = require('../../config/firebaseConfig'); // ייבוא קובץ החיבור ל-Firebase

const router = express.Router();

// יצירת משתמש חדש - CREATE
router.post('/', (req, res) => {
  const { id, name, email } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ message: 'Missing required fields: id, name, email' });
  }

  const ref = db.ref('users/' + id);
  ref.set({ name, email }, (error) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to create user', error });
    }
    res.status(201).json({ message: 'User created successfully' });
  });
});

// קריאת משתמש לפי ID - READ
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const ref = db.ref('users/' + userId);

  ref.once('value', (snapshot) => {
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val());
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }, (error) => {
    res.status(500).json({ message: 'Failed to read user', error });
  });
});

// עדכון משתמש - UPDATE
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ message: 'Missing fields to update' });
  }

  const ref = db.ref('users/' + userId);
  ref.update({ name, email }, (error) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to update user', error });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
});

// מחיקת משתמש - DELETE
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  const ref = db.ref('users/' + userId);

  ref.remove((error) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to delete user', error });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

module.exports = router; // ייצוא ה-router
