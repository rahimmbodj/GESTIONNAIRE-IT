import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { authService } from './services/authService';
import LoginForm from './components/LoginForm';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackMessage from './components/FeedbackMessage';
import Modal from './components/Modal';
import FormField from './components/FormField';
import SkeletonLoader from './components/SkeletonLoader';
import { roleService } from './services/roleService';
import { equipmentService } from './services/equipmentService';
import { interventionService } from './services/interventionService';
import Login from './components/Login';
import {
  Home as HomeIcon,
  Wifi as WifiIcon,
  Router as RouterIcon,
  Server as ServerIcon,
  Building as BuildingIcon,
  ShieldCheck as ShieldCheckIcon,
  ArrowRightCircle as ArrowRightCircleIcon,
  Layout as LayoutIcon,
  Globe as GlobeIcon,
  ClipboardList as ClipboardListIcon,
  PlusCircle as PlusCircleIcon,
  Radio as RadioIcon
} from 'lucide-react';
import { getTechnicians } from './services/roleService';
import { getInterventionHistory } from './services/interventionService';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import logoCrous from '../LOGO CROUS UAM.png';
import { storage } from './firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { addTestInterventions } from './services/interventionService';
Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

// État pour les données dynamiques de Firestore
const useFirestoreData = () => {
  const [data, setData] = useState({
    buildings: [],
    switches: [],
    accessPoints: [],
    patchPanels: [],
    interventions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = () => setRefreshIndex(i => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [buildings, switches, patchPanels, accessPoints] = await Promise.all([
          equipmentService.getBuildings(),
          equipmentService.getSwitches(),
          equipmentService.getPatchPanels(),
          equipmentService.getAccessPoints()
        ]);

        // Traiter les données pour ajouter les ports aux panneaux
        const processedPatchPanels = patchPanels.map(panel => {
          const panelPorts = accessPoints
            .filter(ap => ap.connectedTo && ap.connectedTo.includes(panel.id))
            .map((ap, index) => ({
              id: `${panel.id}-port-${index + 1}`,
              number: `Port ${index + 1}`,
              connectedTo: ap.name
            }));

          return {
            ...panel,
            ports: panelPorts
          };
        });

        // Charger interventions
        let interventions = [];
        try {
          interventions = await interventionService.getInterventions();
        } catch (e) {
          interventions = [];
        }

        setData({
          buildings,
          switches,
          accessPoints,
          patchPanels: processedPatchPanels,
          interventions
        });
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshIndex]);

  return { data, loading, error, refresh };
};

const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return [theme, setTheme];
};

