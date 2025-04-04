import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { useStore } from '../store';
import { Trash2, Edit2, Check, X, Search } from 'lucide-react';
import type { Role } from '../types';
import { MigrateMissionNumbersButton } from './MigrateMissionNumbersButton';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ROLES = [
  { qualification: "ACCOMPAGNANT ÉDUCATIF ET SOCIAL (H/F)", acronym: "AES" },
  { qualification: "AGENT DE SERVICE HOSPITALIER", acronym: "ASH" },
  { qualification: "AGENT DE SERVICE (H/F)", acronym: "AS" },
  { qualification: "AGENT DE SOIN (H/F)", acronym: "ADS" },
  { qualification: "AIDE-SOIGNANT (H/F)", acronym: "AS" },
  { qualification: "AUXILIAIRE DE PUÉRICULTURE (H/F)", acronym: "AP" },
  { qualification: "AUXILIAIRE DE VIE SOCIALE (H/F)", acronym: "AVS" },
  { qualification: "CONSEILLER EN ÉCONOMIE FAMILIALE ET SOCIALE (H/F)", acronym: "CEFS" },
  { qualification: "EDUCATEUR SPÉCIALISÉ (H/F)", acronym: "ES" },
  { qualification: "FF. ACCOMPAGNANT ÉDUCATIF ET SOCIAL (H/F)", acronym: "FF.AES" },
  { qualification: "FF. AIDE-SOIGNANT (H/F)", acronym: "FF.AS" },
  { qualification: "FF. INFIRMIER (H/F)", acronym: "FF.IDE" },
  { qualification: "INFIRMIER (H/F)", acronym: "IDE" },
  { qualification: "KINÉSITHÉRAPEUTE (H/F)", acronym: "KINE" },
  { qualification: "MAÎTRE DE MAISON (H/F)", acronym: "MDM" },
  { qualification: "MONITEUR ADJOINT D'ANIMATION ET/OU D'ACTIVITÉS (H/F)", acronym: "MAA" },
  { qualification: "MONITEUR-ÉDUCATEUR (H/F)", acronym: "ME" },
  { qualification: "SECRÉTAIRE MÉDICALE (H/F)", acronym: "SM" },
  { qualification: "SURVEILLANT DE NUIT QUALIFIÉ (H/F)", acronym: "SNQ" },
  { qualification: "VEILLEUR DE NUIT (H/F)", acronym: "VDN" },
  { qualification: "CAP PETITE ENFANCE", acronym: "CAP PE" },
  { qualification: "EDUCATEUR JEUNE ENFANT", acronym: "EJE" },
  { qualification: "AIDE MEDICO PSYCHOLOGIQUE", acronym: "AMP" }
];

interface EditingRole extends Role {
  editedQualification: string;
  editedAcronym: string;
}

export function RoleManagementModal({ isOpen, onClose }: RoleManagementModalProps) {
  const [qualification, setQualification] = useState('');
  const [acronym, setAcronym] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRoles, setEditingRoles] = useState<Record<string, EditingRole>>({});
  const { roles, addRole, updateRole, deleteRole } = useStore();

  const filteredAndSortedRoles = useMemo(() => {
    return [...roles]
      .filter(role => {
        const search = searchTerm.toLowerCase();
        return (
          role.qualification.toLowerCase().includes(search) ||
          role.acronym.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => a.qualification.localeCompare(b.qualification));
  }, [roles, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRole({ qualification, acronym });
    setQualification('');
    setAcronym('');
  };

  const handleAddDefaultRoles = async () => {
    for (const role of DEFAULT_ROLES) {
      await addRole(role);
    }
  };

  const startEditing = (role: Role) => {
    setEditingRoles({
      ...editingRoles,
      [role.id]: {
        ...role,
        editedQualification: role.qualification,
        editedAcronym: role.acronym,
      },
    });
  };

  const cancelEditing = (roleId: string) => {
    const newEditingRoles = { ...editingRoles };
    delete newEditingRoles[roleId];
    setEditingRoles(newEditingRoles);
  };

  const saveEditing = async (roleId: string) => {
    const editingRole = editingRoles[roleId];
    if (editingRole) {
      await updateRole(roleId, {
        qualification: editingRole.editedQualification,
        acronym: editingRole.editedAcronym,
      });
      cancelEditing(roleId);
    }
  };

  const updateEditingRole = (roleId: string, field: 'editedQualification' | 'editedAcronym', value: string) => {
    setEditingRoles({
      ...editingRoles,
      [roleId]: {
        ...editingRoles[roleId],
        [field]: value,
      },
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          <div className="px-8 py-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#3c3c3c]">Gestion des Qualifs</h2>
              <button
                onClick={onClose}
                className="text-[#afafaf] hover:text-[#3c3c3c] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-bold text-[#3c3c3c] mb-2">
                      Qualif
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="acronym" className="block text-sm font-bold text-[#3c3c3c] mb-2">
                      Acronyme
                    </label>
                    <input
                      type="text"
                      id="acronym"
                      value={acronym}
                      onChange={(e) => setAcronym(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Ajouter la Qualif
                  </button>
                </form>

                {roles.length === 0 && (
                  <button
                    onClick={handleAddDefaultRoles}
                    className="btn-secondary w-full mt-4"
                  >
                    Ajouter les Qualifs par Défaut
                  </button>
                )}
                
                {/* Ajout du bouton de migration des numéros de mission */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-bold text-[#3c3c3c] mb-4">Outils d'administration</h3>
                  <MigrateMissionNumbersButton />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher une qualif..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <table className="min-w-full divide-y divide-[#e5e5e5]">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                          Qualif
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                          Acronyme
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#e5e5e5]">
                      {filteredAndSortedRoles.map((role) => {
                        const isEditing = editingRoles[role.id];
                        return (
                          <tr key={role.id}>
                            <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={isEditing.editedQualification}
                                  onChange={(e) => updateEditingRole(role.id, 'editedQualification', e.target.value)}
                                  className="input-field py-1 px-2"
                                />
                              ) : (
                                role.qualification
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#3c3c3c]">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={isEditing.editedAcronym}
                                  onChange={(e) => updateEditingRole(role.id, 'editedAcronym', e.target.value)}
                                  className="input-field py-1 px-2"
                                />
                              ) : (
                                role.acronym
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveEditing(role.id)}
                                    className="text-[#58cc02] hover:text-[#46a302] transition-colors"
                                  >
                                    <Check className="w-5 h-5 inline-block" />
                                  </button>
                                  <button
                                    onClick={() => cancelEditing(role.id)}
                                    className="text-[#ff4b4b] hover:text-[#e63e3e] transition-colors"
                                  >
                                    <X className="w-5 h-5 inline-block" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditing(role)}
                                    className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors"
                                  >
                                    <Edit2 className="w-5 h-5 inline-block" />
                                  </button>
                                  <button
                                    onClick={() => deleteRole(role.id)}
                                    className="text-[#ff4b4b] hover:text-[#e63e3e] transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5 inline-block" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}