const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pushup-bebbe-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();
module.exports = db;
