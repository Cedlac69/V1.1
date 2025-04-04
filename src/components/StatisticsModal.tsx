import React, { useMemo } from 'react';
import { Modal } from './Modal';
import { useStore } from '../store';
import { BarChart3, Users2, Building2, FileSpreadsheet, CheckCircle2, XCircle as XCircle2, Clock, Briefcase } from 'lucide-react';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatisticsModal({ isOpen, onClose }: StatisticsModalProps) {
  const { clientOrders, consultants, clients, agencies } = useStore();

  const stats = useMemo(() => {
    const totalMissions = clientOrders.length;
    const completedMissions = clientOrders.filter(o => o.status === 'completed').length;
    const cancelledMissions = clientOrders.filter(
      o => o.status === 'cancelled_client' || o.status === 'cancelled_consultant'
    ).length;
    const pendingMissions = clientOrders.filter(o => o.status === 'pending').length;

    const missionsByType = clientOrders.reduce((acc, order) => {
      acc[order.missionType] = (acc[order.missionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const missionsByAgency = clientOrders.reduce((acc, order) => {
      const agencyCode = order.agencyCode || 'Non affecté';
      acc[agencyCode] = (acc[agencyCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const successRate = totalMissions > 0 
      ? ((completedMissions / totalMissions) * 100).toFixed(1)
      : '0';

    return {
      totalMissions,
      completedMissions,
      cancelledMissions,
      pendingMissions,
      missionsByType,
      missionsByAgency,
      successRate,
      totalConsultants: consultants.length,
      totalClients: clients.length,
      totalAgencies: agencies.length
    };
  }, [clientOrders, consultants, clients, agencies]);

  const getMissionTypeLabel = (type: string) => {
    switch (type) {
      case 'PLA': return 'Placement';
      case 'INT': return 'Intérim';
      case 'VAC': return 'Vacation';
      default: return type;
    }
  };

  const getAgencyName = (code: string) => {
    const agency = agencies.find(a => a.code === code);
    return agency ? agency.name : code;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#00a19a]" />
          <span>Statistiques</span>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1cb0f6] to-[#0095e2] p-6 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-white">Missions</h3>
            </div>
            <div className="text-3xl font-bold">{stats.totalMissions}</div>
            <div className="text-sm opacity-80">Total des missions</div>
          </div>

          <div className="bg-gradient-to-br from-[#00a19a] to-[#008b85] p-6 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <Users2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-white">Candidats</h3>
            </div>
            <div className="text-3xl font-bold">{stats.totalConsultants}</div>
            <div className="text-sm opacity-80">Candidats actifs</div>
          </div>

          <div className="bg-gradient-to-br from-[#005d92] to-[#004b76] p-6 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-white">Clients</h3>
            </div>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
            <div className="text-sm opacity-80">Clients enregistrés</div>
          </div>

          <div className="bg-gradient-to-br from-[#58cc02] to-[#46a302] p-6 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-white">Succès</h3>
            </div>
            <div className="text-3xl font-bold">{stats.successRate}%</div>
            <div className="text-sm opacity-80">Taux de réussite</div>
          </div>
        </div>

        {/* Statut des missions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#3c3c3c] mb-4">État des Missions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-[#58cc02] bg-opacity-10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-[#58cc02]" />
              <div>
                <div className="text-2xl font-bold text-[#58cc02]">{stats.completedMissions}</div>
                <div className="text-sm text-[#3c3c3c]">Missions servies</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#ffd900] bg-opacity-10 rounded-lg">
              <Clock className="w-5 h-5 text-[#f08c00]" />
              <div>
                <div className="text-2xl font-bold text-[#f08c00]">{stats.pendingMissions}</div>
                <div className="text-sm text-[#3c3c3c]">En attente</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#ff4b4b] bg-opacity-10 rounded-lg">
              <XCircle2 className="w-5 h-5 text-[#ff4b4b]" />
              <div>
                <div className="text-2xl font-bold text-[#ff4b4b]">{stats.cancelledMissions}</div>
                <div className="text-sm text-[#3c3c3c]">Annulées</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Types de missions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-[#3c3c3c] mb-4">Types de Missions</h3>
            <div className="space-y-3">
              {Object.entries(stats.missionsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#1cb0f6]" />
                    <span className="text-sm text-[#3c3c3c]">{getMissionTypeLabel(type)}</span>
                  </div>
                  <span className="font-semibold text-[#3c3c3c]">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missions par agence */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-[#3c3c3c] mb-4">Missions par Agence</h3>
            <div className="space-y-3">
              {Object.entries(stats.missionsByAgency).map(([code, count]) => (
                <div key={code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00a19a]" />
                    <span className="text-sm text-[#3c3c3c]">{getAgencyName(code)}</span>
                  </div>
                  <span className="font-semibold text-[#3c3c3c]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}