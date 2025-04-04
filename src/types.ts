import { Timestamp } from 'firebase/firestore';

export interface Consultant {
  id: string;
  name: string;
  surname: string;
  role: string;
  skills: string[];
  certifications: string[];
  availability: {
    [key: string]: 'free' | 'busy' | 'tentative' | 'en_poste';
  };
  hourlyRate: number;
  preferredLocations: string[];
  agencyCode?: string;
}

export interface Role {
  id: string;
  qualification: string;
  acronym: string;
}

export interface Agency {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  agencyId: string;
  role: 'admin' | 'manager' | 'user';
  active: boolean;
  lastLogin?: string;
  uid?: string;
  createdAt?: Timestamp;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
}

export interface ClientOrder {
  id: string;
  missionNumber: string;
  missionType: 'PLA' | 'INT' | 'VAC';
  clientName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  status: 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed';
  assignedConsultantId?: string;
  contractReason: string;
  cancellationReason: string;
  comments: string;
  isTemporary: boolean;
  qualification: string;
  createdBy?: string;
  agencyCode?: string;
  createdAt?: Timestamp;
}

export interface ConsultingStore {
  consultants: Consultant[];
  clientOrders: ClientOrder[];
  roles: Role[];
  clients: Client[];
  agencies: Agency[];
  users: User[];
  currentMissionNumbers: Record<string, number>;
  getFilteredData: <T extends { agencyCode?: string }>(
    data: T[],
    userRole: User['role'],
    userAgencyCode: string
  ) => T[];
  addConsultant: (consultant: Omit<Consultant, 'id'>) => void;
  updateConsultant: (consultantId: string, consultant: Partial<Omit<Consultant, 'id'>>) => void;
  deleteConsultant: (consultantId: string) => void;
  addClientOrder: (order: Omit<ClientOrder, 'id' | 'missionNumber'>) => void;
  assignConsultant: (orderId: string, consultantId: string) => void;
  updateConsultantAvailability: (
    consultantId: string,
    date: string,
    status: 'free' | 'busy' | 'tentative' | 'en_poste'
  ) => void;
  updateOrderStatus: (
    orderId: string,
    status: 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed'
  ) => void;
  updateClientOrder: (orderId: string, order: Partial<Omit<ClientOrder, 'id'>>) => void;
  deleteClientOrder: (orderId: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (roleId: string, role: Partial<Omit<Role, 'id'>>) => void;
  deleteRole: (roleId: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (clientId: string, client: Partial<Omit<Client, 'id'>>) => void;
  deleteClient: (clientId: string) => void;
  addDefaultClients: () => void;
  addAgency: (agency: Omit<Agency, 'id'>) => void;
  updateAgency: (agencyId: string, agency: Partial<Omit<Agency, 'id'>>) => void;
  deleteAgency: (agencyId: string) => void;
  addDefaultAgencies: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, user: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (userId: string) => void;
}