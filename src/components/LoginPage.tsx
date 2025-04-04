import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Users2 } from 'lucide-react';
import { auth } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (currentUser) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = 'Une erreur est survenue';
      
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Ce compte a été désactivé';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      }
      
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse');
      setTimeout(() => {
        setIsResettingPassword(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      let errorMessage = 'Une erreur est survenue';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#005d92] to-[#00a19a] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-[#00a19a] bg-opacity-10 p-3 rounded-full">
              <Users2 className="w-8 h-8 text-[#00a19a]" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-[#3c3c3c]">
            ConsultFlow
          </h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            {isResettingPassword ? 'Réinitialisation du mot de passe' : 'Connectez-vous à votre espace'}
          </p>
        </div>

        {isResettingPassword ? (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm text-center">
                {successMessage}
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-[#3c3c3c]">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResettingPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-[#00a19a] hover:text-[#008b85] text-sm font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#3c3c3c]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3c3c3c]">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Se connecter'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResettingPassword(true);
                  setError('');
                }}
                className="text-[#00a19a] hover:text-[#008b85] text-sm font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}