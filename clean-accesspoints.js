const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json'); // Chemin vers votre fichier JSON

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanAccessPoints() {
  const snapshot = await db.collection('accessPoints').get();
  let cleaned = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const fieldsToRemove = ['security', 'channel', 'power', 'signalStrength'];
    const updateData = {};
    let hasOldFields = false;
    fieldsToRemove.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = FieldValue.delete();
        hasOldFields = true;
      }
    });
    if (hasOldFields) {
      await db.collection('accessPoints').doc(doc.id).update(updateData);
      cleaned++;
      console.log(`Nettoyé: ${doc.id}`);
    }
  }
  console.log(`✅ Nettoyage terminé ! ${cleaned} documents mis à jour.`);
}

cleanAccessPoints().catch(console.error);