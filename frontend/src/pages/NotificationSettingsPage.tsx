import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface NotificationPreferences {
  emailNotifications: boolean;
  notificationTypes: {
    newAlbum: boolean;
    newSingle: boolean;
    newCompilation: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  weeklySummary?: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    notificationTypes: {
      newAlbum: true,
      newSingle: true,
      newCompilation: true,
    },
    frequency: 'immediate',
    weeklySummary: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getPreferences();
      if (response.success && response.data) {
        setPreferences({
          ...response.data,
          weeklySummary: response.data.weeklySummary ?? true,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      
      const response = await notificationService.updatePreferences(preferences);
      
      if (response.success) {
        setMessage('✅ Préférences enregistrées avec succès !');
        setIsError(false);
      } else {
        setMessage('❌ Erreur lors de l\'enregistrement');
        setIsError(true);
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement');
      setIsError(true);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* En-tête avec info utilisateur et bouton déconnexion */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  🔔 Paramètres de notification
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Personnalisez comment et quand vous souhaitez recevoir des notifications
                </p>
              </div>
            </div>

            {/* Info utilisateur */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user?.firstName || user?.username}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message de confirmation */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              isError 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            }`}>
              {message}
            </div>
          )}

          {/* Paramètres de notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-6">
              
              {/* Activation des notifications email */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📧 Notifications par email
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Recevoir des emails pour les nouvelles sorties
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    emailNotifications: !prev.emailNotifications
                  }))}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    preferences.emailNotifications 
                      ? 'bg-purple-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Types de sorties */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎼 Types de sorties à suivre
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💿</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Albums</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Nouveaux albums complets</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationTypes.newAlbum}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notificationTypes: {
                          ...prev.notificationTypes,
                          newAlbum: e.target.checked
                        }
                      }))}
                      className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🎵</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Singles</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Nouveaux singles et morceaux</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationTypes.newSingle}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notificationTypes: {
                          ...prev.notificationTypes,
                          newSingle: e.target.checked
                        }
                      }))}
                      className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📀</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Compilations & EP</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">EP et compilations</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationTypes.newCompilation}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notificationTypes: {
                          ...prev.notificationTypes,
                          newCompilation: e.target.checked
                        }
                      }))}
                      className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              {/* Fréquence des notifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ⏰ Fréquence des notifications
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="immediate"
                      checked={preferences.frequency === 'immediate'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        frequency: e.target.value as 'immediate' | 'daily' | 'weekly'
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white">
                      Immédiatement - Dès qu'une sortie est détectée
                    </span>
                  </label>

                  <label className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={preferences.frequency === 'daily'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        frequency: e.target.value as 'immediate' | 'daily' | 'weekly'
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white">
                      Quotidien - Un résumé chaque jour
                    </span>
                  </label>

                  <label className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={preferences.frequency === 'weekly'}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        frequency: e.target.value as 'immediate' | 'daily' | 'weekly'
                      }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white">
                      Hebdomadaire - Un résumé chaque semaine
                    </span>
                  </label>
                </div>
              </div>

              {/* Résumé hebdomadaire */}
              {preferences.frequency !== 'weekly' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        📊 Résumé hebdomadaire
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Recevoir un récapitulatif chaque semaine en plus des notifications
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({
                        ...prev,
                        weeklySummary: !prev.weeklySummary
                      }))}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        preferences.weeklySummary 
                          ? 'bg-purple-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          preferences.weeklySummary ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={loadPreferences}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Enregistrement...</span>
                    </>
                  ) : (
                    '💾 Enregistrer les préférences'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Bouton Déconnexion */}
        <div className="flex justify-center items-start pt-5">
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationSettingsPage;