import React, { useState } from 'react';
import { authService } from '../services/authService';
import { ShieldCheck as ShieldCheckIcon, Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';
import FormField from './FormField';
import LoadingSpinner from './LoadingSpinner';
import FeedbackMessage from './FeedbackMessage';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    displayName: '',
    role: 'technician'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Effacer l'erreur lors de la saisie
  };

  const handleSignUpInputChange = (e) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Création de compte
        await authService.signUp(
          formData.email,
          formData.password,
          signUpData.displayName,
          signUpData.role
        );
        setError('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsSignUp(false);
      } else {
        // Connexion
        const user = await authService.signIn(formData.email, formData.password);
        onLoginSuccess(user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Veuillez saisir votre email pour réinitialiser le mot de passe.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(formData.email);
      setError('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Créer un compte' : 'Connexion CROUS Réseau'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSignUp 
              ? 'Accédez à la gestion du réseau CROUS' 
              : 'Connectez-vous à votre compte'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom complet
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required={isSignUp}
                  value={signUpData.displayName}
                  onChange={handleSignUpInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                  placeholder="Votre nom complet"
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={signUpData.role}
                  onChange={handleSignUpInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="technician">Technicien</option>
                  <option value="supervisor">Superviseur</option>
                  <option value="admin">Administrateur</option>
                  <option value="viewer">Lecteur</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="votre.email@crous.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 pr-10"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <FeedbackMessage
              type={error.includes('succès') || error.includes('envoyé') ? 'success' : 'error'}
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isSignUp ? 'Créer le compte' : 'Se connecter'
              )}
            </button>

            {!isSignUp && (
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {isSignUp 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas de compte ? Créer un compte'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;


