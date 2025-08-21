const admin = require('firebase-admin');
const serviceAccount = require('./focus-melody-467918-u9-firebase-adminsdk-fbsvc-1992506b95.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteAllUsers() {
  try {
    // Supprimer tous les documents de la collection 'users'
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    
    console.log(`Suppression de ${usersSnapshot.size} utilisateurs...`);
    
    usersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Tous les utilisateurs ont été supprimés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des utilisateurs:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllUsers();
