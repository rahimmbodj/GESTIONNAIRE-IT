import React, { useState } from 'react';
import ResponsiveTable from './ResponsiveTable';
import ResponsiveForm, { FormField, ResponsiveButton } from './ResponsiveForm';
import { PlusCircle, Edit, Trash } from 'lucide-react';

const Buildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const headers = [
    { 
      key: 'name', 
      label: 'Nom du bâtiment'
    },
    { 
      key: 'location', 
      label: 'Emplacement' 
    },
    { 
      key: 'floors', 
      label: 'Nombre d\'étages'
    },
    { 
      key: 'status', 
      label: 'État',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'active' ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, building) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBuilding(building);
              setIsAddModalOpen(true);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(building.id);
            }}
            className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Gestion des actions
  const handleAdd = (data) => {
    // Logique d'ajout
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id) => {
    // Logique de suppression
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bâtiments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les bâtiments du campus
          </p>
        </div>
        <ResponsiveButton
          onClick={() => {
            setSelectedBuilding(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Ajouter un bâtiment
        </ResponsiveButton>
      </div>

      {/* Table responsive */}
      <div className="bg-white shadow-sm rounded-lg">
        <ResponsiveTable
          headers={headers}
          data={buildings}
          keyField="id"
          onRowClick={(building) => {
            setSelectedBuilding(building);
            setIsAddModalOpen(true);
          }}
        />
      </div>

      {/* Modal d'ajout/modification */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedBuilding ? 'Modifier le bâtiment' : 'Ajouter un bâtiment'}
              </h3>
              <ResponsiveForm
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd({
                    // Récupérer les données du formulaire
                  });
                }}
              >
                <FormField label="Nom du bâtiment">
                  <input
                    type="text"
                    className="form-input"
                    defaultValue={selectedBuilding?.name}
                    required
                  />
                </FormField>

                <FormField label="Emplacement">
                  <input
                    type="text"
                    className="form-input"
                    defaultValue={selectedBuilding?.location}
                    required
                  />
                </FormField>

                <FormField label="Nombre d'étages">
                  <input
                    type="number"
                    className="form-input"
                    defaultValue={selectedBuilding?.floors}
                    required
                  />
                </FormField>

                <div className="flex justify-end gap-3 col-span-full mt-6">
                  <ResponsiveButton
                    type="button"
                    variant="secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Annuler
                  </ResponsiveButton>
                  <ResponsiveButton type="submit">
                    {selectedBuilding ? 'Modifier' : 'Ajouter'}
                  </ResponsiveButton>
                </div>
              </ResponsiveForm>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buildings;
