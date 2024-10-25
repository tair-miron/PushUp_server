const admin = require('firebase-admin');
const serviceAccount = require('../../config/serviceAccountKey.json'); // עדכן את הנתיב במידת הצורך

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pushup-bebbe-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

db.ref(env + '/users').once('value')
  .then((snapshot) => {
    const users = snapshot.val();
    console.log(users);
  })
  .catch((error) => {
    console.error('Error retrieving users:', error);
  });
