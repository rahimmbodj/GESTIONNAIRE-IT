import React, { useState } from 'react';
import ResponsiveTable from './ResponsiveTable';
import ResponsiveForm, { FormField, ResponsiveButton } from './ResponsiveForm';
import { PlusCircle, Edit, Trash, Network } from 'lucide-react';

const PatchPanels = () => {
  const [patchPanels, setPatchPanels] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);

  const headers = [
    { 
      key: 'name', 
      label: 'Nom'
    },
    { 
      key: 'building', 
      label: 'Bâtiment'
    },
    { 
      key: 'location', 
      label: 'Emplacement'
    },
    { 
      key: 'ports', 
      label: 'Ports',
      render: (value) => (
        <div className="flex items-center">
          <Network className="w-4 h-4 mr-2 text-blue-500" />
          <span>{value} ports</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'État',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800'
            : value === 'maintenance'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {
            value === 'active' ? 'Actif' 
            : value === 'maintenance' ? 'En maintenance'
            : 'Hors service'
          }
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, panel) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPanel(panel);
              setIsAddModalOpen(true);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(panel.id);
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
          <h2 className="text-2xl font-bold text-gray-900">Panneaux de brassage</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les panneaux de brassage du réseau
          </p>
        </div>
        <ResponsiveButton
          onClick={() => {
            setSelectedPanel(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Ajouter un panneau
        </ResponsiveButton>
      </div>

      {/* Table responsive */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <ResponsiveTable
          headers={headers}
          data={patchPanels}
          keyField="id"
          onRowClick={(panel) => {
            setSelectedPanel(panel);
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
                {selectedPanel ? 'Modifier le panneau' : 'Ajouter un panneau'}
              </h3>
              <ResponsiveForm
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd({
                    // Récupérer les données du formulaire
                  });
                }}
              >
                <FormField label="Nom du panneau">
                  <input
                    type="text"
                    className="form-input"
                    defaultValue={selectedPanel?.name}
                    required
                  />
                </FormField>

                <FormField label="Bâtiment">
                  <select className="form-input" defaultValue={selectedPanel?.building}>
                    <option value="">Sélectionner un bâtiment</option>
                    {/* Options des bâtiments */}
                  </select>
                </FormField>

                <FormField label="Emplacement">
                  <input
                    type="text"
                    className="form-input"
                    defaultValue={selectedPanel?.location}
                    required
                  />
                </FormField>

                <FormField label="Nombre de ports">
                  <input
                    type="number"
                    className="form-input"
                    defaultValue={selectedPanel?.ports}
                    required
                    min="1"
                  />
                </FormField>

                <FormField label="État">
                  <select 
                    className="form-input"
                    defaultValue={selectedPanel?.status || 'active'}
                  >
                    <option value="active">Actif</option>
                    <option value="maintenance">En maintenance</option>
                    <option value="offline">Hors service</option>
                  </select>
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
                    {selectedPanel ? 'Modifier' : 'Ajouter'}
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

export default PatchPanels;
