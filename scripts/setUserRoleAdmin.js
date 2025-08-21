const admin = require('firebase-admin');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function setAdminRole(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    await db.collection('users').doc(uid).set({
      role: 'admin'
    }, { merge: true });
    console.log(`Rôle 'admin' attribué à ${email} (UID: ${uid})`);
  } catch (e) {
    console.error('Erreur :', e.message);
  }
}

setAdminRole('rahimmbodj@gmail.com').then(() => process.exit(0));
