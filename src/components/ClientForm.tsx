import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { Client } from '../types';

interface ClientFormProps {
  client?: Client | null;
  onSuccess?: () => void;
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [name, setName] = useState(client?.name || '');
  const [address, setAddress] = useState(client?.address || '');
  const [postalCode, setPostalCode] = useState(client?.postalCode || '');
  const [city, setCity] = useState(client?.city || '');
  
  const { addClient, updateClient } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientData = {
      name,
      address,
      postalCode,
      city,
    };

    if (client) {
      await updateClient(client.id, clientData);
    } else {
      await addClient(clientData);
    }
    
    setName('');
    setAddress('');
    setPostalCode('');
    setCity('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-[#3c3c3c] mb-2">
          Libellé Etablissement
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          maxLength={50}
          required
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-bold text-[#3c3c3c] mb-2">
          Adresse
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Code Postal
          </label>
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="input-field"
            pattern="[0-9]*"
            maxLength={5}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-bold text-[#3c3c3c] mb-2">
            Ville
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full"
      >
        {client ? 'Modifier le Client' : 'Ajouter le Client'}
      </button>
    </form>
  );
}