import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Modal } from './Modal';
import { ConsultantForm } from './ConsultantForm';
import { Pencil, Trash2, Plus, Users, Search, Building2 } from 'lucide-react';
import type { Consultant } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CandidateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateListModal({ isOpen, onClose }: CandidateListModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const { consultants, deleteConsultant, agencies, users } = useStore();
  const { currentUser } = useAuth();

  // Récupérer l'utilisateur courant et son agence
  const currentUserInfo = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.email === currentUser.email);
  }, [currentUser, users]);

  const userAgency = useMemo(() => {
    if (!currentUserInfo) return null;
    return agencies.find(a => a.id === currentUserInfo?.agencyId);
  }, [currentUserInfo, agencies]);

  const userAgencyCode = userAgency?.code || '';

  // Filtrer les consultants par agence de l'utilisateur connecté
  const agencyConsultants = useMemo(() => {
    if (!userAgencyCode) return consultants;
    return consultants.filter(c => c.agencyCode === userAgencyCode);
  }, [consultants, userAgencyCode]);

  const filteredConsultants = useMemo(() => {
    return agencyConsultants
      .filter(consultant => 
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const nameA = `${a.surname} ${a.name}`.toLowerCase();
        const nameB = `${b.surname} ${b.name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [agencyConsultants, searchTerm]);

  const getAgencyName = (agencyCode?: string) => {
    if (!agencyCode) return '-';
    const agency = agencies.find(a => a.code === agencyCode);
    return agency ? agency.name : agencyCode;
  };

  const handleEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingConsultant(null);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00a19a]" />
            <span>Gestion des Candidats</span>
            {userAgency && (
              <span className="text-sm font-normal text-[#00a19a] ml-2">
                ({userAgency.name})
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setEditingConsultant(null);
              setShowAddForm(true);
            }}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau Candidat
          </button>
        </div>
      }
    >
      {showAddForm ? (
        <div className="space-y-4">
          <ConsultantForm 
            consultant={editingConsultant}
            onSuccess={handleFormSuccess}
          />
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingConsultant(null);
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
              placeholder="Rechercher un candidat..."
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
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Qualif
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
                {filteredConsultants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#6b7280]">
                      {searchTerm ? 'Aucun résultat trouvé' : `Aucun candidat enregistré pour ${userAgency?.name || 'votre agence'}`}
                    </td>
                  </tr>
                ) : (
                  filteredConsultants.map((consultant) => (
                    <tr key={consultant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#3c3c3c]">
                          {consultant.surname} {consultant.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        {consultant.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-[#00a19a]" />
                          {getAgencyName(consultant.agencyCode)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(consultant)}
                          className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors"
                        >
                          <Pencil className="w-4 h-4 inline-block" />
                        </button>
                        <button 
                          onClick={() => deleteConsultant(consultant.id)}
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