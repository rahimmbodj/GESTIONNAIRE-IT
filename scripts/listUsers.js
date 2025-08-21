const admin = require('firebase-admin');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listUsers() {
  const usersSnapshot = await db.collection('users').get();
  console.log('Liste des utilisateurs dans Firestore:');
  usersSnapshot.forEach(doc => {
    console.log('Email:', doc.data().email);
    console.log('Rôle:', doc.data().role);
    console.log('---');
  });
}

listUsers().then(() => process.exit(0));
