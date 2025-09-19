import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">🎵 Music Tracker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Bonjour, {user?.firstName || user?.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bienvenue sur votre dashboard !
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🎤 Mes Artistes</h3>
              <p className="text-blue-600 mb-3">Gérez vos artistes favoris et découvrez-en de nouveaux</p>
              <button 
                onClick={() => navigate('/artists')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Gérer mes artistes
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">📅 Sorties Musicales</h3>
              <p className="text-green-600 mb-3">Calendrier des sorties de vos artistes favoris</p>
              <button 
                onClick={() => navigate('/releases')}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
              >
                Voir le calendrier
              </button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">🔔 Notifications</h3>
              <p className="text-purple-600 mb-3">Paramètres de notifications (prochainement)</p>
              <button className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm cursor-not-allowed" disabled>
                Bientôt disponible
              </button>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
          <div className="space-y-2">
            <p><strong>Nom d'utilisateur :</strong> {user?.username}</p>
            <p><strong>Email :</strong> {user?.email}</p>
            <p><strong>Nom complet :</strong> {user?.firstName} {user?.lastName}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
