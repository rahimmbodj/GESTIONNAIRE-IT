import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash, Search } from 'lucide-react';
import Modal from './Modal';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const Buildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBuildings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'buildings'));
      const buildingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des bâtiments:', error);
      toast.error('Erreur lors du chargement des bâtiments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (selectedBuilding) {
        // Mise à jour
        await updateDoc(doc(db, 'buildings', selectedBuilding.id), formData);
        toast.success('Bâtiment mis à jour avec succès');
      } else {
        // Création
        await addDoc(collection(db, 'buildings'), formData);
        toast.success('Bâtiment ajouté avec succès');
      }
      setIsAddModalOpen(false);
      fetchBuildings();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du bâtiment');
    }
  };

  const handleDelete = async (buildingId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bâtiment ?')) {
      try {
        await deleteDoc(doc(db, 'buildings', buildingId));
        toast.success('Bâtiment supprimé avec succès');
        fetchBuildings();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du bâtiment');
      }
    }
  };

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="glass-title">Bâtiments</h1>
          <button
            onClick={() => {
              setSelectedBuilding(null);
              setIsAddModalOpen(true);
            }}
            className="glass-button inline-flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Ajouter un bâtiment
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un bâtiment..."
            className="glass-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Nom du bâtiment</th>
                <th>Emplacement</th>
                <th>Nombre d'étages</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((building) => (
                <tr key={building.id}>
                  <td>{building.name}</td>
                  <td>{building.location}</td>
                  <td>{building.floors}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      building.status === 'active'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {building.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBuilding(building);
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(building.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={selectedBuilding ? "Modifier le bâtiment" : "Ajouter un bâtiment"}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = {
              name: e.target.name.value,
              location: e.target.location.value,
              floors: parseInt(e.target.floors.value),
              status: e.target.status.value
            };
            handleSubmit(formData);
          }} className="glass-form">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom du bâtiment
              </label>
              <input
                type="text"
                name="name"
                defaultValue={selectedBuilding?.name}
                required
                className="glass-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Emplacement
              </label>
              <input
                type="text"
                name="location"
                defaultValue={selectedBuilding?.location}
                required
                className="glass-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre d'étages
              </label>
              <input
                type="number"
                name="floors"
                defaultValue={selectedBuilding?.floors}
                required
                min="1"
                className="glass-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                État
              </label>
              <select
                name="status"
                defaultValue={selectedBuilding?.status || 'active'}
                className="glass-select w-full"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="glass-button bg-gray-500/20"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="glass-button bg-blue-500/20"
              >
                {selectedBuilding ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Buildings;
