const admin = require('firebase-admin');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function addUser() {
  try {
    await db.collection('users').add({
      email: 'rahimmbodj@gmail.com',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Utilisateur ajouté avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
  }
}

addUser().then(() => process.exit(0));
