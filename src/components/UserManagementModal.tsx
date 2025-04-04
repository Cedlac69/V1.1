import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { useStore } from '../store';
import { Users2, Pencil, Plus, Search, Check, X } from 'lucide-react';
import type { User } from '../types';
import { UserCreationForm } from './UserCreationForm';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { users, agencies, updateUser } = useStore();

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const search = searchTerm.toLowerCase();
        return (
          user.email.toLowerCase().includes(search) ||
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));
  }, [users, searchTerm]);

  const handleSave = async (userId: string, agencyId: string) => {
    await updateUser(userId, { agencyId });
    setEditingUser(null);
  };

  const getAgencyName = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'Non affecté';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'manager':
        return 'Manager';
      case 'user':
        return 'Utilisateur';
      default:
        return role;
    }
  };

  const handleCreateSuccess = () => {
    setShowAddForm(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Users2 className="w-6 h-6 text-[#00a19a]" />
            <span>Gestion des Utilisateurs</span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel Utilisateur
          </button>
        </div>
      }
    >
      {showAddForm ? (
        <div className="space-y-4">
          <UserCreationForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Agence
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e5e5e5]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#6b7280]">
                      {searchTerm ? 'Aucun résultat trouvé' : 'Aucun utilisateur enregistré'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#3c3c3c]">
                          {user.lastName} {user.firstName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-[#1cb0f6] bg-opacity-20 text-[#1cb0f6]'
                            : user.role === 'manager'
                            ? 'bg-[#00a19a] bg-opacity-20 text-[#00a19a]'
                            : 'bg-[#6b7280] bg-opacity-20 text-[#6b7280]'
                        }`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.agencyId}
                            onChange={(e) => setEditingUser({ ...editingUser, agencyId: e.target.value })}
                            className="select-field py-1 px-2 text-sm"
                          >
                            <option value="">Non affecté</option>
                            {agencies.map((agency) => (
                              <option key={agency.id} value={agency.id}>
                                {agency.name} ({agency.code})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-[#3c3c3c]">
                            {getAgencyName(user.agencyId)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {editingUser?.id === user.id ? (
                          <>
                            <button
                              onClick={() => handleSave(user.id, editingUser.agencyId)}
                              className="text-[#58cc02] hover:text-[#46a302] transition-colors"
                            >
                              <Check className="w-5 h-5 inline-block" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-[#ff4b4b] hover:text-[#e63e3e] transition-colors"
                            >
                              <X className="w-5 h-5 inline-block" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors"
                          >
                            <Pencil className="w-4 h-4 inline-block" />
                          </button>
                        )}
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