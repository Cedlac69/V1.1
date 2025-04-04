import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import type { ClientOrder } from '../types';

interface ClientOrderFormProps {
  onSuccess?: () => void;
}

export function ClientOrderForm({ onSuccess }: ClientOrderFormProps) {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState('');
  const [qualification, setQualification] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [contractReason, setContractReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [comments, setComments] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [missionType, setMissionType] = useState<ClientOrder['missionType']>('PLA');
  
  const { addClientOrder, clients, roles, users, agencies } = useStore();
  const { currentUser } = useAuth();

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.qualification.localeCompare(b.qualification));
  }, [roles]);

  // Trouve l'utilisateur actuel et son agence
  const currentUserInfo = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.email === currentUser.email);
  }, [currentUser, users]);

  const userAgency = useMemo(() => {
    if (!currentUserInfo) return null;
    return agencies.find(a => a.id === currentUserInfo.agencyId);
  }, [currentUserInfo, agencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // S'assurer qu'on a un code d'agence
    const agencyCode = userAgency?.code || 'UNKN';
    
    await addClientOrder({
      clientName,
      projectName: '',
      startDate: date,
      endDate: date,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      requiredCertifications: [],
      status: 'pending',
      contractReason,
      cancellationReason,
      comments,
      isTemporary,
      qualification,
      missionType,
      createdBy: currentUser?.email || '',
      agencyCode: agencyCode
    });
    
    setClientName('');
    setDate('');
    setQualification('');
    setRequiredSkills('');
    setContractReason('');
    setCancellationReason('');
    setComments('');
    setIsTemporary(false);
    setMissionType('PLA');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Client
          </label>
          <select
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="select-field"
            required
          >
            <option value="">Sélectionner un client...</option>
            {sortedClients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="missionType" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Type de Mission
          </label>
          <select
            id="missionType"
            value={missionType}
            onChange={(e) => setMissionType(e.target.value as ClientOrder['missionType'])}
            className="select-field"
            required
          >
            <option value="PLA">Placement</option>
            <option value="INT">Intérim</option>
            <option value="VAC">Vacation</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="qualification" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Qualification
          </label>
          <select
            id="qualification"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="select-field"
            required
          >
            <option value="">Sélectionner une qualification...</option>
            {sortedRoles.map((role) => (
              <option key={role.id} value={role.qualification}>
                {role.qualification} ({role.acronym})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="requiredSkills" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Service
          </label>
          <input
            type="text"
            id="requiredSkills"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            className="input-field"
            placeholder="ex: Gériatrie, Soins intensifs"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contractReason" className="block text-sm font-bold text-[#3c3c3c] mb-2">
          Motif du contrat
        </label>
        <input
          type="text"
          id="contractReason"
          value={contractReason}
          onChange={(e) => setContractReason(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-bold text-[#3c3c3c] mb-2">
          Commentaire
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="input-field"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isTemporary"
          checked={isTemporary}
          onChange={(e) => setIsTemporary(e.target.checked)}
          className="w-4 h-4 text-[#00a19a] border-gray-300 rounded focus:ring-[#00a19a]"
        />
        <label htmlFor="isTemporary" className="text-sm font-medium text-[#3c3c3c]">
          Tempo
        </label>
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full"
      >
        Ajouter la Mission
      </button>
    </form>
  );
}