import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔔 Paramètres de notification
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personnalisez comment et quand vous souhaitez recevoir des notifications
            </p>
          </div>

          {/* Message de confirmation */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              isError 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            
            {/* Activer/Désactiver les emails */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Notifications par email
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir des emails pour les nouvelles sorties
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences(prev => ({ 
                    ...prev, 
                    emailNotifications: !prev.emailNotifications 
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailNotifications 
                      ? 'bg-purple-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Types de sorties */}
            {preferences.emailNotifications && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Types de sorties à notifier
                </h3>
                <div className="space-y-4">
                  
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
            )}

            {/* Fréquence */}
            {preferences.emailNotifications && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Fréquence des notifications
                </h3>
                <div className="space-y-3">
                  
                  <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors"
                    style={{
                      borderColor: preferences.frequency === 'immediate' ? '#8b5cf6' : 'transparent',
                      backgroundColor: preferences.frequency === 'immediate' ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                    }}>
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.frequency === 'immediate'}
                      onChange={() => setPreferences(prev => ({ ...prev, frequency: 'immediate' }))}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white">⚡ Immédiate</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Recevoir un email dès qu'une sortie est disponible
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors"
                    style={{
                      borderColor: preferences.frequency === 'daily' ? '#8b5cf6' : 'transparent',
                      backgroundColor: preferences.frequency === 'daily' ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                    }}>
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.frequency === 'daily'}
                      onChange={() => setPreferences(prev => ({ ...prev, frequency: 'daily' }))}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white">📅 Quotidienne</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Un résumé des sorties du jour (à 9h00)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors"
                    style={{
                      borderColor: preferences.frequency === 'weekly' ? '#8b5cf6' : 'transparent',
                      backgroundColor: preferences.frequency === 'weekly' ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                    }}>
                    <input
                      type="radio"
                      name="frequency"
                      checked={preferences.frequency === 'weekly'}
                      onChange={() => setPreferences(prev => ({ ...prev, frequency: 'weekly' }))}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white">📆 Hebdomadaire</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Un résumé des sorties de la semaine (lundi à 9h00)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Récapitulatif hebdomadaire */}
            {preferences.emailNotifications && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-sm p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">📧</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Récapitulatif hebdomadaire
                      </h3>
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        NOUVEAU
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Recevez un email récapitulatif tous les <strong>vendredis à 10h00</strong> avec toutes les sorties de vos artistes favoris de la semaine
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      📅 Période : du lundi au dimanche • 🎵 Toutes les sorties en un seul email
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferences(prev => ({ 
                      ...prev, 
                      weeklySummary: !prev.weeklySummary 
                    }))}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.weeklySummary 
                        ? 'bg-purple-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.weeklySummary ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Bouton Enregistrer */}
            <div className="flex justify-end space-x-4">
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
    </>
  );
};

export default NotificationSettingsPage;