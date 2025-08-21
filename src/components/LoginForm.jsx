import React, { useState } from 'react';
import { authService } from '../services/authService';
import { ShieldCheck as ShieldCheckIcon, Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';
import FormField from './FormField';
import LoadingSpinner from './LoadingSpinner';
import FeedbackMessage from './FeedbackMessage';

const LoginForm = ({ onLoginSuccess }) => {
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
    setError('');
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
        await authService.signUp(
          formData.email,
          formData.password,
          signUpData.displayName,
          signUpData.role
        );
        setError('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsSignUp(false);
      } else {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center animate-slideIn">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Créer un compte' : 'Connexion CROUS Réseau'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Accédez à la gestion du réseau CROUS' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <FormField
                label="Nom complet"
                name="displayName"
                value={signUpData.displayName}
                onChange={handleSignUpInputChange}
                required={isSignUp}
                placeholder="Votre nom complet"
              />

              <FormField
                label="Rôle"
                name="role"
                value={signUpData.role}
                onChange={handleSignUpInputChange}
                required={isSignUp}
              >
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="technician">Technicien</option>
                  <option value="supervisor">Superviseur</option>
                  <option value="admin">Administrateur</option>
                  <option value="viewer">Lecteur</option>
                </select>
              </FormField>
            </>
          )}

          <FormField
            label="Adresse email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="votre.email@crous.fr"
          />

          <FormField
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="Votre mot de passe"
          >
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white pr-10"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </FormField>

          {error && (
            <FeedbackMessage
              type={error.includes('succès') || error.includes('envoyé') ? 'success' : 'error'}
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Chargement...</span>
                </div>
              ) : (
                isSignUp ? 'Créer le compte' : 'Se connecter'
              )}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Créer un compte'}
              </button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
