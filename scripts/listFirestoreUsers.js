// Script Node.js pour afficher les utilisateurs Firestore
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Chemin vers la clé de service (adapter si besoin)
const serviceAccount = require(path.join(__dirname, 'focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json'));

// Initialise Firebase Admin avec la clé de service
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function listUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  if (snapshot.empty) {
    console.log('Aucun utilisateur trouvé.');
    return;
  }
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

listUsers().catch(console.error);
