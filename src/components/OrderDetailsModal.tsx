import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Edit2, Copy, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import type { ClientOrder, Consultant } from '../types';

interface OrderDetailsModalProps {
  order: ClientOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const { consultants, updateClientOrder, addClientOrder, deleteClientOrder, users, agencies, roles } = useStore();
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(order ? new Date(order.startDate) : new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Partial<ClientOrder>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [displayCandidates, setDisplayCandidates] = useState<Consultant[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = useMemo(() => 
    eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  );

  // Récupérer l'utilisateur et son agence
  const currentUserInfo = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.email === currentUser.email);
  }, [currentUser, users]);

  const userAgency = useMemo(() => {
    if (!currentUserInfo) return null;
    return agencies.find(a => a.id === currentUserInfo.agencyId);
  }, [currentUserInfo, agencies]);

  // Obtenir la liste triée des qualifications
  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.qualification.localeCompare(b.qualification));
  }, [roles]);

  // Fonction pour calculer les consultants correspondants
  const computeMatchingConsultants = (orderToMatch: ClientOrder | Partial<ClientOrder>) => {
    if (!orderToMatch.qualification || !orderToMatch.startDate) return [];
    
    return consultants
      .filter(consultant => {
        // Vérifier si ce consultant a la même agence que l'utilisateur
        if (userAgency && consultant.agencyCode !== userAgency.code) {
          return false;
        }
        
        // Vérifier la qualification
        if (consultant.role !== orderToMatch.qualification) {
          return false;
        }

        // Vérifier la disponibilité pour la date de la mission
        const dateStr = format(new Date(orderToMatch.startDate), 'yyyy-MM-dd');
        const availability = consultant.availability[dateStr];
        
        // Ne garder que les consultants disponibles ou sans statut
        if (availability && availability !== 'free') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const nameA = `${a.surname} ${a.name}`.toLowerCase();
        const nameB = `${b.surname} ${b.name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  };

  // Initialiser les candidats affichés lorsque l'ordre change
  useEffect(() => {
    if (order) {
      setDisplayCandidates(computeMatchingConsultants(order));
    }
  }, [order, consultants, userAgency]);

  // Réinitialiser les données éditées lorsque l'ordre change
  useEffect(() => {
    if (order && (isEditing || isDuplicating)) {
      setEditedOrder({
        clientName: order.clientName,
        projectName: order.projectName,
        startDate: order.startDate,
        endDate: order.endDate,
        requiredSkills: order.requiredSkills,
        requiredCertifications: order.requiredCertifications,
        status: order.status,
        contractReason: order.contractReason,
        cancellationReason: order.cancellationReason,
        comments: order.comments,
        isTemporary: order.isTemporary,
        qualification: order.qualification,
        missionType: order.missionType,
        assignedConsultantId: order.assignedConsultantId,
        agencyCode: order.agencyCode,
        missionNumber: order.missionNumber
      });
    }
  }, [order, isEditing, isDuplicating]);

  const previousMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));

  const getAvailabilityColor = (status: 'free' | 'busy' | 'tentative' | undefined) => {
    switch (status) {
      case 'free':
        return 'bg-[#58cc02] text-white';
      case 'busy':
        return 'bg-[#ff4b4b] text-white';
      case 'tentative':
        return 'bg-[#ffd900] text-[#3c3c3c]';
      default:
        return 'bg-gray-50 text-[#3c3c3c]';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'free':
        return 'Disponible';
      case 'busy':
        return 'Occupé';
      case 'tentative':
        return 'Provisoire';
      default:
        return '-';
    }
  };

  const getMissionTypeLabel = (type: 'PLA' | 'INT' | 'VAC') => {
    switch (type) {
      case 'PLA':
        return 'Placement';
      case 'INT':
        return 'Intérim';
      case 'VAC':
        return 'Vacation';
      default:
        return type;
    }
  };

  const handleSave = async () => {
    if (!order) return;
    
    if (isDuplicating) {
      // Créer une nouvelle mission avec les données modifiées
      const agencyCode = userAgency?.code || 'UNKN';
      const newOrder = {
        clientName: editedOrder.clientName || order.clientName,
        projectName: editedOrder.projectName || order.projectName,
        startDate: editedOrder.startDate || format(new Date(), 'yyyy-MM-dd'),
        endDate: editedOrder.endDate || format(new Date(), 'yyyy-MM-dd'),
        requiredSkills: editedOrder.requiredSkills || order.requiredSkills,
        requiredCertifications: editedOrder.requiredCertifications || order.requiredCertifications,
        status: 'pending',
        contractReason: editedOrder.contractReason || order.contractReason,
        cancellationReason: '',
        comments: editedOrder.comments || order.comments,
        isTemporary: editedOrder.isTemporary ?? order.isTemporary,
        qualification: editedOrder.qualification || order.qualification,
        missionType: editedOrder.missionType || order.missionType,
        createdBy: currentUser?.email || '',
        agencyCode: agencyCode
      };

      await addClientOrder(newOrder);
      onClose();
    } else {
      // Mettre à jour la mission existante avec toutes les valeurs modifiées
      try {
        // Nous devons nous assurer de passer toutes les valeurs qui ont été modifiées
        await updateClientOrder(order.id, {
          clientName: editedOrder.clientName,
          projectName: editedOrder.projectName,
          startDate: editedOrder.startDate,
          endDate: editedOrder.endDate,
          requiredSkills: editedOrder.requiredSkills,
          requiredCertifications: editedOrder.requiredCertifications,
          status: editedOrder.status,
          contractReason: editedOrder.contractReason,
          cancellationReason: editedOrder.cancellationReason,
          comments: editedOrder.comments,
          isTemporary: editedOrder.isTemporary,
          qualification: editedOrder.qualification,
          missionType: editedOrder.missionType,
          assignedConsultantId: editedOrder.assignedConsultantId
        });
        
        // Mettre à jour la liste des candidats après l'enregistrement
        const updatedOrder = {
          ...order,
          ...editedOrder
        };
        setDisplayCandidates(computeMatchingConsultants(updatedOrder));
        
        // Fermer le mode édition après mise à jour
        setIsEditing(false);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la mission:", error);
        // Gérer l'erreur (par exemple, afficher un message d'erreur)
      }
    }
    
    setIsDuplicating(false);
    setEditedOrder({});
  };

  const handleDuplicate = () => {
    if (!order) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    setEditedOrder({
      clientName: order.clientName,
      projectName: order.projectName,
      startDate: today,
      endDate: today,
      requiredSkills: order.requiredSkills,
      requiredCertifications: order.requiredCertifications,
      status: 'pending',
      contractReason: order.contractReason,
      cancellationReason: '',
      comments: order.comments,
      isTemporary: order.isTemporary,
      qualification: order.qualification,
      missionType: order.missionType
    });
    setIsDuplicating(true);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!order) return;
    
    if (confirmDelete) {
      await deleteClientOrder(order.id);
      onClose();
    } else {
      setConfirmDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
  };

  if (!order) return null;

  const isPending = order.status === 'pending';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        setIsEditing(false);
        setIsDuplicating(false);
        setConfirmDelete(false);
        setEditedOrder({});
        onClose();
      }} 
      title={
        <div className="flex items-center justify-between w-full">
          <span>Détails de la Mission {isDuplicating ? '(Copie)' : order.missionNumber}</span>
          <div className="flex items-center gap-2">
            {!isEditing && !isDuplicating && (
              <>
                {isPending && (
                  <button
                    onClick={handleDelete}
                    className={`${
                      confirmDelete 
                        ? 'bg-red-500 text-white' 
                        : 'text-[#ff4b4b] hover:text-white hover:bg-red-500'
                    } p-2 rounded-full transition-colors flex items-center gap-1`}
                    title="Supprimer la mission"
                  >
                    <Trash2 className="w-5 h-5" />
                    {confirmDelete && <span>Confirmer</span>}
                  </button>
                )}
                <button
                  onClick={handleDuplicate}
                  className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors flex items-center gap-1"
                >
                  <Copy className="w-5 h-5" />
                  <span>Dupliquer</span>
                </button>
                <button
                  onClick={() => {
                    setEditedOrder({...order});
                    setIsEditing(true);
                  }}
                  className="text-[#1cb0f6] hover:text-[#0095e2] transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Client</h3>
            {isEditing || isDuplicating ? (
              <input
                type="text"
                value={editedOrder.clientName || order.clientName}
                onChange={(e) => setEditedOrder({ ...editedOrder, clientName: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-[#6b7280]">{order.clientName}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Type de Mission</h3>
            {isEditing || isDuplicating ? (
              <select
                value={editedOrder.missionType || order.missionType}
                onChange={(e) => setEditedOrder({ ...editedOrder, missionType: e.target.value as ClientOrder['missionType'] })}
                className="select-field"
              >
                <option value="PLA">Placement</option>
                <option value="INT">Intérim</option>
                <option value="VAC">Vacation</option>
              </select>
            ) : (
              <p className="text-[#6b7280]">{getMissionTypeLabel(order.missionType)}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Qualification</h3>
            {isEditing || isDuplicating ? (
              <select
                value={editedOrder.qualification || order.qualification}
                onChange={(e) => setEditedOrder({ ...editedOrder, qualification: e.target.value })}
                className="select-field"
              >
                <option value="">Sélectionner une qualification...</option>
                {sortedRoles.map((role) => (
                  <option key={role.id} value={role.qualification}>
                    {role.qualification} ({role.acronym})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-[#6b7280]">{order.qualification}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Date</h3>
            {isEditing || isDuplicating ? (
              <input
                type="date"
                value={editedOrder.startDate || order.startDate}
                onChange={(e) => setEditedOrder({ ...editedOrder, startDate: e.target.value, endDate: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-[#6b7280]">
                {format(parseISO(order.startDate), 'dd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Motif du contrat</h3>
            {isEditing || isDuplicating ? (
              <input
                type="text"
                value={editedOrder.contractReason || order.contractReason}
                onChange={(e) => setEditedOrder({ ...editedOrder, contractReason: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-[#6b7280]">{order.contractReason}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Motif d'annulation</h3>
            {isEditing || isDuplicating ? (
              <input
                type="text"
                value={editedOrder.cancellationReason ?? order.cancellationReason}
                onChange={(e) => setEditedOrder({ ...editedOrder, cancellationReason: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-[#6b7280]">{order.cancellationReason || '-'}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Service</h3>
          {isEditing || isDuplicating ? (
            <input
              type="text"
              value={(editedOrder.requiredSkills || order.requiredSkills).join(', ')}
              onChange={(e) => setEditedOrder({ 
                ...editedOrder, 
                requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="input-field"
              placeholder="ex: Gériatrie, Soins intensifs"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {order.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-[#1cb0f6] text-white text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#3c3c3c] mb-2">Commentaires</h3>
          {isEditing || isDuplicating ? (
            <textarea
              value={editedOrder.comments ?? order.comments}
              onChange={(e) => setEditedOrder({ ...editedOrder, comments: e.target.value })}
              className="input-field"
              rows={3}
            />
          ) : (
            <p className="text-[#6b7280]">{order.comments || '-'}</p>
          )}
        </div>

        {(isEditing || isDuplicating) && (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setIsDuplicating(false);
                setEditedOrder({});
              }}
              className="px-4 py-2 text-[#6b7280] hover:text-[#3c3c3c] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              {isDuplicating ? 'Créer la copie' : 'Enregistrer'}
            </button>
          </div>
        )}

        {!isDuplicating && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#3c3c3c]">
                Candidats Disponibles ({displayCandidates.length})
                {isEditing && <span className="text-sm text-[#00a19a] ml-2">(Mise à jour après sauvegarde)</span>}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5 text-[#3c3c3c]" />
                </button>
                <span className="text-[#3c3c3c] font-medium">
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5 text-[#3c3c3c]" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-[#e5e5e5]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-[#3c3c3c]">
                      Candidat
                    </th>
                    {daysInMonth.map((day) => (
                      <th
                        key={day.toISOString()}
                        className={`px-2 py-2 text-center text-xs font-bold ${
                          isSameMonth(day, currentDate) ? 'text-[#3c3c3c]' : 'text-gray-400'
                        }`}
                      >
                        <div>{format(day, 'EEE', { locale: fr })}</div>
                        <div>{format(day, 'd')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e5e5e5]">
                  {displayCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth.length + 1} className="px-6 py-8 text-center text-[#6b7280]">
                        {isEditing ? 
                          'La liste des candidats sera mise à jour après enregistrement' : 
                          'Aucun candidat disponible pour cette mission'}
                      </td>
                    </tr>
                  ) : (
                    displayCandidates.map((consultant) => (
                      <tr key={consultant.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-bold text-[#3c3c3c]">
                            {consultant.name} {consultant.surname}
                          </div>
                          <div className="text-xs text-[#6b7280]">{consultant.role}</div>
                        </td>
                        {daysInMonth.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const status = consultant.availability[dateStr];
                          return (
                            <td key={day.toISOString()} className="px-1 py-1 text-center">
                              <div
                                className={`text-xs py-1 px-1 rounded ${getAvailabilityColor(status)}`}
                              >
                                {getStatusLabel(status)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}