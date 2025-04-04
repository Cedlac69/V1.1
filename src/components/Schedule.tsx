import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { Badge, Maximize2, Minimize2, Users, CheckCircle2, Building2, XCircle, Search } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Modal } from './Modal';
import type { ClientOrder } from '../types';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';

export function Schedule() {
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { clientOrders, consultants, assignConsultant, updateOrderStatus, roles, updateConsultantAvailability, agencies, users } = useStore();
  const { currentUser } = useAuth();

  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [pendingCancellation, setPendingCancellation] = useState<{
    orderId: string;
    status: 'cancelled_client' | 'cancelled_consultant';
  } | null>(null);

  const currentUserInfo = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.email === currentUser.email);
  }, [currentUser, users]);

  const userAgency = useMemo(() => {
    if (!currentUserInfo) return null;
    return agencies.find(a => a.id === currentUserInfo.agencyId);
  }, [currentUserInfo, agencies]);

  const userAgencyCode = userAgency?.code || '';

  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string>(userAgencyCode || 'all');

  const sortedAgencies = useMemo(() => {
    return [...agencies].sort((a, b) => a.name.localeCompare(b.name));
  }, [agencies]);

  const filteredOrders = useMemo(() => {
    let orders = useStore.getState().getFilteredData(clientOrders, currentUserInfo?.role || 'user', userAgencyCode);
    
    if ((currentUserInfo?.role === 'manager' || currentUserInfo?.role === 'admin') && selectedAgencyFilter !== 'all') {
      orders = orders.filter(order => order.agencyCode === selectedAgencyFilter);
    }
    
    return orders;
  }, [clientOrders, currentUserInfo?.role, userAgencyCode, selectedAgencyFilter]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [filteredOrders]);

  const availableCandidates = useMemo(() => {
    if (!selectedOrderId) return [];
    
    const order = clientOrders.find(o => o.id === selectedOrderId);
    if (!order) return [];

    return consultants
      .filter(consultant => {
        if (currentUserInfo?.role === 'manager' || currentUserInfo?.role === 'admin') {
          return consultant.role === order.qualification;
        }
        
        if (userAgencyCode && consultant.agencyCode !== userAgencyCode) {
          return false;
        }
        
        if (consultant.role !== order.qualification) {
          return false;
        }

        if (order.status === 'completed' && order.assignedConsultantId) {
          return consultant.id === order.assignedConsultantId;
        }

        const dateStr = format(new Date(order.startDate), 'yyyy-MM-dd');
        const availability = consultant.availability[dateStr];
        
        return !availability || availability === 'free';
      })
      .sort((a, b) => {
        if (order.status === 'completed' && order.assignedConsultantId) {
          if (a.id === order.assignedConsultantId) return -1;
          if (b.id === order.assignedConsultantId) return 1;
        }
        const nameA = `${a.surname} ${a.name}`.toLowerCase();
        const nameB = `${b.surname} ${b.name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [selectedOrderId, clientOrders, consultants, userAgencyCode, currentUserInfo?.role]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#ffd900] text-[#3c3c3c]';
      case 'cancelled_client':
        return 'bg-[#ff4b4b] text-white';
      case 'cancelled_consultant':
        return 'bg-[#ff4b4b] text-white';
      case 'completed':
        return 'bg-[#58cc02] text-white';
      default:
        return 'bg-gray-100 text-[#3c3c3c]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En Attente';
      case 'cancelled_client':
        return 'Annulée client';
      case 'cancelled_consultant':
        return 'Annulée candidat';
      case 'completed':
        return 'Servie';
      default:
        return status;
    }
  };

  const getAcronym = (qualification: string) => {
    const role = roles.find(r => r.qualification === qualification);
    return role ? role.acronym : '';
  };

  const getAvailableConsultants = (order: ClientOrder) => {
    return consultants.filter(consultant => {
      if (consultant.role !== order.qualification) {
        return false;
      }

      const dateStr = format(new Date(order.startDate), 'yyyy-MM-dd');
      const availability = consultant.availability[dateStr];
      
      return availability === 'free' || availability === undefined;
    });
  };

  const getAssignedConsultantName = (consultantId: string | undefined) => {
    if (!consultantId) return '';
    const consultant = consultants.find(c => c.id === consultantId);
    return consultant ? `${consultant.name} ${consultant.surname}` : '';
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#58cc02', '#1cb0f6', '#00a19a', '#005d92']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed') => {
    if (newStatus === 'cancelled_client' || newStatus === 'cancelled_consultant') {
      setPendingCancellation({ orderId, status: newStatus });
      setShowCancellationModal(true);
      return;
    }

    const order = clientOrders.find(o => o.id === orderId);
    if (!order) return;

    const dateStr = format(new Date(order.startDate), 'yyyy-MM-dd');

    if (order.status === 'completed' && order.assignedConsultantId && newStatus !== 'completed') {
      await updateConsultantAvailability(order.assignedConsultantId, dateStr, 'free');
    }
    else if (newStatus === 'completed' && order.assignedConsultantId) {
      await updateConsultantAvailability(order.assignedConsultantId, dateStr, 'en_poste');
      triggerConfetti();
    }

    await updateOrderStatus(orderId, newStatus);
  };

  const handleCancellationSubmit = async () => {
    if (!pendingCancellation || !cancellationReason.trim()) return;

    const { orderId, status } = pendingCancellation;
    const order = clientOrders.find(o => o.id === orderId);
    if (!order) return;

    const dateStr = format(new Date(order.startDate), 'yyyy-MM-dd');

    if (order.status === 'completed' && order.assignedConsultantId) {
      await updateConsultantAvailability(order.assignedConsultantId, dateStr, 'free');
    }

    await useStore.getState().updateClientOrder(orderId, {
      status,
      cancellationReason: cancellationReason.trim()
    });

    setShowCancellationModal(false);
    setPendingCancellation(null);
    setCancellationReason('');
  };

  const handleRowClick = (order: ClientOrder) => {
    if (selectedOrderId === order.id) {
      setSelectedOrderId(null);
    } else {
      setSelectedOrderId(order.id);
    }
  };

  const handleOpenDetails = (order: ClientOrder) => {
    setSelectedOrder(order);
  };

  const handleAssignConsultant = async (orderId: string, consultantId: string) => {
    await assignConsultant(orderId, consultantId);
    await handleStatusChange(orderId, 'completed');
  };

  const selectedOrderDetails = useMemo(() => {
    if (!selectedOrderId) return null;
    return clientOrders.find(o => o.id === selectedOrderId);
  }, [selectedOrderId, clientOrders]);

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#3c3c3c] flex items-center gap-2">
              <Badge className="w-6 h-6 text-[#1cb0f6]" />
              Planning des Missions
              {userAgency && currentUserInfo?.role !== 'manager' && (
                <span className="text-sm font-normal text-[#00a19a] ml-2">
                  ({userAgency.name})
                </span>
              )}
            </h2>
            {(currentUserInfo?.role === 'manager' || currentUserInfo?.role === 'admin') && (
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00a19a]" />
                <select
                  value={selectedAgencyFilter}
                  onChange={(e) => setSelectedAgencyFilter(e.target.value)}
                  className="select-field py-1.5 pl-3 pr-8 text-sm min-w-[200px]"
                >
                  <option value="all">Toutes les agences</option>
                  {sortedAgencies.map((agency) => (
                    <option key={agency.id} value={agency.code}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title={isExpanded ? "Réduire" : "Agrandir"}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-[#3c3c3c]" />
            ) : (
              <Maximize2 className="w-5 h-5 text-[#3c3c3c]" />
            )}
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-[#e5e5e5] table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Mission
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Client
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Qualification
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Date
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Service
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Statut
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Candidat
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider w-[12.5%]">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e5e5e5]">
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-[#6b7280]">
                      Aucune mission trouvée
                      {selectedAgencyFilter !== 'all' && ' pour cette agence'}
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => {
                    const availableConsultants = getAvailableConsultants(order);
                    const isCompleted = order.status === 'completed';
                    const isInterim = order.missionType === 'INT';
                    const isSelected = selectedOrderId === order.id;
                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isInterim ? 'bg-pink-50' : ''} ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                        onClick={() => handleRowClick(order)}
                      >
                        <td className="px-6 py-2 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(order);
                            }}
                            className="p-1 hover:bg-[#1cb0f6] hover:bg-opacity-10 rounded-full transition-colors group"
                            title={`Voir les détails de la mission ${order.missionNumber}`}
                          >
                            <Search className="w-4 h-4 text-[#1cb0f6] group-hover:scale-110 transition-transform" />
                          </button>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          {order.clientName}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <div className="text-sm text-[#3c3c3c]">
                            {getAcronym(order.qualification)}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {format(new Date(order.startDate), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-2">
                          <div className="flex flex-wrap gap-1">
                            {order.requiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#1cb0f6] text-white"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          {isCompleted ? (
                            <div className="text-sm font-medium text-[#3c3c3c] truncate max-w-[160px]">
                              {getAssignedConsultantName(order.assignedConsultantId)}
                            </div>
                          ) : (
                            <select
                              value={order.assignedConsultantId || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleAssignConsultant(order.id, e.target.value);
                              }}
                              className="select-field w-full py-1"
                              disabled={order.status === 'cancelled_client' || order.status === 'cancelled_consultant'}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Sélectionner...</option>
                              {availableConsultants.map((consultant) => (
                                <option key={consultant.id} value={consultant.id}>
                                  {consultant.name} {consultant.surname}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                order.id,
                                e.target.value as 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed'
                              );
                            }}
                            className="select-field py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pending">En Attente</option>
                            <option value="cancelled_client">Annulée client</option>
                            <option value="cancelled_consultant">Annulée candidat</option>
                            <option value="completed">Servie</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrderDetails && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#3c3c3c] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1cb0f6]" />
              {selectedOrderDetails.status === 'completed' ? (
                <>
                  Candidat Assigné
                  <CheckCircle2 className="w-5 h-5 text-[#58cc02]" />
                </>
              ) : (
                'Candidats Disponibles'
              )}
              <span className="text-sm font-normal text-[#00a19a]">
                Mission {selectedOrderDetails.missionNumber} - {selectedOrderDetails.clientName}
              </span>
            </h2>
            <div className="text-sm text-[#6b7280]">
              {availableCandidates.length} candidat{availableCandidates.length > 1 ? 's' : ''} disponible{availableCandidates.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e5e5e5]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    Lieux Préférés
                  </th>
                  <th className="px-6 py-2 text-right text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                    {selectedOrderDetails.status !== 'completed' && 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e5e5e5]">
                {availableCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-[#6b7280]">
                      {selectedOrderDetails.status === 'completed' 
                        ? 'Aucun candidat assigné à cette mission'
                        : 'Aucun candidat disponible pour cette mission'
                      }
                    </td>
                  </tr>
                ) : (
                  availableCandidates.map((candidate) => (
                    <tr key={candidate.id} className={`hover:bg-gray-50 ${
                      selectedOrderDetails.status === 'completed' && candidate.id === selectedOrderDetails.assignedConsultantId
                        ? 'bg-[#58cc02] bg-opacity-10'
                        : ''
                    }`}>
                      <td className="px-6 py-2">
                        <div className="text-sm font-bold text-[#3c3c3c]">
                          {candidate.name} {candidate.surname}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-sm text-[#3c3c3c]">
                        {candidate.role}
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-wrap gap-1">
                          {candidate.preferredLocations.map((location) => (
                            <span
                              key={location}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#00a19a] bg-opacity-10 text-[#00a19a]"
                            >
                              {location}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-right">
                        {selectedOrderDetails.status !== 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignConsultant(selectedOrderDetails.id, candidate.id);
                            }}
                            className="bg-[#00a19a] hover:bg-[#008b85] text-white font-medium py-1 px-3 rounded-lg
                                     border border-[#008b85] hover:border-[#007571] transition-all duration-200 
                                     shadow-sm text-sm"
                          >
                            Assigner
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

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={selectedOrder !== null}
        onClose={() => {
          setSelectedOrder(null);
          setSelectedOrderId(null);
        }}
      />

      <Modal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          setPendingCancellation(null);
          setCancellationReason('');
        }}
        title={
          <div className="flex items-center gap-2">
            <XCircle className="w-6 h-6 text-[#ff4b4b]" />
            <span>Motif d'annulation</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="cancellationReason" className="block text-sm font-bold text-[#3c3c3c] mb-2">
              Motif
            </label>
            <textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Saisissez le motif d'annulation..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCancellationModal(false);
                setPendingCancellation(null);
                setCancellationReason('');
              }}
              className="btn-secondary bg-gray-500 hover:bg-gray-600 border-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={handleCancellationSubmit}
              className="btn-primary"
              disabled={!cancellationReason.trim()}
            >
              Confirmer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}