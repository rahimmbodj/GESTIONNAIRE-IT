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
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collections Firestore
const COLLECTIONS = {
  BUILDINGS: 'buildings',
  SWITCHES: 'switches',
  PATCH_PANELS: 'patchPanels',
  ACCESS_POINTS: 'accessPoints',
  INTERVENTIONS: 'interventions',
  USERS: 'users'
};

// Service pour les bâtiments
export const buildingService = {
  // Récupérer tous les bâtiments
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BUILDINGS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Récupérer un bâtiment par ID
  async getById(id) {
    const docRef = doc(db, COLLECTIONS.BUILDINGS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  // Créer un nouveau bâtiment
  async create(buildingData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.BUILDINGS), {
      ...buildingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Mettre à jour un bâtiment
  async update(id, buildingData) {
    const docRef = doc(db, COLLECTIONS.BUILDINGS, id);
    await updateDoc(docRef, {
      ...buildingData,
      updatedAt: serverTimestamp()
    });
  },

  // Supprimer un bâtiment
  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.BUILDINGS, id));
  }
};

// Service pour les commutateurs
export const switchService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SWITCHES));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getByBuilding(buildingId) {
    const q = query(
      collection(db, COLLECTIONS.SWITCHES),
      where('buildingId', '==', buildingId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(switchData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.SWITCHES), {
      ...switchData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id, switchData) {
    const docRef = doc(db, COLLECTIONS.SWITCHES, id);
    await updateDoc(docRef, {
      ...switchData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.SWITCHES, id));
  }
};

// Service pour les panneaux de brassage
export const patchPanelService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PATCH_PANELS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getByBuilding(buildingId) {
    const q = query(
      collection(db, COLLECTIONS.PATCH_PANELS),
      where('buildingId', '==', buildingId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(patchPanelData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.PATCH_PANELS), {
      ...patchPanelData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id, patchPanelData) {
    const docRef = doc(db, COLLECTIONS.PATCH_PANELS, id);
    await updateDoc(docRef, {
      ...patchPanelData,
      updatedAt: serverTimestamp()
    });
  }
};

// Service pour les points d'accès
export const accessPointService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ACCESS_POINTS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getByBuilding(buildingId) {
    const q = query(
      collection(db, COLLECTIONS.ACCESS_POINTS),
      where('buildingId', '==', buildingId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(accessPointData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.ACCESS_POINTS), {
      ...accessPointData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id, accessPointData) {
    const docRef = doc(db, COLLECTIONS.ACCESS_POINTS, id);
    await updateDoc(docRef, {
      ...accessPointData,
      updatedAt: serverTimestamp()
    });
  }
};

// Service pour les interventions
export const interventionService = {
  async getAll() {
    const q = query(
      collection(db, COLLECTIONS.INTERVENTIONS),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getByBuilding(buildingId) {
    const q = query(
      collection(db, COLLECTIONS.INTERVENTIONS),
      where('buildingId', '==', buildingId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(interventionData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.INTERVENTIONS), {
      ...interventionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id, interventionData) {
    const docRef = doc(db, COLLECTIONS.INTERVENTIONS, id);
    await updateDoc(docRef, {
      ...interventionData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.INTERVENTIONS, id));
  }
};

// Écouteur temps réel pour les mises à jour
export const realtimeListener = {
  buildings(callback) {
    return onSnapshot(collection(db, COLLECTIONS.BUILDINGS), callback);
  },
  
  switches(callback) {
    return onSnapshot(collection(db, COLLECTIONS.SWITCHES), callback);
  },
  
  accessPoints(callback) {
    return onSnapshot(collection(db, COLLECTIONS.ACCESS_POINTS), callback);
  },
  
  interventions(callback) {
    return onSnapshot(collection(db, COLLECTIONS.INTERVENTIONS), callback);
  }
};


