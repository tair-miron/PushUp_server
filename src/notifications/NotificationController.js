const express = require('express');
const router = express.Router();
const admin = require('../../config/firebaseConfig');
const cron = require('node-cron');

// פונקציה לשליחת נוטיפיקציה
const sendNotification = (token, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
};

// Route לשליחת נוטיפיקציה על ידי משתמש אדמין
router.post('/send', (req, res) => {
  const { token, title, body } = req.body;
  
  if (!token || !title || !body) {
    return res.status(400).send("Missing required fields: token, title, body");
  }

  sendNotification(token, title, body);
  res.status(200).send("Notification sent successfully!");
});

// Route לשליחת נוטיפיקציה מתוזמנת
router.post('/schedule', (req, res) => {
  const { token, title, body, datetime } = req.body;
  
  if (!token || !title || !body || !datetime) {
    return res.status(400).send("Missing required fields: token, title, body, datetime");
  }

  const scheduledTime = new Date(datetime);

  if (scheduledTime <= new Date()) {
    return res.status(400).send("Scheduled time must be in the future.");
  }

  // חישוב התזמון בפורמט של cron
  const cronTime = `${scheduledTime.getUTCMinutes()} ${scheduledTime.getUTCHours()} ${scheduledTime.getUTCDate()} ${scheduledTime.getUTCMonth() + 1} *`;

  // יצירת משימה מתוזמנת
  cron.schedule(cronTime, () => {
    sendNotification(token, title, body);
  });

  res.status(200).send(`Notification scheduled successfully for ${datetime}`);
});

module.exports = router;
