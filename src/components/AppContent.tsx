import React, { useState } from 'react';
import { ConsultantForm } from './ConsultantForm';
import { ClientOrderForm } from './ClientOrderForm';
import { Schedule } from './Schedule';
import { RoleManagementModal } from './RoleManagementModal';
import { ClientListModal } from './ClientListModal';
import { CandidateListModal } from './CandidateListModal';
import { AgencyManagementModal } from './AgencyManagementModal';
import { UserManagementModal } from './UserManagementModal';
import { ConsultantCalendarModal } from './ConsultantCalendarModal';
import { StatisticsModal } from './StatisticsModal';
import { Modal } from './Modal';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Users, 
  Building2, 
  LogOut, 
  ChevronRight,
  BarChart3,
  Calendar,
  Settings,
  UserCog,
  Building,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';

export function AppContent() {
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [showConsultantListModal, setShowConsultantListModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { users, agencies, clientOrders, consultants } = useStore();

  const currentUserInfo = React.useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.email === currentUser.email);
  }, [currentUser, users]);

  const userAgency = React.useMemo(() => {
    if (!currentUserInfo) return null;
    return agencies.find(a => a.id === currentUserInfo.agencyId);
  }, [currentUserInfo, agencies]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Calculate statistics
  const activeMissions = clientOrders.filter(order => order.status === 'pending').length;
  const availableCandidates = consultants.length;
  const totalAgencies = agencies.length;
  const successRate = Math.round((clientOrders.filter(order => order.status === 'completed').length / clientOrders.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col" aria-label="Navigation principale">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#005d92]">TalentSync</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1" aria-label="Menu principal">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-blue-50 text-[#005d92]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            aria-current={({ isActive }) => isActive ? 'page' : undefined}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/missions"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-blue-50 text-[#005d92]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={(e) => {
              e.preventDefault();
              setShowOrderModal(true);
            }}
            aria-label="Gérer les missions"
          >
            <FileSpreadsheet className="w-5 h-5 mr-3" aria-hidden="true" />
            <span>Missions</span>
          </NavLink>

          <NavLink
            to="/candidates"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-blue-50 text-[#005d92]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={(e) => {
              e.preventDefault();
              setShowConsultantListModal(true);
            }}
            aria-label="Gérer les candidats"
          >
            <Users className="w-5 h-5 mr-3" aria-hidden="true" />
            <span>Candidats</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-blue-50 text-[#005d92]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={(e) => {
              e.preventDefault();
              setShowCalendarModal(true);
            }}
            aria-label="Voir le planning"
          >
            <Calendar className="w-5 h-5 mr-3" aria-hidden="true" />
            <span>Planning</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUserInfo?.firstName} {currentUserInfo?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userAgency?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 flex-shrink-0 bg-white p-1 rounded-full hover:bg-gray-100"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-5 h-5 text-gray-500" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" role="main">
        <div className="py-8 px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <nav aria-label="Fil d'Ariane" className="flex items-center text-sm text-gray-500">
                <span>Home</span>
                <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
                <span aria-current="page">Dashboard</span>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOrderModal(true)}
                className="bg-[#00a19a] hover:bg-[#008b85] text-white px-4 py-2 rounded-lg
                       flex items-center gap-2 transition-colors"
                aria-label="Créer une nouvelle mission"
              >
                <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                <span>Nouvelle Mission</span>
              </button>

              {/* Settings Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-1"
                  aria-expanded={showSettingsMenu}
                  aria-haspopup="true"
                  aria-label="Menu des paramètres"
                >
                  <Settings className="w-5 h-5 text-[#3c3c3c]" aria-hidden="true" />
                  <ChevronDown className="w-4 h-4 text-[#3c3c3c]" aria-hidden="true" />
                </button>

                {showSettingsMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="settings-menu"
                  >
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowUserModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      role="menuitem"
                    >
                      <UserCog className="w-4 h-4 text-[#1cb0f6]" aria-hidden="true" />
                      <span>Gestion des Utilisateurs</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowRoleModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      role="menuitem"
                    >
                      <Briefcase className="w-4 h-4 text-[#00a19a]" aria-hidden="true" />
                      <span>Gestion des Qualifs</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowClientModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      role="menuitem"
                    >
                      <Building className="w-4 h-4 text-[#005d92]" aria-hidden="true" />
                      <span>Gestion des Clients</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowAgencyModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      role="menuitem"
                    >
                      <Building2 className="w-4 h-4 text-[#00a19a]" aria-hidden="true" />
                      <span>Gestion des Agences</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <section aria-label="Statistiques" className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-[#005d92]" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">{activeMissions}</h3>
              <p className="text-sm text-gray-500">Missions Actives</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-[#005d92]" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">{availableCandidates}</h3>
              <p className="text-sm text-gray-500">Candidats Disponibles</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-[#005d92]" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">{totalAgencies}</h3>
              <p className="text-sm text-gray-500">Total Agences</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-[#005d92]" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">{successRate}%</h3>
              <p className="text-sm text-gray-500">Taux de Réussite</p>
            </div>
          </section>

          {/* Recent Missions */}
          <section aria-label="Missions récentes" className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Missions Récentes</h3>
            <Schedule />
          </section>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showConsultantModal}
        onClose={() => setShowConsultantModal(false)}
        title="Ajouter un Candidat"
      >
        <ConsultantForm onSuccess={() => setShowConsultantModal(false)} />
      </Modal>

      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Ajouter une Mission"
      >
        <ClientOrderForm onSuccess={() => setShowOrderModal(false)} />
      </Modal>

      <RoleManagementModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />

      <ClientListModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
      />

      <CandidateListModal
        isOpen={showConsultantListModal}
        onClose={() => setShowConsultantListModal(false)}
      />

      <AgencyManagementModal
        isOpen={showAgencyModal}
        onClose={() => setShowAgencyModal(false)}
      />

      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />

      <ConsultantCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      <StatisticsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  );
}