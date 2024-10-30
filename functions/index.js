const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// יצירת אפליקציית Express
const app = express();

// אמצעי הגנה וניהול JSON
app.use(cors({origin: true}));
app.use(bodyParser.json());

// ייבוא וניתוב הקונטרולרים
const authController = require("../src/auth/AuthController");
const notificationController = require("../src/notifications/NotificationController");
const userController = require("../src/user/UserController");

// ניתוב לקונטרולרים
app.use("/auth", authController);
app.use("/notifications", notificationController);
app.use("/user", userController);

// ייצוא של השרת לפונקציית Firebase
exports.api = functions.https.onRequest(app);
