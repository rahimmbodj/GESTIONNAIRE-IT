// Service de gestion des rôles et permissions
export const roleService = {
  // Définition des rôles et leurs permissions
  roles: {
    admin: {
      name: 'Administrateur',
      permissions: ['all'], // Accès complet à tout
      description: 'Accès complet à toutes les fonctionnalités'
    },
    technician: {
      name: 'Technicien',
      permissions: ['read_buildings', 'read_accessPoints'],
      description: 'Accès uniquement aux Bâtiments et Points d\'accès'
    },
    manager: {
      name: 'Gestionnaire',
      permissions: ['read_interventions', 'write_interventions'],
      description: 'Accès uniquement aux Rapports d\'interventions'
    },
    observer: {
      name: 'Observateur',
      permissions: ['read'],
      description: 'Lecture seule'
    }
  },

  // Obtenir le rôle d'un utilisateur par email
  getUserRole(email) {
    const predefinedUsers = {
      'rahimmbodj@gmail.com': 'admin', // Email correct avec "m" supplémentaire
      'testeurtesla@gmail.com': 'technician',
      'testeurtesla2@gmail.com': 'manager'
    };
    
    console.log('getUserRole called with email:', email); // Debug
    console.log('Available emails:', Object.keys(predefinedUsers)); // Debug
    const role = predefinedUsers[email] || 'observer';
    console.log('Assigned role:', role); // Debug
    return role;
  },

  // Vérifier si un utilisateur a une permission spécifique
  hasPermission(userRole, permission) {
    const role = this.roles[userRole];
    if (!role) return false;
    
    if (role.permissions.includes('all')) return true;
    return role.permissions.includes(permission);
  },

  // Vérifier l'accès à une section (LECTURE SEULE)
  canAccessSection(userRole, section) {
    if (!userRole) return false;
    
    // L'administrateur a toujours accès à tout
    if (userRole === 'admin') return true;
    
    // Permissions d'accès par section et par rôle
    const sectionAccess = {
      'dashboard': ['admin'], // Seul l'admin voit le dashboard
      'buildings': ['admin', 'technician'],
      'switches': ['admin', 'technician'],
      'patchPanels': ['admin', 'technician'],
      'accessPoints': ['admin', 'technician'],
      'interventions': ['admin', 'manager']
    };
    
    const allowedRoles = sectionAccess[section] || [];
    return allowedRoles.includes(userRole);
  },

  // Vérifier si un utilisateur peut ÉCRIRE dans une section
  canWriteSection(userRole, section) {
    if (!userRole) return false;
    
    // L'administrateur peut toujours écrire
    if (userRole === 'admin') return true;
    
    // Permissions d'écriture par section et par rôle
    const writePermissions = {
      'switches': ['admin', 'technician'],
      'patchPanels': ['admin', 'technician'],
      'accessPoints': ['admin', 'technician'],
      'interventions': ['admin', 'manager']
    };
    
    const allowedRoles = writePermissions[section] || [];
    return allowedRoles.includes(userRole);
  },

  // Obtenir les sections accessibles pour un rôle
  getAccessibleSections(userRole) {
    if (!userRole) return ['dashboard'];
    
    const allSections = ['dashboard', 'buildings', 'switches', 'patchPanels', 'accessPoints', 'interventions'];
    
    return allSections.filter(section => 
      this.canAccessSection(userRole, section)
    );
  }
};

// Ajout de la fonction getTechnicians
const getTechnicians = () => [
  { email: 'testeurtesla@gmail.com', name: 'Technicien Tesla' },
  // Ajoutez d'autres techniciens ici si besoin
];

// Exporter la fonction
export { getTechnicians };

export default roleService;
