// Script Node.js pour supprimer les doublons d’utilisateurs dans Firestore
const admin = require('firebase-admin');
const path = require('path');
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error('Fichier serviceAccountKey.json manquant dans le dossier scripts. Placez la clé téléchargée depuis la console Firebase.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});
const db = admin.firestore();

async function cleanUserDuplicates() {
  const usersSnap = await db.collection('users').get();
  const users = [];
  usersSnap.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

  const seen = new Set();
  const toDelete = [];
  for (const user of users) {
    if (seen.has(user.email)) {
      toDelete.push(user.id);
    } else {
      seen.add(user.email);
    }
  }

  for (const id of toDelete) {
    await db.collection('users').doc(id).delete();
    console.log('Supprimé:', id);
  }
  console.log('Nettoyage terminé.');
}

cleanUserDuplicates();
