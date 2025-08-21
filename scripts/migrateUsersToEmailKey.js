const admin = require('firebase-admin');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrateUsersToEmailKey() {
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const email = data.email;
    if (!email) continue;
    // Créer un nouveau doc avec l'email comme ID
    await db.collection('users').doc(email).set(data, { merge: true });
    // Supprimer l'ancien doc si l'ID n'est pas l'email
    if (doc.id !== email) {
      await doc.ref.delete();
      console.log(`Migré: ${doc.id} -> ${email}`);
    }
  }
  console.log('Migration terminée.');
}

migrateUsersToEmailKey().then(() => process.exit(0));
