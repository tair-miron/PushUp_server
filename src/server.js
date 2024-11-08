require('dotenv').config(); 
const express = require('express');
const UserController = require('./user/UserController'); // ייבוא של ה-UserController
const AuthController = require('./auth/AuthController'); // ייבוא של ה-AuthController
const NotificationController = require('./notifications/NotificationController'); // ייבוא של ה-NotificationController

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// שיטות של UserController
app.use('/users', UserController);

// שיטות של AuthController (אם יש)
app.use('/auth', AuthController);

app.use('/notifications', NotificationController);

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
