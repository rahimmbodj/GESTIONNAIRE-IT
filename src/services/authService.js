import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useState, useEffect } from 'react';

async function logAudit(action, user, details = {}) {
  try {
    await addDoc(collection(db, 'logs'), {
      action,
      user,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Optionnel : afficher une erreur ou ignorer
  }
}

// Service d'authentification
export const authService = {
  // Connexion utilisateur
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await logAudit('login', email, {});
      return userCredential.user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Création de compte utilisateur
  async signUp(email, password, displayName, role = 'technician') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mettre à jour le profil utilisateur
      await updateProfile(user, { displayName });

      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        createdAt: new Date(),
        isActive: true
      });

      return user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Déconnexion
  async signOut() {
    try {
      await signOut(auth);
      const user = this.getCurrentUser();
      if (user) await logAudit('logout', user.email, {});
    } catch (error) {
      throw new Error('Erreur lors de la déconnexion');
    }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return auth.currentUser;
  },

  // Obtenir le profil utilisateur depuis Firestore
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du profil');
    }
  },

  // Mettre à jour le profil utilisateur
  async updateUserProfile(uid, profileData) {
    try {
      await setDoc(doc(db, 'users', uid), profileData, { merge: true });
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  },

  // Vérifier les permissions utilisateur
  hasPermission(permission) {
    // À implémenter selon les besoins
    return true;
  },

  // Obtenir le rôle de l'utilisateur actuel
  getCurrentUserRole() {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    // Rôles prédéfinis
    const predefinedRoles = {
      'rahimbodj@gmail.com': 'admin',
      'testeurtesla@gmail.com': 'technician',
      'testeurtesla2@gmail.com': 'manager'
    };
    
    return predefinedRoles[user.email] || 'observer';
  },

  // Vérifier si l'utilisateur est authentifié
  async isAuthenticated() {
    return new Promise((resolve) => {
      const unsubscribe = this.onAuthStateChange((user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  },

  // Messages d'erreur personnalisés en français
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Aucun utilisateur trouvé avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
      'auth/network-request-failed': 'Erreur de connexion réseau',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée'
    };

    return errorMessages[errorCode] || 'Une erreur est survenue';
  }
};

// Hook personnalisé pour l'authentification (pour React)
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
