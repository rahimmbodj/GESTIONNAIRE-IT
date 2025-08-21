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

// Service de gestion des équipements
export const equipmentService = {
  // Obtenir tous les bâtiments
  async getBuildings() {
    try {
      const querySnapshot = await getDocs(collection(db, 'buildings'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des bâtiments:', error);
      return [];
    }
  },

  // Obtenir tous les switches
  async getSwitches() {
    try {
      const querySnapshot = await getDocs(collection(db, 'switches'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des switches:', error);
      return [];
    }
  },

  // Obtenir tous les panneaux de brassage
  async getPatchPanels() {
    try {
      const querySnapshot = await getDocs(collection(db, 'patchPanels'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des panneaux:', error);
      return [];
    }
  },

  // Obtenir tous les points d'accès
  async getAccessPoints() {
    try {
      const querySnapshot = await getDocs(collection(db, 'accessPoints'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des points d\'accès:', error);
      return [];
    }
  },

  // Obtenir tous les équipements d'un bâtiment
  async getEquipmentByBuilding(buildingId) {
    try {
      const [switches, patchPanels, accessPoints] = await Promise.all([
        this.getSwitchesByBuilding(buildingId),
        this.getPatchPanelsByBuilding(buildingId),
        this.getAccessPointsByBuilding(buildingId)
      ]);

      return {
        switches,
        patchPanels,
        accessPoints
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements du bâtiment:', error);
      return { switches: [], patchPanels: [], accessPoints: [] };
    }
  },

  // Obtenir les switches d'un bâtiment
  async getSwitchesByBuilding(buildingId) {
    try {
      const q = query(
        collection(db, 'switches'),
        where('buildingId', '==', buildingId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des switches du bâtiment:', error);
      return [];
    }
  },

  // Obtenir les panneaux d'un bâtiment
  async getPatchPanelsByBuilding(buildingId) {
    try {
      const q = query(
        collection(db, 'patchPanels'),
        where('buildingId', '==', buildingId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des panneaux du bâtiment:', error);
      return [];
    }
  },

  // Obtenir les points d'accès d'un bâtiment
  async getAccessPointsByBuilding(buildingId) {
    try {
      const q = query(
        collection(db, 'accessPoints'),
        where('buildingId', '==', buildingId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des points d\'accès du bâtiment:', error);
      return [];
    }
  },

  // Ajouter un nouveau switch
  async addSwitch(switchData) {
    try {
      const docRef = await addDoc(collection(db, 'switches'), {
        ...switchData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await logAudit('addSwitch', 'system', { switchId: docRef.id });
      return { id: docRef.id, ...switchData };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du switch:', error);
      throw error;
    }
  },

  // Ajouter un nouveau panneau de brassage
  async addPatchPanel(patchPanelData) {
    try {
      const docRef = await addDoc(collection(db, 'patchPanels'), {
        ...patchPanelData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await logAudit('addPatchPanel', 'system', { patchPanelId: docRef.id });
      return { id: docRef.id, ...patchPanelData };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du panneau:', error);
      throw error;
    }
  },

  // Ajouter un nouveau point d'accès
  async addAccessPoint(accessPointData) {
    try {
      const docRef = await addDoc(collection(db, 'accessPoints'), {
        ...accessPointData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await logAudit('addAccessPoint', 'system', { accessPointId: docRef.id });
      return { id: docRef.id, ...accessPointData };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du point d\'accès:', error);
      throw error;
    }
  },

  // Mettre à jour un équipement
  async updateEquipment(collectionName, id, updateData) {
    try {
      console.log(`Tentative de mise à jour ${collectionName} avec ID:`, id);
      console.log('Données de mise à jour:', updateData);
      
      const docRef = doc(db, collectionName, id);
      
      // Vérifier que le document existe avant la mise à jour
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Document ${id} non trouvé dans la collection ${collectionName}`);
      }
      
      // Préparer les données de mise à jour
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };
      
      // Dans updateEquipment, avant d'appeler updateDoc, filtrer updateData :
      // const filteredData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== null));
      // Utiliser filteredData dans updateDoc.
      const filteredData = Object.fromEntries(Object.entries(updatePayload).filter(([_, v]) => v !== undefined && v !== null));
      
      console.log('Payload de mise à jour:', filteredData);
      
      await updateDoc(docRef, filteredData);
      await logAudit('updateEquipment', 'system', { collectionName, equipmentId: id });
      console.log(`Mise à jour réussie pour ${collectionName} ID: ${id}`);
      
      return { id, ...updateData };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'équipement ${collectionName}:`, error);
      console.error('Détails de l\'erreur:', {
        collectionName,
        id,
        updateData,
        errorCode: error.code,
        errorMessage: error.message
      });
      throw error;
    }
  },

  // Supprimer un équipement
  async deleteEquipment(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      await logAudit('deleteEquipment', 'system', { collectionName, equipmentId: id });
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'équipement ${collectionName}:`, error);
      throw error;
    }
  }
};

export default equipmentService;
