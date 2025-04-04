import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { useStore } from '../store';
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Agency } from '../types';

interface AgencyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgencyManagementModal({ isOpen, onClose }: AgencyManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const { agencies, addAgency, updateAgency, deleteAgency, addDefaultAgencies, clientOrders, updateClientOrder } = useStore();

  const filteredAgencies = useMemo(() => {
    return agencies
      .filter(agency => {
        const search = searchTerm.toLowerCase();
        return (
          agency.name.toLowerCase().includes(search) ||
          agency.code.toLowerCase().includes(search) ||
          agency.address.toLowerCase().includes(search) ||
          agency.phone.includes(search) ||
          agency.email.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agencies, searchTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    if (data.code.length !== 4) {
      alert("Le code agence doit contenir exactement 4 caractères");
      return;
    }

    if (!/^[A-Za-z]{3}\d$/.test(data.code)) {
      alert("Le code agence doit contenir 3 lettres suivies d'un chiffre");
      return;
    }

    if (editingAgency) {
      const oldCode = editingAgency.code;
      const newCode = data.code;

      // Mettre à jour l'agence
      await updateAgency(editingAgency.id, data);

      // Si le code a changé, mettre à jour toutes les missions associées
      if (oldCode !== newCode) {
        const missionsToUpdate = clientOrders.filter(order => order.agencyCode === oldCode);
        
        for (const mission of missionsToUpdate) {
          // Créer le nouveau numéro de mission en remplaçant l'ancien code par le nouveau
          const newMissionNumber = mission.missionNumber.replace(oldCode, newCode);
          
          await updateClientOrder(mission.id, {
            agencyCode: newCode,
            missionNumber: newMissionNumber
          });
        }
      }
    } else {
      await addAgency(data);
    }

    setShowAddForm(false);
    setEditingAgency(null);
    (e.target as HTMLFormElement).reset();
  };

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setShowAddForm(true);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#00a19a]" />
            <span>Gestion des Agences</span>
          </div>
          <div className="flex gap-2">
            {agencies.length === 0 && (
              <button
                onClick={addDefaultAgencies}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                Ajouter les Agences par Défaut
              </button>
            )}
            <button
              onClick={() => {
                setEditingAgency(null);
                setShowAddForm(true);
              }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Agence
            </button>
          </div>
        </div>
      }
    >
      {showAddForm ? (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[#3c3c3c] truncate">
                  Nom de l'Agence
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingAgency?.name}
                  className="input-field mt-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#3c3c3c] truncate">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={editingAgency?.email}
                  className="input-field mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-bold text-[#3c3c3c] truncate">
                  Code Agence
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  defaultValue={editingAgency?.code}
                  className="input-field mt-1 uppercase w-1/2"
                  pattern="[A-Za-z]{3}[0-9]{1}"
                  title="3 lettres suivies d'un chiffre"
                  maxLength={4}
                  placeholder="ABC1"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-[#3c3c3c] truncate">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={editingAgency?.phone}
                  className="input-field mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-bold text-[#3c3c3c] truncate">
                Adresse
              </label>
              <textarea
                id="address"
                name="address"
                defaultValue={editingAgency?.address}
                className="input-field mt-1"
                rows={2}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAgency(null);
                }}
                className="btn-secondary bg-gray-500 hover:bg-gray-600 border-gray-600"
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                {editingAgency ? 'Modifier l\'Agence' : 'Ajouter l\'Agence'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une agence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e5e5e5]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Agence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e5e5e5]">
                {filteredAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#6b7280]">
                      {searchTerm ? 'Aucun résultat trouvé' : 'Aucune agence enregistrée'}
                    </td>
                  </tr>
                ) : (
                  filteredAgencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#3c3c3c]">
                          {agency.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {agency.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {agency.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {agency.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {agency.email}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(agency)}
                          className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors"
                        >
                          <Pencil className="w-4 h-4 inline-block" />
                        </button>
                        <button 
                          onClick={() => deleteAgency(agency.id)}
                          className="text-[#ff4b4b] hover:text-[#e63e3e] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}