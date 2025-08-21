import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  writeBatch,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

async function logAudit(action, user, details = {}) {
  try {
    await addDoc(collection(db, 'logs'), {
      action,
      user,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (e) {}
}

// Service de gestion des interventions
export const interventionService = {
  // Obtenir toutes les interventions
  async getInterventions() {
    try {
      const q = query(
        collection(db, 'interventions'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des interventions:', error);
      return [];
    }
  },

  // Obtenir les interventions d'un bâtiment
  async getInterventionsByBuilding(buildingId) {
    try {
      const q = query(
        collection(db, 'interventions'),
        where('buildingId', '==', buildingId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des interventions du bâtiment:', error);
      return [];
    }
  },

  // Obtenir une intervention par ID
  async getInterventionById(id) {
    try {
      const docRef = doc(db, 'interventions', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'intervention:', error);
      return null;
    }
  },

  // Ajouter une nouvelle intervention
  async addIntervention(interventionData) {
    try {
      const docRef = await addDoc(collection(db, 'interventions'), {
        ...interventionData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed', // Par défaut
        technician: 'Système', // À remplacer par l'utilisateur connecté
        priority: 'normal' // Par défaut
      });
      await logAudit('add_intervention', 'Système', { interventionId: docRef.id });
      return { id: docRef.id, ...interventionData };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'intervention:', error);
      throw error;
    }
  },

  // Mettre à jour une intervention
  async updateIntervention(id, updateData) {
    try {
      const docRef = doc(db, 'interventions', id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
      await logAudit('update_intervention', 'Système', { interventionId: id });
      return { id, ...updateData };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'intervention:', error);
      throw error;
    }
  },

  // Supprimer une intervention
  async deleteIntervention(id) {
    try {
      const docRef = doc(db, 'interventions', id);
      await deleteDoc(docRef);
      await logAudit('delete_intervention', 'Système', { interventionId: id });
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'intervention:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des interventions
  async getInterventionStats() {
    try {
      const interventions = await this.getInterventions();
      
      const stats = {
        total: interventions.length,
        byBuilding: {},
        byStatus: {},
        byMonth: {}
      };

      interventions.forEach(intervention => {
        // Par bâtiment
        const buildingId = intervention.buildingId;
        stats.byBuilding[buildingId] = (stats.byBuilding[buildingId] || 0) + 1;

        // Par statut
        const status = intervention.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Par mois
        const date = new Date(intervention.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { total: 0, byBuilding: {}, byStatus: {}, byMonth: {} };
    }
  }
};

// Ajout de la fonction getInterventionHistory
export function getInterventionHistory(interventionId) {
  // À adapter selon la structure réelle de vos données Firestore
  return [];
}

export async function addTestInterventions() {
  const interventions = [
    {
      title: 'Remplacement switch B1',
      description: 'Remplacement du switch principal du bâtiment 1',
      date: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      status: 'completed',
      technician: 'testeurtesla@gmail.com',
    },
    {
      title: 'Ajout AP B2',
      description: 'Ajout d’un point d’accès dans le bâtiment 2',
      date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      status: 'in_progress',
      technician: 'testeurtesla@gmail.com',
    },
    {
      title: 'Maintenance PDB B3',
      description: 'Vérification du panneau de brassage bâtiment 3',
      date: new Date(),
      status: 'pending',
      technician: 'testeurtesla2@gmail.com',
    },
    {
      title: 'Clôture incident B4',
      description: 'Incident résolu et clôturé bâtiment 4',
      date: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      status: 'closed',
      technician: 'testeurtesla2@gmail.com',
    },
  ];
  const batch = writeBatch(db);
  interventions.forEach(i => {
    const ref = doc(collection(db, 'interventions'));
    batch.set(ref, {
      ...i,
      date: Timestamp.fromDate(i.date),
    });
  });
  await batch.commit();
}

export default interventionService;
