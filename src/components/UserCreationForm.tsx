import React, { useState, useMemo } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useStore } from '../store';
import { AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface UserCreationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserCreationForm({ onSuccess, onCancel }: UserCreationFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [role, setRole] = useState<'user' | 'manager' | 'admin'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { addUser, agencies } = useStore();

  const sortedAgencies = useMemo(() => {
    return [...agencies].sort((a, b) => a.name.localeCompare(b.name));
  }, [agencies]);

  // Validation du format d'email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validation de la complexité du mot de passe
  const isStrongPassword = (password: string): boolean => {
    return password.length >= 6; // Firebase exige au moins 6 caractères
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation des champs
    if (!firstName.trim() || !lastName.trim()) {
      setError('Le prénom et le nom sont requis');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Format d\'email invalide');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!agencyId) {
      setError('Veuillez sélectionner une agence');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // 2. Ajouter l'utilisateur à Firestore
      await addUser({
        email,
        firstName,
        lastName,
        agencyId,
        role,
        active: true,
        lastLogin: new Date().toISOString(),
        uid // Stocker l'ID Firebase Auth pour référence
      });

      setSuccessMessage('Utilisateur créé avec succès!');
      
      // Réinitialiser le formulaire
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setAgencyId('');
      setRole('user');

      // Attendre que le message de succès soit affiché avant de fermer
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      let errorMessage: string;
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé par un autre compte';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format d\'email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible (minimum 6 caractères)';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur: ${err.message || 'Une erreur inconnue est survenue'}`;
      }
      
      setError(errorMessage);
      console.error('Erreur de création d\'utilisateur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-bold text-[#3c3c3c] mb-1">
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-bold text-[#3c3c3c] mb-1">
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-bold text-[#3c3c3c] mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Servira d'identifiant de connexion
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-[#3c3c3c] mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 6 caractères
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#3c3c3c] mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="agencyId" className="block text-sm font-bold text-[#3c3c3c] mb-1">
            Agence
          </label>
          <select
            id="agencyId"
            value={agencyId}
            onChange={(e) => setAgencyId(e.target.value)}
            className="select-field"
            required
          >
            <option value="">Sélectionner une agence...</option>
            {sortedAgencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name} ({agency.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-bold text-[#3c3c3c] mb-1">
            Rôle
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'manager' | 'admin')}
            className="select-field"
            required
          >
            <option value="user">Utilisateur</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary bg-gray-500 hover:bg-gray-600 border-gray-600"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Création...</span>
            </>
          ) : (
            <span>Créer l'utilisateur</span>
          )}
        </button>
      </div>
    </form>
  );
}