const COLOR_PALETTE = [
  { name: 'Bleu', value: '#2563eb' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Vert', value: '#16a34a' },
  { name: 'Rouge', value: '#dc2626' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Gris', value: '#64748b' },
];

const getSavedColor = () => localStorage.getItem('mainColor') || '#2563eb';
const setSavedColor = (color) => localStorage.setItem('mainColor', color);

const applyMainColor = (color) => {
  document.documentElement.style.setProperty('--main-color', color);
};

const Layout = ({ children, onLogout, currentUser, userRole }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useTheme();
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null); // null par défaut
  const [logoLoading, setLogoLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mainColor, setMainColor] = useState(getSavedColor());
  const [showPalette, setShowPalette] = useState(false);
  // Ajout d'un état pour le menu mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Charger le logo personnalisé depuis Firebase Storage au démarrage
  useEffect(() => {
    const fetchLogo = async () => {
      setLogoLoading(true);
      try {
        const url = await getDownloadURL(storageRef(storage, 'branding/logo.png'));
        setLogoUrl(url);
      } catch (err) {
        setLogoUrl(null); // Pas de logo Storage, on utilisera le logo par défaut
        toast('Logo personnalisé non trouvé, logo par défaut utilisé.', { icon: 'ℹ️' });
      } finally {
        setLogoLoading(false);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    applyMainColor(mainColor);
    setSavedColor(mainColor);
  }, [mainColor]);

  // Handler d'upload
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      // Upload vers Firebase Storage
      const logoStorageRef = storageRef(storage, 'branding/logo.png');
      await uploadBytes(logoStorageRef, file);
      const url = await getDownloadURL(logoStorageRef);
      setLogoUrl(url);
      toast.success('Logo mis à jour avec succès !');
    } catch (err) {
      setUploadError('Erreur lors de l\'upload du logo');
      toast.error('Erreur lors de l\'upload du logo');
    } finally {
      setUploading(false);
      setShowLogoUpload(false);
    }
  };
  
  // Filtrer les sections selon le rôle de l'utilisateur
  const allNavItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: HomeIcon },
    { id: 'buildings', label: 'Bâtiments', icon: BuildingIcon },
    { id: 'switches', label: 'Commutateurs', icon: RouterIcon },
    { id: 'patchPanels', label: 'Panneaux de brassage', icon: LayoutIcon },
    { id: 'accessPoints', label: 'Points d\'accès', icon: WifiIcon },
    { id: 'unifiDevices', label: 'Appareils UniFi', icon: RadioIcon },
    { id: 'unifiAuth', label: 'Configuration UniFi', icon: ShieldCheckIcon },
    { id: 'interventions', label: 'Rapport d\'interventions', icon: ClipboardListIcon },
    { id: 'users', label: 'Utilisateurs', icon: ShieldCheckIcon },
    { id: 'audit', label: 'Audit', icon: ShieldCheckIcon }
  ];

  const navItems = allNavItems.filter(item => {
    const canAccess = roleService.canAccessSection(userRole, item.id);
    console.log(`Section ${item.id}: canAccess = ${canAccess} for role ${userRole}`); // Debug
    return canAccess;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Bouton burger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Ouvrir le menu"
        style={{ outline: '2px solid var(--main-color)' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Sidebar responsive */}
      <aside className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col items-center md:items-start z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{ maxWidth: '90vw' }}>
        <button className="md:hidden self-end mb-4" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {logoLoading ? (
          <div className="w-24 h-24 flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <img src={logoUrl || logoCrous} alt="Logo CROUS" className="w-24 h-24 object-contain mb-4 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white" />
        )}
        {userRole === 'admin' && (
          <>
            <button
              className="mb-2 px-3 py-1 rounded bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs"
              onClick={() => setShowPalette(!showPalette)}
            >
              Palette de couleurs
            </button>
            {showPalette && (
              <div className="mb-2 flex flex-wrap gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.value}
                    style={{ background: color.value, border: mainColor === color.value ? '2px solid #000' : 'none' }}
                    className="w-8 h-8 rounded-full focus:outline-none"
                    title={color.name}
                    onClick={() => setMainColor(color.value)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <button
          className="mb-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
        </button>
        <nav className="w-full">
          <ul className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 ${activeTab === item.id ? 'shadow-lg' : ''}`}
                  style={activeTab === item.id ? { background: 'var(--main-color)', color: '#fff' } : {}}
                >
                  <item.icon className="w-5 h-5 mr-2" style={activeTab === item.id ? { color: '#fff' } : { color: 'var(--main-color)' }} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {currentUser && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="mb-2">
              Bienvenue, {currentUser.displayName || currentUser.email}!
            </div>
            <div className="mb-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              Rôle : {roleService.roles[userRole]?.name || 'Utilisateur'}
            </div>
            <button
              onClick={onLogout}
              className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
            >
              Déconnexion
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children(activeTab)}
      </main>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 transform transition-transform hover:scale-105 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
      </div>
      <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
    </div>
  </div>
);

const Card = ({ title, children, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="flex items-center mb-4">
      <Icon className="w-6 h-6 mr-3 text-blue-500" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

const Dashboard = ({ data, userRole, refreshData }) => {
  const totalBuildings = data.buildings.length;
  const totalSwitches = data.switches.length;
  const totalPDBs = data.patchPanels.length;
  const totalAPs = data.accessPoints.length;

  // Si pas encore de données, afficher un message d'attente
  if (totalBuildings === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Chargement des données Firestore...
          </h2>
          <p className="text-gray-500 dark:text-gray-500">
            Veuillez patienter pendant que nous récupérons vos données
          </p>
        </div>
      </div>
    );
  }

  // Préparation des données pour les graphiques
  // 1. Interventions par mois
  const interventionsByMonth = Array(12).fill(0);
  (data.interventions || []).forEach(i => {
    if (i.date && i.date.seconds) {
      const d = new Date(i.date.seconds * 1000);
      interventionsByMonth[d.getMonth()]++;
    }
  });
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  // 2. Répartition équipements par bâtiment
  const buildingLabels = data.buildings.map(b => b.name);
  const apByBuilding = data.buildings.map(b => data.accessPoints.filter(ap => ap.buildingId === b.id).length);
  // 3. Statut des interventions
  const statusLabels = ['En attente', 'En cours', 'Terminée', 'Clôturée'];
  const statusCounts = [0,0,0,0];
  (data.interventions || []).forEach(i => {
    if (i.status === 'pending') statusCounts[0]++;
    else if (i.status === 'in_progress') statusCounts[1]++;
    else if (i.status === 'completed') statusCounts[2]++;
    else if (i.status === 'closed') statusCounts[3]++;
  });

  const [testLoading, setTestLoading] = useState(false);
  const handleAddTest = async () => {
    setTestLoading(true);
    try {
      await addTestInterventions();
      toast.success('Interventions de test ajoutées !');
      if (refreshData) refreshData();
    } catch (e) {
      toast.error('Erreur lors de l\'ajout des interventions de test');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Bâtiments" value={totalBuildings} icon={BuildingIcon} />
        <StatsCard title="Commutateurs" value={totalSwitches} icon={RouterIcon} />
        <StatsCard title="Panneaux de brassage" value={totalPDBs} icon={LayoutIcon} />
        <StatsCard title="Points d'accès" value={totalAPs} icon={WifiIcon} />
      </div>

      <Card title="État du réseau en direct" icon={GlobeIcon}>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.accessPoints.slice(0, 10).map(ap => (
            <li key={ap.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WifiIcon className="w-5 h-5 text-green-500 mr-3" />
                  <span className="font-semibold text-gray-900 dark:text-white">{ap.name}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">En ligne</span>
                </div>
              </div>
            </li>
          ))}
          {data.accessPoints.length > 10 && (
            <li className="py-4 text-center text-gray-500 dark:text-gray-400">
              ... et {data.accessPoints.length - 10} autres points d'accès
            </li>
          )}
        </ul>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-2">Interventions par mois</h3>
          <Bar data={{
            labels: months,
            datasets: [{
              label: 'Interventions',
              data: interventionsByMonth,
              backgroundColor: 'var(--main-color)',
            }],
          }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-2">Répartition AP par bâtiment</h3>
          <Pie data={{
            labels: buildingLabels,
            datasets: [{
              data: apByBuilding,
              backgroundColor: [
                '#2563eb','#ea580c','#16a34a','#dc2626','#7c3aed','#64748b','#fbbf24','#14b8a6','#f472b6','#a3e635','#f87171','#facc15'
              ],
            }],
          }} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-2">Statut des interventions</h3>
          <Doughnut data={{
            labels: statusLabels,
            datasets: [{
              data: statusCounts,
              backgroundColor: ['#fbbf24','#2563eb','#16a34a','#64748b'],
            }],
          }} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
      {userRole === 'admin' && (
        <button onClick={handleAddTest} disabled={testLoading} className="px-4 py-2 rounded bg-blue-600 text-white mb-4">
          {testLoading ? 'Ajout en cours...' : 'Ajouter des interventions de test'}
        </button>
      )}
    </div>
  );
};

const Buildings = ({ data }) => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bâtiments</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.buildings.map(building => (
        <Card key={building.id} title={building.name} icon={BuildingIcon}>
          <h3 className="font-semibold text-gray-900 dark:text-white">Commutateurs</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            {data.switches.filter(s => s.buildingId === building.id).map(s => (
              <li key={s.id} className="text-gray-700 dark:text-gray-300">{s.name} ({s.model})</li>
            ))}
          </ul>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Panneaux de brassage</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            {data.patchPanels.filter(p => p.buildingId === building.id).map(p => (
              <li key={p.id} className="text-gray-700 dark:text-gray-300">{p.name}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  </div>
);

const Switches = ({ data, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSwitch, setEditingSwitch] = useState(null);
  const [newSwitch, setNewSwitch] = useState({
    name: '',
    model: 'USW Pro 24 POE',
    version: '6.7.17',
    ip: '',
    buildingId: '',
    location: 'Salle serveur RDC',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSwitch({ ...newSwitch, [name]: value });
  };

  const handleAddSwitch = async (e) => {
    e.preventDefault();
    if (newSwitch.name && newSwitch.ip && newSwitch.buildingId) {
      try {
        const addedSwitch = await equipmentService.addSwitch(newSwitch);
        // Rafraîchir les données (idéalement, mettre à jour l'état local)
        setIsModalOpen(false);
        setNewSwitch({
          name: '',
          model: 'USW Pro 24 POE',
          version: '6.7.17',
          ip: '',
          buildingId: '',
          location: 'Salle serveur RDC',
          status: 'active'
        });
        toast.success('Switch ajouté avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du switch:', error);
        toast.error('Erreur lors de l\'ajout du switch');
      }
    }
  };

  const handleEditSwitch = (switchItem) => {
    setEditingSwitch(switchItem);
    setNewSwitch({
      name: switchItem.name,
      model: switchItem.model,
      version: switchItem.version,
      ip: switchItem.ip,
      buildingId: switchItem.buildingId,
      location: switchItem.location,
      status: switchItem.status
    });
    setIsModalOpen(true);
  };

  const handleUpdateSwitch = async (e) => {
    e.preventDefault();
    if (editingSwitch && newSwitch.name && newSwitch.ip && newSwitch.buildingId) {
      try {
        await equipmentService.updateEquipment('switches', editingSwitch.id, newSwitch);
        setIsModalOpen(false);
        setEditingSwitch(null);
        setNewSwitch({
          name: '',
          model: 'USW Pro 24 POE',
          version: '6.7.17',
          ip: '',
          buildingId: '',
          location: 'Salle serveur RDC',
          status: 'active'
        });
        toast.success('Switch mis à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du switch:', error);
        toast.error('Erreur lors de la mise à jour du switch');
      }
    }
  };

  const handleDeleteSwitch = async (switchId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce switch ?')) {
      try {
        await equipmentService.deleteEquipment('switches', switchId);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la suppression du switch:', error);
        toast.error('Erreur lors de la suppression du switch');
      }
    }
  };

  const SwitchModal = () => {
    const buildingOptions = data.buildings.map(b => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ));

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingSwitch ? 'Modifier le Switch' : 'Nouveau Switch'}
            </h2>
            <button onClick={() => {
              setIsModalOpen(false);
              setEditingSwitch(null);
              setNewSwitch({
                name: '',
                model: 'USW Pro 24 POE',
                version: '6.7.17',
                ip: '',
                buildingId: '',
                location: 'Salle serveur RDC',
                status: 'active'
              });
            }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={editingSwitch ? handleUpdateSwitch : handleAddSwitch} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du Switch *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newSwitch.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
                placeholder="Switch B1-1"
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modèle
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={newSwitch.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                placeholder="USW Pro 24 POE"
              />
            </div>
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Version Firmware
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={newSwitch.version}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                placeholder="6.7.17"
              />
            </div>
            <div>
              <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse IP *
              </label>
              <input
                type="text"
                id="ip"
                name="ip"
                value={newSwitch.ip}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
                placeholder="192.168.10.1"
              />
            </div>
            <div>
              <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bâtiment *
              </label>
              <select
                id="buildingId"
                name="buildingId"
                value={newSwitch.buildingId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
              >
                <option value="">Sélectionner un bâtiment</option>
                {buildingOptions}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Emplacement
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={newSwitch.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                placeholder="Salle serveur RDC"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={newSwitch.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="maintenance">Maintenance</option>
                <option value="error">Erreur</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSwitch(null);
                  setNewSwitch({
                    name: '',
                    model: 'USW Pro 24 POE',
                    version: '6.7.17',
                    ip: '',
                    buildingId: '',
                    location: 'Salle serveur RDC',
                    status: 'active'
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingSwitch ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
  <div className="space-y-8">
      <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commutateurs</h1>
        {roleService.canWriteSection(userRole, 'switches') && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Ajouter un switch
          </button>
        )}
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.switches.map(s => {
        const building = data.buildings.find(b => b.id === s.buildingId);
        return (
          <Card key={s.id} title={s.name} icon={RouterIcon}>
            <DetailRow label="Modèle" value={s.model} />
            <DetailRow label="IP" value={s.ip} />
            <DetailRow label="Version" value={s.version} />
            <DetailRow label="Bâtiment" value={building ? building.name : 'Inconnu'} />
              <DetailRow label="Emplacement" value={s.location || 'Non spécifié'} />
              <DetailRow label="Statut" value={
                <span className={`px-2 py-1 text-xs rounded-full ${
                  s.status === 'active' ? 'bg-green-100 text-green-800' :
                  s.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  s.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {s.status === 'active' ? 'Actif' :
                   s.status === 'inactive' ? 'Inactif' :
                   s.status === 'maintenance' ? 'Maintenance' :
                   'Erreur'}
                </span>
              } />
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Les ports des commutateurs sont connectés aux panneaux de brassage (PDB) du même bâtiment pour une gestion centralisée.
                </p>
            </div>
              {roleService.canWriteSection(userRole, 'switches') && (
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEditSwitch(s)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDeleteSwitch(s.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              )}
          </Card>
        );
      })}
    </div>
      {isModalOpen && createPortal(
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingSwitch ? "Modifier le commutateur" : "Ajouter un commutateur"}
        >
          <SwitchModal />
        </Modal>, 
        document.body
      )}
  </div>
);
};

const PatchPanels = ({ data, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPDB, setEditingPDB] = useState(null);
  const [newPDB, setNewPDB] = useState({
    name: '',
    buildingId: '',
    location: '',
    numberOfPorts: 24,
    status: 'active',
    ports: Array.from({ length: 24 }, (_, i) => ({
      id: `port-${i + 1}`,
      number: `Port ${i + 1}`,
      connectedTo: ''
    }))
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPDB({ ...newPDB, [name]: value });
  };

  const handleAddPDB = async (e) => {
    e.preventDefault();
    if (newPDB.name && newPDB.buildingId) {
      try {
        const addedPDB = await equipmentService.addPatchPanel(newPDB);
        setIsModalOpen(false);
        setNewPDB({
          name: '',
          buildingId: '',
          location: '',
          numberOfPorts: 24,
          status: 'active',
          ports: Array.from({ length: 24 }, (_, i) => ({
            id: `port-${i + 1}`,
            number: `Port ${i + 1}`,
            connectedTo: ''
          }))
        });
        toast.success('Panneau de brassage ajouté avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du panneau de brassage:', error);
        toast.error('Erreur lors de l\'ajout du panneau de brassage');
      }
    }
  };

  const handleEditPDB = (pdbItem) => {
    setEditingPDB(pdbItem);
    setNewPDB({
      name: pdbItem.name,
      buildingId: pdbItem.buildingId,
      location: pdbItem.location,
      numberOfPorts: pdbItem.numberOfPorts,
      status: pdbItem.status,
      ports: pdbItem.ports
    });
    setIsModalOpen(true);
  };

  const handleUpdatePDB = async (e) => {
    e.preventDefault();
    if (editingPDB && newPDB.name && newPDB.buildingId) {
      try {
        await equipmentService.updateEquipment('patchPanels', editingPDB.id, newPDB);
        setIsModalOpen(false);
        setEditingPDB(null);
        setNewPDB({
          name: '',
          buildingId: '',
          location: '',
          numberOfPorts: 24,
          status: 'active',
          ports: Array.from({ length: 24 }, (_, i) => ({
            id: `port-${i + 1}`,
            number: `Port ${i + 1}`,
            connectedTo: ''
          }))
        });
        toast.success('Panneau de brassage mis à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du panneau de brassage:', error);
        toast.error('Erreur lors de la mise à jour du panneau de brassage');
      }
    }
  };

  const handleDeletePDB = async (pdbId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce panneau de brassage ?')) {
      try {
        await equipmentService.deleteEquipment('patchPanels', pdbId);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la suppression du panneau de brassage:', error);
        toast.error('Erreur lors de la suppression du panneau de brassage');
      }
    }
  };

  const PDBModal = () => {
    const buildingOptions = data.buildings.map(b => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ));

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingPDB ? 'Modifier le Panneau de Brassage' : 'Nouveau Panneau de Brassage'}
            </h2>
            <button onClick={() => {
              setIsModalOpen(false);
              setEditingPDB(null);
              setNewPDB({
                name: '',
                buildingId: '',
                location: '',
                numberOfPorts: 24,
                status: 'active',
                ports: Array.from({ length: 24 }, (_, i) => ({
                  id: `port-${i + 1}`,
                  number: `Port ${i + 1}`,
                  connectedTo: ''
                }))
              });
            }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={editingPDB ? handleUpdatePDB : handleAddPDB} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du Panneau *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newPDB.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
                placeholder="PDB B1-1"
              />
            </div>
            <div>
              <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bâtiment *
              </label>
              <select
                id="buildingId"
                name="buildingId"
                value={newPDB.buildingId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
              >
                <option value="">Sélectionner un bâtiment</option>
                {buildingOptions}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Emplacement
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={newPDB.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                placeholder="Salle serveur RDC"
              />
            </div>
            <div>
              <label htmlFor="numberOfPorts" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de Ports
              </label>
              <input
                type="number"
                id="numberOfPorts"
                name="numberOfPorts"
                value={newPDB.numberOfPorts}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                min="1"
                max="24"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={newPDB.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="maintenance">Maintenance</option>
                <option value="error">Erreur</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPDB(null);
                  setNewPDB({
                    name: '',
                    buildingId: '',
                    location: '',
                    numberOfPorts: 24,
                    status: 'active',
                    ports: Array.from({ length: 24 }, (_, i) => ({
                      id: `port-${i + 1}`,
                      number: `Port ${i + 1}`,
                      connectedTo: ''
                    }))
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingPDB ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
  <div className="space-y-8">
      <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panneaux de brassage</h1>
        {roleService.canWriteSection(userRole, 'patchPanels') && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Ajouter un panneau
          </button>
        )}
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.patchPanels.map(pdb => (
        <Card key={pdb.id} title={pdb.name} icon={LayoutIcon}>
            <DetailRow label="Nombre de ports" value={pdb.numberOfPorts} />
            <DetailRow label="Emplacement" value={pdb.location || 'Non spécifié'} />
            <DetailRow label="Statut" value={
              <span className={`px-2 py-1 text-xs rounded-full ${
                pdb.status === 'active' ? 'bg-green-100 text-green-800' :
                pdb.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                pdb.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {pdb.status === 'active' ? 'Actif' :
                 pdb.status === 'inactive' ? 'Inactif' :
                 pdb.status === 'maintenance' ? 'Maintenance' :
                 'Erreur'}
                  </span>
            } />
            {roleService.canWriteSection(userRole, 'patchPanels') && (
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleEditPDB(pdb)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => handleDeletePDB(pdb.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            )}
        </Card>
      ))}
    </div>
      {isModalOpen && createPortal(<PDBModal />, document.body)}
  </div>
);
};

const AccessPoints = ({ data, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAP, setEditingAP] = useState(null);
  const [newAP, setNewAP] = useState({
    name: '',
    mac: '',
    model: 'UAP-AC-PRO',
    ip: '',
    buildingId: '',
    connectedTo: '',
    security: 'WPA3',
    version: '6.7.17',
    status: 'active',
    location: 'Plafond',
    channel: 'Auto',
    power: 'High'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAP({ ...newAP, [name]: value });
  };

  const handleAddAP = async (e) => {
    e.preventDefault();
    if (newAP.name && newAP.mac && newAP.buildingId) {
      try {
        const addedAP = await equipmentService.addAccessPoint(newAP);
        setIsModalOpen(false);
        setNewAP({
          name: '',
          mac: '',
          model: 'UAP-AC-PRO',
          ip: '',
          buildingId: '',
          connectedTo: '',
          security: 'WPA3',
          version: '6.7.17',
          status: 'active',
          location: 'Plafond',
          channel: 'Auto',
          power: 'High'
        });
        toast.success('Point d\'accès ajouté avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'ajout du point d\'accès:', error);
        toast.error('Erreur lors de l\'ajout du point d\'accès');
      }
    }
  };

  const handleEditAP = (apItem) => {
    setEditingAP(apItem);
    setNewAP({
      name: apItem.name,
      mac: apItem.mac,
      model: apItem.model,
      ip: apItem.ip,
      buildingId: apItem.buildingId,
      connectedTo: apItem.connectedTo,
      security: apItem.security,
      version: apItem.version,
      status: apItem.status,
      location: apItem.location,
      channel: apItem.channel,
      power: apItem.power
    });
    setIsModalOpen(true);
  };

  const handleUpdateAP = async (e) => {
    e.preventDefault();
    if (editingAP && newAP.name && newAP.mac && newAP.buildingId) {
      try {
        console.log('Mise à jour du point d\'accès:', editingAP.id, newAP);
        await equipmentService.updateEquipment('accessPoints', editingAP.id, newAP);
        console.log('Mise à jour réussie, rechargement de la page...');
        setIsModalOpen(false);
        setEditingAP(null);
        setNewAP({
          name: '',
          mac: '',
          model: 'UAP-AC-PRO',
          ip: '',
          buildingId: '',
          connectedTo: '',
          security: 'WPA3',
          version: '6.7.17',
          status: 'active',
          location: 'Plafond',
          channel: 'Auto',
          power: 'High'
        });
        toast.success('Point d\'accès mis à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du point d\'accès:', error);
        let errorMessage = 'Erreur lors de la mise à jour du point d\'accès';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'Permission refusée. Vérifiez vos droits d\'accès.';
        } else if (error.code === 'not-found') {
          errorMessage = 'Point d\'accès non trouvé. Il a peut-être été supprimé.';
        } else if (error.code === 'invalid-argument') {
          errorMessage = 'Données invalides. Vérifiez les informations saisies.';
        } else if (error.message) {
          errorMessage = `Erreur: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteAP = async (apId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce point d\'accès ?')) {
      try {
        await equipmentService.deleteEquipment('accessPoints', apId);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Erreur lors de la suppression du point d\'accès:', error);
        toast.error('Erreur lors de la suppression du point d\'accès');
      }
    }
  };

  const APModal = () => {
    const buildingOptions = data.buildings.map(b => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ));

    const patchPanelOptions = data.patchPanels.map(p => (
      <option key={p.id} value={p.id}>{p.name}</option>
    ));

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingAP ? 'Modifier le Point d\'Accès' : 'Nouveau Point d\'Accès'}
            </h2>
            <button onClick={() => {
              setIsModalOpen(false);
              setEditingAP(null);
              setNewAP({
                name: '',
                mac: '',
                model: 'UAP-AC-PRO',
                ip: '',
                buildingId: '',
                connectedTo: '',
                security: 'WPA3',
                version: '6.7.17',
                status: 'active',
                location: 'Plafond',
                channel: 'Auto',
                power: 'High'
              });
            }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={editingAP ? handleUpdateAP : handleAddAP} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom du Point d'Accès *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAP.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  required
                  placeholder="AP B1-E11"
                />
              </div>
              <div>
                <label htmlFor="mac" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse MAC *
                </label>
                <input
                  type="text"
                  id="mac"
                  name="mac"
                  value={newAP.mac}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  required
                  placeholder="00:11:22:33:44:55"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modèle
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={newAP.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  placeholder="UAP-AC-PRO"
                />
              </div>
              <div>
                <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse IP
                </label>
                <input
                  type="text"
                  id="ip"
                  name="ip"
                  value={newAP.ip}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  placeholder="192.168.10.100"
                />
              </div>
              <div>
                <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bâtiment *
                </label>
                <select
                  id="buildingId"
                  name="buildingId"
                  value={newAP.buildingId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  required
                >
                  <option value="">Sélectionner un bâtiment</option>
                  {buildingOptions}
                </select>
              </div>
              <div>
                <label htmlFor="connectedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connecté au PDB
                </label>
                <select
                  id="connectedTo"
                  name="connectedTo"
                  value={newAP.connectedTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                >
                  <option value="">Sélectionner un panneau</option>
                  {patchPanelOptions}
                </select>
              </div>
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Version Firmware
                </label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={newAP.version}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  placeholder="6.7.17"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={newAP.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="error">Erreur</option>
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emplacement
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newAP.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                  placeholder="Plafond"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAP(null);
                  setNewAP({
                    name: '',
                    mac: '',
                    model: 'UAP-AC-PRO',
                    ip: '',
                    buildingId: '',
                    connectedTo: '',
                    security: 'WPA3',
                    version: '6.7.17',
                    status: 'active',
                    location: 'Plafond',
                    channel: 'Auto',
                    power: 'High'
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingAP ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
  <div className="space-y-8">
      <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Points d'accès</h1>
        {roleService.canWriteSection(userRole, 'accessPoints') && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Ajouter un point d'accès
          </button>
        )}
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.accessPoints.map(ap => {
        const building = data.buildings.find(b => b.id === ap.buildingId);
          const patchPanel = data.patchPanels.find(p => p.id === ap.connectedTo);
        return (
          <Card key={ap.id} title={ap.name} icon={WifiIcon}>
            <DetailRow label="MAC" value={ap.mac} />
            <DetailRow label="Modèle" value={ap.model} />
              <DetailRow label="IP" value={ap.ip || 'DHCP'} />
            <DetailRow label="Bâtiment" value={building ? building.name : 'Inconnu'} />
              <DetailRow label="Connecté à" value={patchPanel ? patchPanel.name : ap.connectedTo || 'Non connecté'} />
              <DetailRow label="Statut" value={
                <span className={`px-2 py-1 text-xs rounded-full ${
                  ap.status === 'active' ? 'bg-green-100 text-green-800' :
                  ap.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  ap.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {ap.status === 'active' ? 'Actif' :
                   ap.status === 'inactive' ? 'Inactif' :
                   ap.status === 'maintenance' ? 'Maintenance' :
                   'Erreur'}
                </span>
              } />
              {roleService.canWriteSection(userRole, 'accessPoints') && (
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEditAP(ap)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDeleteAP(ap.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              )}
          </Card>
        );
      })}
    </div>
      {isModalOpen && createPortal(<APModal />, document.body)}
  </div>
);
};

const Interventions = ({ buildings, userRole }) => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');
  const [filterBuilding, setFilterBuilding] = useState('all');

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true);
        const data = await interventionService.getInterventions();
        setInterventions(data);
      } catch (error) {
        console.error('Erreur lors du chargement des interventions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [newIntervention, setNewIntervention] = useState({
    buildingId: '',
    date: new Date().toISOString().substring(0, 10),
    description: '',
    status: 'pending', // 'pending', 'in_progress', 'completed', 'closed'
    assignedTo: '', // ID de l'utilisateur assigné
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIntervention({ ...newIntervention, [name]: value });
  };

  const handleAddIntervention = async (e) => {
    e.preventDefault();
    if (newIntervention.buildingId && newIntervention.description) {
      try {
      const newReport = {
        ...newIntervention,
          buildingId: newIntervention.buildingId,
      };
        
        const addedIntervention = await interventionService.addIntervention(newReport);
        setInterventions([addedIntervention, ...interventions]);
      setIsModalOpen(false);
      setNewIntervention({
        buildingId: '',
        date: new Date().toISOString().substring(0, 10),
        description: '',
        status: 'pending',
        assignedTo: '',
      });
      toast.success('Intervention ajoutée avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'intervention:', error);
        toast.error('Erreur lors de l\'ajout de l\'intervention');
      }
    }
  };

  const handleEditIntervention = (interventionItem) => {
    setEditingIntervention(interventionItem);
    setNewIntervention({
      buildingId: interventionItem.buildingId,
      date: interventionItem.date && interventionItem.date.seconds ? new Date(interventionItem.date.seconds * 1000).toISOString().substring(0, 10) : '',
      description: interventionItem.description,
      status: interventionItem.status,
      assignedTo: interventionItem.assignedTo || '',
    });
    setIsModalOpen(true);
  };

  const handleUpdateIntervention = async (e) => {
    e.preventDefault();
    if (editingIntervention && newIntervention.buildingId && newIntervention.description) {
      try {
        const updatedIntervention = {
          ...editingIntervention,
          buildingId: newIntervention.buildingId,
          date: new Date(newIntervention.date).toISOString(),
          description: newIntervention.description,
          status: newIntervention.status,
          assignedTo: newIntervention.assignedTo,
        };
        await interventionService.updateIntervention(editingIntervention.id, updatedIntervention);
        setInterventions(interventions.map(i => i.id === editingIntervention.id ? updatedIntervention : i));
        setIsModalOpen(false);
        setEditingIntervention(null);
        setNewIntervention({
          buildingId: '',
          date: new Date().toISOString().substring(0, 10),
          description: '',
          status: 'pending',
          assignedTo: '',
        });
        toast.success('Intervention mise à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'intervention:', error);
        toast.error('Erreur lors de la mise à jour de l\'intervention');
      }
    }
  };

  const handleDeleteIntervention = async (interventionId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        await interventionService.deleteIntervention(interventionId);
        setInterventions(interventions.filter(i => i.id !== interventionId));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'intervention:', error);
        toast.error('Erreur lors de la suppression de l\'intervention');
      }
    }
  };

  const handleCloseIntervention = async (interventionId) => {
    if (confirm('Êtes-vous sûr de vouloir clôturer cette intervention ?')) {
      try {
        const updatedIntervention = {
          ...interventions.find(i => i.id === interventionId),
          status: 'closed',
          closedAt: new Date().toISOString(),
        };
        await interventionService.updateIntervention(interventionId, updatedIntervention);
        setInterventions(interventions.map(i => i.id === interventionId ? updatedIntervention : i));
      } catch (error) {
        console.error('Erreur lors de la clôture de l\'intervention:', error);
        toast.error('Erreur lors de la clôture de l\'intervention');
      }
    }
  };

  const handleReopenIntervention = async (interventionId) => {
    if (confirm('Êtes-vous sûr de vouloir rouvrir cette intervention ?')) {
      try {
        const updatedIntervention = {
          ...interventions.find(i => i.id === interventionId),
          status: 'pending',
          closedAt: null,
        };
        await interventionService.updateIntervention(interventionId, updatedIntervention);
        setInterventions(interventions.map(i => i.id === interventionId ? updatedIntervention : i));
      } catch (error) {
        console.error('Erreur lors de la réouverture de l\'intervention:', error);
        toast.error('Erreur lors de la réouverture de l\'intervention');
      }
    }
  };

  const handleAssignTechnician = async (interventionId, technicianId) => {
    if (confirm(`Êtes-vous sûr de vouloir assigner cette intervention à ${interventions.find(i => i.id === interventionId)?.assignedTo?.displayName || 'un technicien'} ?`)) {
      try {
        const updatedIntervention = {
          ...interventions.find(i => i.id === interventionId),
          assignedTo: technicianId,
        };
        await interventionService.updateIntervention(interventionId, updatedIntervention);
        setInterventions(interventions.map(i => i.id === interventionId ? updatedIntervention : i));
      } catch (error) {
        console.error('Erreur lors de l\'assignation du technicien:', error);
        toast.error('Erreur lors de l\'assignation du technicien');
      }
    }
  };

  const Modal = () => {
    const buildingOptions = buildings.map(b => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ));

    const technicianOptions = getTechnicians().map(tech => ({ id: tech.id, name: tech.displayName }));

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingIntervention ? 'Modifier l\'Intervention' : 'Nouvelle Intervention'}
            </h2>
            <button onClick={() => {
              setIsModalOpen(false);
              setEditingIntervention(null);
              setNewIntervention({
                buildingId: '',
                date: new Date().toISOString().substring(0, 10),
                description: '',
                status: 'pending',
                assignedTo: '',
              });
            }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={editingIntervention ? handleUpdateIntervention : handleAddIntervention} className="space-y-4">
            <div>
              <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bâtiment *
              </label>
              <select
                id="buildingId"
                name="buildingId"
                value={newIntervention.buildingId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
              >
                <option value="">Sélectionner un bâtiment</option>
                {buildingOptions}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newIntervention.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={newIntervention.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
                placeholder="Décrivez l'intervention effectuée..."
              ></textarea>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut *
              </label>
              <select
                id="status"
                name="status"
                value={newIntervention.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
                required
              >
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="closed">Clôturée</option>
              </select>
            </div>
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assigné à
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={newIntervention.assignedTo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border focus:outline-none focus:border-blue-500 text-black font-semibold bg-gray-200 text-base placeholder-gray-600"
              >
                <option value="">Sélectionner un technicien</option>
                {technicianOptions.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingIntervention(null);
                  setNewIntervention({
                    buildingId: '',
                    date: new Date().toISOString().substring(0, 10),
                    description: '',
                    status: 'pending',
                    assignedTo: '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingIntervention ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredInterventions = interventions.filter(intervention => {
    const matchesStatus = filterStatus === 'all' || intervention.status === filterStatus;
    const matchesTechnician = filterTechnician === 'all' || intervention.assignedTo === filterTechnician;
    const matchesBuilding = filterBuilding === 'all' || intervention.buildingId === filterBuilding;
    return matchesStatus && matchesTechnician && matchesBuilding;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapport d'interventions</h1>
        {roleService.canWriteSection(userRole, 'interventions') && (
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Ajouter une intervention
        </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminée</option>
          <option value="closed">Clôturée</option>
        </select>
        <select
          value={filterTechnician}
          onChange={(e) => setFilterTechnician(e.target.value)}
          className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Tous les techniciens</option>
          {getTechnicians().map(tech => (
            <option key={tech.id} value={tech.id}>{tech.displayName}</option>
          ))}
        </select>
        <select
          value={filterBuilding}
          onChange={(e) => setFilterBuilding(e.target.value)}
          className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Tous les bâtiments</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="large" color="blue" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement des interventions...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInterventions.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Aucune intervention trouvée</p>
            </div>
          ) : (
            filteredInterventions.map(intervention => {
          const building = buildings.find(b => b.id === intervention.buildingId);
          const assignedUser = getTechnicians().find(tech => tech.id === intervention.assignedTo);
          const statusHistory = getInterventionHistory(intervention.id);

          return (
            <Card key={intervention.id} title={`Intervention dans ${building ? building.name : 'Bâtiment inconnu'}`} icon={ClipboardListIcon}>
              <DetailRow label="Date" value={intervention.date && intervention.date.seconds ? new Date(intervention.date.seconds * 1000).toLocaleString() : 'Non renseignée'} />
              <DetailRow label="Statut" value={
                <span className={`px-2 py-1 text-xs rounded-full ${
                  intervention.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  intervention.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {intervention.status}
                </span>
              } />
              <DetailRow label="Assigné à" value={assignedUser ? assignedUser.displayName : 'Non assigné'} />
              <DetailRow label="Description" value={intervention.description} />
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">Historique des changements :</p>
                {statusHistory.length === 0 ? (
                  <p>Aucun changement de statut enregistré.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {statusHistory.map((entry, index) => (
                      <li key={index}>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {entry.timestamp && new Date(entry.timestamp.seconds * 1000).toLocaleString()}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          : {entry.field} a été changé en "{entry.newValue}"
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {roleService.canWriteSection(userRole, 'interventions') && (
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEditIntervention(intervention)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                  {intervention.status === 'pending' && (
                    <button 
                      onClick={() => handleAssignTechnician(intervention.id, intervention.assignedTo)}
                      className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                    >
                      Assigné à moi
                    </button>
                  )}
                  {intervention.status === 'in_progress' && (
                    <button 
                      onClick={() => handleReopenIntervention(intervention.id)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                    >
                      Rouvrir
                    </button>
                  )}
                  {intervention.status === 'completed' && (
                    <button 
                      onClick={() => handleCloseIntervention(intervention.id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Clôturer
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteIntervention(intervention.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </Card>
          );
            })
          )}
      </div>
      )}
      {isModalOpen && createPortal(<Modal />, document.body)}
    </div>
  );
};

// Fonction d'audit
const logAudit = async (action, user, details) => {
  try {
    await addDoc(collection(db, 'logs'), {
      action,
      user,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    toast.error('Erreur lors de l\'enregistrement du log : ' + err.message);
  }
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'observer', password: '' });
  const [adding, setAdding] = useState(false);
  const [editingFirstName, setEditingFirstName] = useState('');
  const [editingUserId, setEditingUserId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Rôle mis à jour avec succès !');
      await logAudit('role_change', userId, { newRole });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du rôle : ' + err.message);
    }
  };

  const handleResetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
      toast.success('Email de réinitialisation envoyé à ' + email);
      await logAudit('reset_password', email, {});
    } catch (err) {
      toast.error('Erreur lors de la réinitialisation : ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`)) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users => users.filter(u => u.id !== userId));
      toast.success('Utilisateur supprimé avec succès !');
      await logAudit('delete_user', userId, { email });
    } catch (err) {
      toast.error('Erreur lors de la suppression : ' + err.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await authService.signUp(newUser.email, newUser.password, newUser.name);
      await setDoc(doc(db, 'users', newUser.email), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });
      setUsers(users => [...users, { id: newUser.email, ...newUser }]);
      toast.success('Nouvel utilisateur ajouté !');
      await logAudit('add_user', newUser.email, { name: newUser.name, role: newUser.role });
      setNewUser({ email: '', name: '', role: 'observer', password: '' });
    } catch (err) {
      toast.error('Erreur lors de l\'ajout : ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingFirstName(user.name);
    setEditingUserId(user.id);
  };

  const handleSaveUser = async () => {
    if (editingFirstName.trim() === '') {
      toast.error('Le prénom ne peut pas être vide');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', editingUserId), { name: editingFirstName });
      setUsers(users => users.map(u => u.id === editingUserId ? { ...u, name: editingFirstName } : u));
      toast.success('Prénom mis à jour avec succès !');
      setEditingFirstName('');
      setEditingUserId('');
      await logAudit('update_user', editingUserId, { newName: editingFirstName });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du prénom : ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingFirstName('');
    setEditingUserId('');
  };

  const filteredUsers = users.filter(user => {
    const matchesEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesEmail && matchesRole;
  });

  if (loading) return <div className="p-8">Chargement des utilisateurs...</div>;
  if (error) return <div className="p-8 text-red-500">Erreur : {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <form className="mb-8 flex flex-wrap gap-4 items-end" onSubmit={handleAddUser}>
        <input type="email" required placeholder="Email" className="rounded border px-2 py-1" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
        <input type="text" required placeholder="Nom" className="rounded border px-2 py-1" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
        <select className="rounded border px-2 py-1" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="admin">Administrateur</option>
          <option value="technician">Technicien</option>
          <option value="manager">Gestionnaire</option>
          <option value="observer">Observateur</option>
        </select>
        <input type="text" required placeholder="Mot de passe temporaire" className="rounded border px-2 py-1" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={adding}>{adding ? 'Ajout...' : 'Ajouter'}</button>
      </form>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Rechercher par email"
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
          className="rounded border px-2 py-1"
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="rounded border px-2 py-1 ml-2"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Administrateur</option>
          <option value="technician">Technicien</option>
          <option value="manager">Gestionnaire</option>
          <option value="observer">Observateur</option>
        </select>
      </div>
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => handleResetPassword(user.email)}>Réinitialiser</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDeleteUser(user.id, user.email)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingFirstName && editingUserId && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Nouveau prénom"
            value={editingFirstName}
            onChange={e => setEditingFirstName(e.target.value)}
            className="rounded border px-2 py-1"
          />
          <button onClick={handleSaveUser} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">Enregistrer</button>
          <button onClick={handleCancelEdit} className="ml-2 px-4 py-2 bg-red-500 text-white rounded">Annuler</button>
        </div>
      )}
    </div>
  );
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'logs'));
        const logList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(logList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    (filterAction === 'all' || log.action === filterAction) &&
    (filterUser === 'all' || log.user === filterUser)
  );

  const handleExportCSV = () => {
    const header = 'Date,Action,Utilisateur,Détails\n';
    const rows = filteredLogs.map(log => {
      const date = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : '';
      return `${date},${log.action},${log.user},${JSON.stringify(log.details)}`;
    });
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'audit_logs.csv');
  };

  const handleExportPDF = () => {
    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<html><head><title>Audit Logs</title></head><body>');
    win.document.write('<h1>Audit Logs</h1>');
    win.document.write('<table border="1"><tr><th>Date</th><th>Action</th><th>Utilisateur</th><th>Détails</th></tr>');
    filteredLogs.forEach(log => {
      const date = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : '';
      win.document.write(`<tr><td>${date}</td><td>${log.action}</td><td>${log.user}</td><td>${JSON.stringify(log.details)}</td></tr>`);
    });
    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
  };

  if (loading) return <div className="p-8">Chargement des logs...</div>;
  if (error) return <div className="p-8 text-red-500">Erreur : {error}</div>;

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Historique / Audit</h1>
      <div className="flex gap-4 mb-4">
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="rounded border px-2 py-1">
          <option value="all">Toutes les actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="rounded border px-2 py-1">
          <option value="all">Tous les utilisateurs</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-500 text-white rounded">Exporter en CSV</button>
        <button onClick={handleExportPDF} className="px-4 py-2 bg-red-500 text-white rounded">Exporter en PDF</button>
      </div>
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Utilisateur</th>
            <th className="px-4 py-2">Détails</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => (
            <tr key={log.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-4 py-2">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : ''}</td>
              <td className="px-4 py-2">{log.action}</td>
              <td className="px-4 py-2">{log.user}</td>
              <td className="px-4 py-2">{JSON.stringify(log.details)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { data: firestoreData, loading, error, refresh } = useFirestoreData();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
      }
      if (isAuth) {
        const user = authService.getCurrentUser();
        console.log('Current user:', user); // Debug
        setCurrentUser(user);
        
        // Déterminer le rôle de l'utilisateur
        const role = roleService.getUserRole(user.email);
        console.log('User email:', user.email, 'Role:', role, 'Role details:', roleService.roles[role]); // Debug
        setUserRole(role);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    
    // Déterminer le rôle de l'utilisateur
    const role = roleService.getUserRole(user.email);
    console.log('Login success - User email:', user.email, 'Role:', role); // Debug
    setUserRole(role);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

    // Afficher un indicateur de chargement seulement si pas encore de données
  if (loading && !firestoreData.buildings.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400">Chargement des données Firestore...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur seulement si pas de données et erreur
  if (error && !firestoreData.buildings.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erreur de chargement Firestore
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Impossible de charger les données depuis Firestore
          </p>
          <p className="text-sm text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Toaster position="top-right" />
      <Layout onLogout={handleLogout} currentUser={currentUser} userRole={userRole}>
        {(activeTab) => {
          // Vérifier si l'utilisateur peut accéder à cette section
          if (!roleService.canAccessSection(userRole, activeTab)) {
            return (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Accès non autorisé
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vous n'avez pas les permissions nécessaires pour accéder à cette section.
                  </p>
                </div>
              </div>
            );
          }

          switch (activeTab) {
            case 'dashboard':
              return <Dashboard data={firestoreData} userRole={userRole} refreshData={refresh} />;
            case 'buildings':
              return <Buildings data={firestoreData} />;
            case 'switches':
              return <Switches data={firestoreData} userRole={userRole} />;
            case 'patchPanels':
              return <PatchPanels data={firestoreData} userRole={userRole} />;
            case 'unifiAuth':
              return <UnifiAuth />;
            case 'accessPoints':
              return <AccessPoints data={firestoreData} userRole={userRole} />;
            case 'interventions':
              return <Interventions buildings={firestoreData.buildings} userRole={userRole} />;
            case 'users':
              return <Users />;
            case 'audit':
              return <AuditLogs />;
            default:
              return <>
                <Dashboard data={firestoreData} />
                <UnifiDevices />
              </>;
          }
        }}
      </Layout>
    </div>
  );
};

export default App;

