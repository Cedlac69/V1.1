import { create } from 'zustand';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ConsultingStore } from './types';

const DEFAULT_CLIENTS = [
  "ACPPA EHPAD REMY FRANCOIS",
  "ASSOCIATION BASILIADE",
  "ASSOCIATION CRECHES ST BERNARD",
  "ASSOCIATION LA COMPASSION",
  "C. HOSPITALIER DU MONT D'OR",
  "CENTRE MEDICAL BAYERE",
  "CHAMP DE COURSES - DOMUSVI",
  "CLINIQUE LA PROTESTANTE",
  "CLINIQUE CHARCOT MEDICO.CHIR.",
  "CLINIQUE DE LA SAUVEGARDE",
  "CLINIQUE DU PARC LYON",
  "CLINIQUE IRIS ST PRIEST",
  "CLINIQUE LE BALCON LYONNAIS",
  "CLINIQUE TRENEL",
  "CM LE MAS DES CHAMPS",
  "CMCR DES MASSUES",
  "DOMUSVI LES JARDINS MEDICIS",
  "EHPAD - LA CHEZALIERE",
  "EHPAD - LE RANZAY",
  "EHPAD LES LANDIERS",
  "EHPAD VILANOVA",
  "FAM ETANG CARRET",
  "FAM LES TERRASSES DE LENTILLY",
  "FONDATION PARTAGE ET VIE",
  "FONDATION RICHARD",
  "GCS LES PORTES DU SUD",
  "IEAJA LYON",
  "IME L'ESPERELLE",
  "IME LES MAGNOLIAS",
  "LA VILLA D'HESTIA",
  "LES LAM D'HESTIA",
  "MA MAISON CROIX ROUSSE",
  "MAISON D'ACCUEIL LA PROVIDENCE",
  "MAISON DE RETRAITE LE MANOIR",
  "MAISON DES AVEUGLES",
  "MAS FDV GRAND OUEST",
  "MAS VIOLETTE GERMAIN",
  "MEDIPOLE LYON-VILLEURBANNE",
  "ODYNEO TOURRAIS DE CRAPONNE",
  "PETITS FRERES DES PAUVRES",
  "RESIDENCE MUTUALISTE L'ARCHE",
  "SAUVEGARDE 69 FOYER LE REYNARD",
  "SMR PEDIATRIQUE LA MAISONNEE",
  "USLD - EHPAD LES HIBISCUS",
  "IME/IMEP LA BATIE",
  "MAISON DES MOLLIERES",
  "CEM HENRI GORMAND",
  "ACPPA EHPAD LES JASMINS",
  "LA MAISON BLEUE",
  "HOPITAL PRIVE EST LYONNAIS",
  "LAM LA BASILIADE"
];

const DEFAULT_AGENCIES = [
  { name: "Paris", code: "PAR1", address: "123 Rue de Paris", phone: "01 23 45 67 89", email: "paris@consultflow.fr" },
  { name: "Strasbourg", code: "STR1", address: "456 Avenue de Strasbourg", phone: "03 88 12 34 56", email: "strasbourg@consultflow.fr" },
  { name: "Nantes", code: "NAN1", address: "789 Boulevard de Nantes", phone: "02 40 12 34 56", email: "nantes@consultflow.fr" },
  { name: "Lyon", code: "LYO1", address: "321 Rue de Lyon", phone: "04 72 12 34 56", email: "lyon@consultflow.fr" },
  { name: "Caen", code: "CAE1", address: "654 Avenue de Caen", phone: "02 31 12 34 56", email: "caen@consultflow.fr" }
];

