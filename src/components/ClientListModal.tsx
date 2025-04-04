import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Modal } from './Modal';
import { ClientForm } from './ClientForm';
import { Pencil, Trash2, Plus, Building2, Search } from 'lucide-react';
import type { Client } from '../types';

interface ClientListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientListModal({ isOpen, onClose }: ClientListModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { clients, addDefaultClients, deleteClient } = useStore();

  const filteredClients = useMemo(() => {
    return clients
      .filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.postalCode.includes(searchTerm) ||
        client.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, searchTerm]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingClient(null);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#00a19a]" />
            <span>Gestion des Clients</span>
          </div>
          <div className="flex gap-2">
            {clients.length === 0 && (
              <button
                onClick={addDefaultClients}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                Ajouter les Clients par Défaut
              </button>
            )}
            <button
              onClick={() => {
                setEditingClient(null);
                setShowAddForm(true);
              }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Client
            </button>
          </div>
        </div>
      }
    >
      {showAddForm ? (
        <div className="space-y-4">
          <ClientForm 
            client={editingClient}
            onSuccess={handleFormSuccess}
          />
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingClient(null);
            }}
            className="text-[#6b7280] hover:text-[#3c3c3c] transition-colors text-sm"
          >
            Retour à la liste
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un client..."
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
                    Établissement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Code Postal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e5e5e5]">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#6b7280]">
                      {searchTerm ? 'Aucun résultat trouvé' : 'Aucun client enregistré'}
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {client.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {client.postalCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {client.city}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(client)}
                          className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors"
                        >
                          <Pencil className="w-4 h-4 inline-block" />
                        </button>
                        <button 
                          onClick={() => deleteClient(client.id)}
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