import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight, Search, FileSpreadsheet, Building2, ArrowLeft } from 'lucide-react';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import type { Consultant } from '../types';
import * as XLSX from 'xlsx-js-style';
import { useNavigate } from 'react-router-dom';

export function ConsultantCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const { consultants, updateConsultantAvailability, clientOrders, agencies, users } = useStore();
  const { currentUser } = useAuth();
  const todayCellRef = useRef<HTMLTableCellElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
      .filter(consultant => {
        const fullName = `${consultant.name} ${consultant.surname}`.toLowerCase();
        const role = consultant.role.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || role.includes(search);
      })
      .sort((a, b) => {
        const agencyA = a.agencyCode || '';
        const agencyB = b.agencyCode || '';
        
        if (agencyA !== agencyB) {
          return agencyA.localeCompare(agencyB);
        }
        
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

  const consultantsByAgency = useMemo(() => {
    const grouped: Record<string, Consultant[]> = {};
    
    filteredConsultants.forEach(consultant => {
      const agencyCode = consultant.agencyCode || 'Autre';
      if (!grouped[agencyCode]) {
        grouped[agencyCode] = [];
      }
      grouped[agencyCode].push(consultant);
    });
    
    return grouped;
  }, [filteredConsultants]);

  useEffect(() => {
    if (todayCellRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const cell = todayCellRef.current;
      const today = new Date();

      if (today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
        const containerWidth = container.clientWidth;
        const cellRect = cell.getBoundingClientRect();
        const scrollPosition = cell.offsetLeft - (containerWidth / 2) + (cellRect.width / 2);

        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentDate]);

  const previousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getAvailabilityColor = (status: 'free' | 'busy' | 'tentative' | 'en_poste' | undefined) => {
    switch (status) {
      case 'free':
        return 'bg-[#58cc02] hover:bg-[#46a302] text-white';
      case 'busy':
        return 'bg-[#ff4b4b] hover:bg-[#e63e3e] text-white';
      case 'tentative':
        return 'bg-[#ffd900] hover:bg-[#e6c300] text-[#3c3c3c]';
      case 'en_poste':
        return 'bg-[#1cb0f6] hover:bg-[#0095e2] text-white';
      default:
        return 'bg-gray-50 hover:bg-gray-100 text-[#3c3c3c]';
    }
  };

  const getMissionReference = (consultant: Consultant, date: string) => {
    const completedMission = clientOrders.find(order => 
      order.status === 'completed' && 
      order.assignedConsultantId === consultant.id && 
      order.startDate === date
    );
    return completedMission?.missionNumber || '';
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'free':
        return 'Disponible';
      case 'busy':
        return 'Occupé';
      case 'tentative':
        return 'Provisoire';
      case 'en_poste':
        return 'En Poste';
      default:
        return 'Définir';
    }
  };

  const handleAvailabilityClick = (consultant: Consultant, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentStatus = consultant.availability[dateStr];
    let newStatus: 'free' | 'busy' | 'tentative' | 'en_poste';

    switch (currentStatus) {
      case 'free':
        newStatus = 'busy';
        break;
      case 'busy':
        newStatus = 'tentative';
        break;
      case 'tentative':
        newStatus = 'free';
        break;
      case 'en_poste':
        return;
      default:
        newStatus = 'free';
    }

    updateConsultantAvailability(consultant.id, dateStr, newStatus);
  };

  const exportToExcel = () => {
    // ... (code d'export Excel inchangé)
  };

  const today = new Date();
  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  return (
    <section className="card bg-white shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full text-[#3c3c3c]"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-[#3c3c3c] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1cb0f6]" />
            Planning des Candidats
            {userAgency && (
              <span className="text-sm font-normal text-[#00a19a] ml-2">
                ({userAgency.name})
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-[#3c3c3c]" />
            <span className="text-[#3c3c3c]">
              Cliquer pour changer : Disponible → Occupé → Provisoire
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="bg-[#1cb0f6] hover:bg-[#0095e2] text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5 text-[#3c3c3c]" />
            </button>
            <span className="text-lg font-bold text-[#3c3c3c]">
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
      </div>

      <div className="mb-4">
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
      </div>

      <div className="overflow-x-auto" ref={tableContainerRef}>
        <table className="min-w-full divide-y divide-[#e5e5e5]">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-bold text-[#3c3c3c] uppercase tracking-wider">
                Candidat
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day.toISOString()}
                  ref={isToday(day) ? todayCellRef : null}
                  className={`px-2 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                    isSameMonth(day, currentDate) ? 'text-[#3c3c3c]' : 'text-gray-400'
                  } ${isToday(day) ? 'bg-blue-50' : ''}`}
                >
                  <div>{format(day, 'EEE', { locale: fr })}</div>
                  <div>{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e5e5e5]">
            {filteredConsultants.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth.length + 1} className="px-6 py-8 text-center text-[#6b7280]">
                  {searchTerm ? 'Aucun candidat trouvé' : 'Aucun candidat enregistré pour votre agence'}
                </td>
              </tr>
            ) : (
              Object.entries(consultantsByAgency).map(([agencyCode, consultantsInAgency]) => (
                <React.Fragment key={agencyCode}>
                  <tr>
                    <td 
                      colSpan={daysInMonth.length + 1} 
                      className="sticky left-0 px-6 py-2 bg-gray-100 text-[#3c3c3c] font-bold flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-[#00a19a]" />
                      {getAgencyName(agencyCode)}
                    </td>
                  </tr>
                  {consultantsInAgency.map((consultant) => (
                    <tr key={consultant.id}>
                      <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap border-r border-[#e5e5e5]">
                        <div className="text-sm font-bold text-[#3c3c3c]">
                          {consultant.name} {consultant.surname}
                        </div>
                        <div className="text-sm text-[#6b7280]">
                          {consultant.role}
                        </div>
                      </td>
                      {daysInMonth.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const status = consultant.availability[dateStr];
                        const missionRef = status === 'en_poste' ? getMissionReference(consultant, dateStr) : undefined;
                        return (
                          <td
                            key={day.toISOString()}
                            className={`px-1 py-2 text-center ${isToday(day) ? 'bg-blue-50' : ''}`}
                            onClick={() => handleAvailabilityClick(consultant, day)}
                          >
                            <div
                              className={`cursor-pointer text-xs font-medium py-2 px-1 rounded-lg transition-colors ${getAvailabilityColor(
                                status
                              )}`}
                              title={missionRef ? `Mission ${missionRef}` : undefined}
                            >
                              {getStatusLabel(status)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#58cc02]"></span>
          <span className="text-[#3c3c3c]">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff4b4b]"></span>
          <span className="text-[#3c3c3c]">Occupé</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ffd900]"></span>
          <span className="text-[#3c3c3c]">Provisoire</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1cb0f6]"></span>
          <span className="text-[#3c3c3c]">En Poste</span>
        </div>
      </div>
    </section>
  );
}