export const useStore = create<ConsultingStore>((set, get) => {
  const initializeMissionNumbers = async () => {
    const ordersCollection = collection(db, 'clientOrders');
    const snapshot = await getDocs(ordersCollection);
    
    const numbers: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.missionNumber && data.agencyCode) {
        const agencyCode = data.agencyCode;
        
        const match = data.missionNumber.match(/[0-9]+$/);
        if (match) {
          const currentNumber = parseInt(match[0], 10);
          numbers[agencyCode] = Math.max(
            numbers[agencyCode] || 0, 
            currentNumber
          );
        }
      }
    });

    set({ currentMissionNumbers: numbers });
  };

  initializeMissionNumbers();

  const consultantsQuery = query(collection(db, 'consultants'));
  onSnapshot(consultantsQuery, (snapshot) => {
    const consultants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ consultants });
  });

  const ordersQuery = query(collection(db, 'clientOrders'));
  onSnapshot(ordersQuery, (snapshot) => {
    const clientOrders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ clientOrders });
  });

  const rolesQuery = query(collection(db, 'roles'));
  onSnapshot(rolesQuery, (snapshot) => {
    const roles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ roles });
  });

  const clientsQuery = query(collection(db, 'clients'));
  onSnapshot(clientsQuery, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ clients });
  });

  const agenciesQuery = query(collection(db, 'agencies'));
  onSnapshot(agenciesQuery, (snapshot) => {
    const agencies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ agencies });
  });

  const usersQuery = query(collection(db, 'users'));
  onSnapshot(usersQuery, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    set({ users });
  });

  return {
    consultants: [],
    clientOrders: [],
    roles: [],
    clients: [],
    agencies: [],
    users: [],
    currentMissionNumbers: {},

    getFilteredData: (data, userRole, userAgencyCode) => {
      // Les managers et admins voient toutes les données
      if (userRole === 'admin' || userRole === 'manager') {
        return data;
      }
      // Les utilisateurs ne voient que les données de leur agence
      return data.filter(item => item.agencyCode === userAgencyCode);
    },
    
    addConsultant: async (consultant) => {
      await addDoc(collection(db, 'consultants'), consultant);
    },

    updateConsultant: async (consultantId, consultant) => {
      const consultantRef = doc(db, 'consultants', consultantId);
      await updateDoc(consultantRef, consultant);
    },

    deleteConsultant: async (consultantId) => {
      const consultantRef = doc(db, 'consultants', consultantId);
      await deleteDoc(consultantRef);
    },
    
    addClientOrder: async (order) => {
      const { currentMissionNumbers } = get();
      const agencyCode = order.agencyCode || 'UNKN';
      
      const nextNumber = (currentMissionNumbers[agencyCode] || 0) + 1;
      const formattedNumber = `${agencyCode}${String(nextNumber).padStart(4, '0')}`;
      
      await addDoc(collection(db, 'clientOrders'), {
        ...order,
        status: 'pending',
        missionNumber: formattedNumber,
        createdAt: serverTimestamp()
      });

      set({
        currentMissionNumbers: {
          ...currentMissionNumbers,
          [agencyCode]: nextNumber
        }
      });
    },
    
    assignConsultant: async (orderId, consultantId) => {
      const orderRef = doc(db, 'clientOrders', orderId);
      await updateDoc(orderRef, {
        assignedConsultantId: consultantId,
        status: 'pending'
      });
    },
    
    updateConsultantAvailability: async (consultantId, date, status) => {
      const consultantRef = doc(db, 'consultants', consultantId);
      await updateDoc(consultantRef, {
        [`availability.${date}`]: status
      });
    },
    
    updateOrderStatus: async (orderId, status) => {
      const orderRef = doc(db, 'clientOrders', orderId);
      await updateDoc(orderRef, { status });
    },

    updateClientOrder: async (orderId, order) => {
      const orderRef = doc(db, 'clientOrders', orderId);
      try {
        const updateData: Record<string, any> = {};
        
        Object.entries(order).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[key] = value;
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          await updateDoc(orderRef, updateData);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la mission:", error);
        throw error;
      }
    },

    deleteClientOrder: async (orderId) => {
      const orderRef = doc(db, 'clientOrders', orderId);
      await deleteDoc(orderRef);
    },

    addRole: async (role) => {
      await addDoc(collection(db, 'roles'), role);
    },

    updateRole: async (roleId, role) => {
      const roleRef = doc(db, 'roles', roleId);
      await updateDoc(roleRef, role);
    },

    deleteRole: async (roleId) => {
      const roleRef = doc(db, 'roles', roleId);
      await deleteDoc(roleRef);
    },

    addClient: async (client) => {
      await addDoc(collection(db, 'clients'), client);
    },

    updateClient: async (clientId, client) => {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, client);
    },

    deleteClient: async (clientId) => {
      const clientRef = doc(db, 'clients', clientId);
      await deleteDoc(clientRef);
    },

    addDefaultClients: async () => {
      for (const clientName of DEFAULT_CLIENTS) {
        await addDoc(collection(db, 'clients'), {
          name: clientName,
          address: '',
          postalCode: '',
          city: ''
        });
      }
    },

    addAgency: async (agency) => {
      await addDoc(collection(db, 'agencies'), agency);
    },

    updateAgency: async (agencyId, agency) => {
      const agencyRef = doc(db, 'agencies', agencyId);
      await updateDoc(agencyRef, agency);
    },

    deleteAgency: async (agencyId) => {
      const agencyRef = doc(db, 'agencies', agencyId);
      await deleteDoc(agencyRef);
    },

    addDefaultAgencies: async () => {
      for (const agency of DEFAULT_AGENCIES) {
        await addDoc(collection(db, 'agencies'), agency);
      }
    },

    addUser: async (user) => {
      await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: serverTimestamp()
      });
    },

    updateUser: async (userId, user) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, user);
    },

    deleteUser: async (userId) => {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    }
  };
});