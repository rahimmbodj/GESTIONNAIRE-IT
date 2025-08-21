const admin = require('firebase-admin');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function migrateUsers() {
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    try {
      // Chercher l'utilisateur dans Firebase Auth
      const userRecord = await auth.getUserByEmail(data.email);
      if (userRecord) {
        // Copier les données dans un doc dont l'ID est l'UID
        await db.collection('users').doc(userRecord.uid).set({
          ...data,
          uid: userRecord.uid
        }, { merge: true });
        // Supprimer l'ancien doc si l'ID n'est pas l'UID
        if (doc.id !== userRecord.uid) {
          await doc.ref.delete();
          console.log(`Migré: ${data.email} -> UID: ${userRecord.uid}`);
        }
      }
    } catch (e) {
      console.error(`Erreur pour ${data.email}:`, e.message);
    }
  }
  console.log('Migration terminée.');
}

migrateUsers().then(() => process.exit(0));
