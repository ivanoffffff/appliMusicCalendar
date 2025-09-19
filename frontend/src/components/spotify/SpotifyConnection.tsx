import React, { useState, useEffect } from 'react';
import { spotifyOAuthService } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SpotifyConnectionProps {
  onSyncComplete?: () => void;
}

const SpotifyConnection: React.FC<SpotifyConnectionProps> = ({ onSyncComplete }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [connectedAt, setConnectedAt] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
    handleSpotifyCallback();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await spotifyOAuthService.getConnectionStatus();
      
      if (response.success && response.data) {
        setIsConnected(response.data.isConnected);
        setConnectedAt(response.data.connectedAt || null);
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyConnected = urlParams.get('spotify_connected');
    const spotifyError = urlParams.get('spotify_error');

    if (spotifyConnected === 'true') {
      setSuccessMessage('✅ Connexion Spotify réussie !');
      setIsConnected(true);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto-sync après connexion
      setTimeout(() => handleSync(), 1000);
    } else if (spotifyError) {
      setError(`Erreur de connexion Spotify: ${spotifyError}`);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      const response = await spotifyOAuthService.initiateConnection();
      
      if (response.success && response.data?.authUrl) {
        // Rediriger vers Spotify pour l'autorisation
        window.location.href = response.data.authUrl;
      } else {
        setError('Erreur lors de l\'initiation de la connexion');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
      console.error('Connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError('');
      setSuccessMessage('');
      
      const response = await spotifyOAuthService.syncFavorites();
      
      if (response.success && response.data) {
        const { imported, existing } = response.data;
        setSuccessMessage(
          `🎵 Synchronisation terminée ! ${imported} nouveaux artistes importés, ${existing} déjà présents.`
        );
        
        // Notifier le parent que la sync est terminée
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        setError(response.message || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      setError('Erreur de synchronisation');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Spotify ?')) {
      return;
    }

    try {
      setError('');
      const response = await spotifyOAuthService.disconnect();
      
      if (response.success) {
        setIsConnected(false);
        setConnectedAt(null);
        setSuccessMessage('Compte Spotify déconnecté avec succès');
      } else {
        setError('Erreur lors de la déconnexion');
      }
    } catch (error) {
      setError('Erreur de déconnexion');
      console.error('Disconnect error:', error);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-gray-600">Vérification de la connexion Spotify...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-green-600 text-xl mr-2">🎵</span>
          Synchronisation Spotify
        </h3>
        {isConnected && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Connecté
          </span>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-start">
            <span>{successMessage}</span>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">✕</button>
          </div>
        </div>
      )}

      {!isConnected ? (
        <div>
          <p className="text-gray-600 mb-4">
            Connectez votre compte Spotify pour importer automatiquement vos artistes suivis.
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Avantages de la connexion :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Import automatique de vos artistes suivis</li>
                <li>✅ Synchronisation en un clic</li>
                <li>✅ Pas besoin de rechercher manuellement</li>
                <li>✅ Mise à jour facile de vos favoris</li>
              </ul>
            </div>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <span className="mr-2">🎵</span>
                  Se connecter avec Spotify
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Votre compte Spotify est connecté ! Vous pouvez synchroniser vos artistes suivis.
          </p>
          {connectedAt && (
            <p className="text-sm text-gray-500 mb-4">
              Connecté le {new Date(connectedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSyncing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Synchronisation en cours...
                </>
              ) : (
                <>
                  <span className="mr-2">🔄</span>
                  Synchroniser mes artistes Spotify
                </>
              )}
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-sm"
            >
              Déconnecter Spotify
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyConnection;
