import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import type { Consultant } from '../types';

interface ConsultantFormProps {
  consultant?: Consultant | null;
  onSuccess?: () => void;
}

export function ConsultantForm({ consultant, onSuccess }: ConsultantFormProps) {
  const [name, setName] = useState(consultant?.name || '');
  const [surname, setSurname] = useState(consultant?.surname || '');
  const [role, setRole] = useState(consultant?.role || '');
  const [preferredLocations, setPreferredLocations] = useState(consultant?.preferredLocations.join(', ') || '');
  
  const { addConsultant, updateConsultant, roles, users, agencies } = useStore();
  const { currentUser } = useAuth();

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => a.qualification.localeCompare(b.qualification));
  }, [roles]);

  // Récupérer les infos de l'utilisateur courant et son agence
  const currentUserInfo = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.email === currentUser.email);
  }, [currentUser, users]);

  const userAgency = useMemo(() => {
    if (!currentUserInfo) return null;
    return agencies.find(a => a.id === currentUserInfo?.agencyId);
  }, [currentUserInfo, agencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Récupérer le code de l'agence de l'utilisateur courant
    const agencyCode = userAgency?.code || 'UNKN';
    
    const consultantData = {
      name,
      surname,
      role,
      skills: consultant?.skills || [],
      certifications: consultant?.certifications || [],
      hourlyRate: consultant?.hourlyRate || 0,
      preferredLocations: preferredLocations.split(',').map(l => l.trim()).filter(Boolean),
      availability: consultant?.availability || {},
      agencyCode: consultant?.agencyCode || agencyCode, // Conserver le code agence existant ou attribuer celui de l'utilisateur
    };

    if (consultant) {
      await updateConsultant(consultant.id, consultantData);
    } else {
      await addConsultant(consultantData);
    }

    setName('');
    setSurname('');
    setRole('');
    setPreferredLocations('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Prénom
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="surname" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Nom
          </label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-bold text-[#3c3c3c] mb-2">
          Qualif
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="select-field"
          required
        >
          <option value="">Sélectionner une qualif...</option>
          {sortedRoles.map((role) => (
            <option key={role.id} value={role.qualification}>
              {role.qualification} ({role.acronym})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="preferredLocations" className="block text-sm font-bold text-[#3c3c3c] mb-2">
          Lieux de Travail Préférés (séparés par des virgules)
        </label>
        <input
          type="text"
          id="preferredLocations"
          value={preferredLocations}
          onChange={(e) => setPreferredLocations(e.target.value)}
          className="input-field"
          placeholder="ex: Lyon, Villeurbanne, Vénissieux"
        />
      </div>

      {userAgency && (
        <div className="text-sm text-[#6b7280]">
          <span className="font-medium">Agence d'appartenance:</span> {userAgency.name} ({userAgency.code})
        </div>
      )}
      
      <button
        type="submit"
        className="btn-primary w-full"
      >
        {consultant ? 'Modifier le Candidat' : 'Ajouter le Candidat'}
      </button>
    </form>
  );
}