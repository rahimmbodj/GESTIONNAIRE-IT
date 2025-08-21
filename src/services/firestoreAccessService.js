// Service d'accès Firestore
import { db } from '../firebase';

// Cette fonction n'est plus nécessaire car l'accès est public
export async function isUserAllowed() {
  return true;
}
