import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { useAuth } from '../contexts/AuthContext';
import type { Release, CalendarEvent } from '../types';
import { releaseService } from '../services/api';
import ReleaseCard from '../components/releases/ReleaseCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ReleasesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Récupérer les sorties des 6 derniers mois et 3 mois à venir
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const response = await releaseService.getUserReleases(
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (response.success && response.data) {
        setReleases(response.data);
        setCalendarEvents(convertReleasesToEvents(response.data));
      } else {
        setError(response.message || 'Erreur lors du chargement des sorties');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Load releases error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncReleases = async () => {
    try {
      setIsSyncing(true);
      setError('');
      
      const response = await releaseService.syncReleases();
      
      if (response.success) {
        // Recharger les sorties après la sync
        await loadReleases();
        // Message de succès temporaire
        setError('✅ Synchronisation réussie !');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.message || 'Erreur lors de la synchronisation');
      }
    } catch (err) {
      setError('Erreur lors de la synchronisation');
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const convertReleasesToEvents = (releases: Release[]): CalendarEvent[] => {
    return releases.map(release => ({
      id: release.id,
      title: `${release.artist.name} - ${release.name}`,
      date: release.releaseDate,
      backgroundColor: getReleaseTypeColor(release.releaseType).bg,
      borderColor: getReleaseTypeColor(release.releaseType).border,
      extendedProps: {
        release,
        releaseType: release.releaseType,
      },
    }));
  };

  const getReleaseTypeColor = (type: string) => {
    switch (type) {
      case 'ALBUM': 
        return { bg: '#8b5cf6', border: '#7c3aed' }; // Purple
      case 'EP': 
        return { bg: '#3b82f6', border: '#2563eb' }; // Blue
      case 'SINGLE': 
        return { bg: '#10b981', border: '#059669' }; // Green
      default: 
        return { bg: '#6b7280', border: '#4b5563' }; // Gray
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const release = clickInfo.event.extendedProps.release;
    setSelectedRelease(release);
  };

  const upcomingReleases = releases
    .filter(release => new Date(release.releaseDate) > new Date())
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())
    .slice(0, 5);

  const recentReleases = releases
    .filter(release => new Date(release.releaseDate) <= new Date())
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">📅 Calendrier des sorties</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">👋 {user?.firstName || user?.username}</span>
            <a
              href="/artists"
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
            >
              Mes artistes
            </a>
            <a
              href="/dashboard"
              className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
            >
              Dashboard
            </a>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Vue calendrier
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Vue liste
              </button>
            </div>
            
            <button
              onClick={syncReleases}
              disabled={isSyncing}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {isSyncing ? '🔄 Synchronisation...' : '🔄 Synchroniser'}
            </button>
          </div>
        </div>
      </div>

      {/* Message d'erreur ou de succès */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className={`px-4 py-3 rounded-md ${
            error.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {releases.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aucune sortie trouvée
              </h2>
              <p className="text-gray-600 mb-6">
                Ajoutez des artistes à vos favoris et synchronisez pour voir leurs sorties !
              </p>
              <div className="space-x-4">
                <a
                  href="/artists"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Ajouter des artistes
                </a>
                <button
                  onClick={syncReleases}
                  disabled={isSyncing}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendrier / Liste principale */}
            <div className="lg:col-span-2">
              {view === 'calendar' ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,dayGridWeek'
                    }}
                    height="auto"
                    locale="fr"
                    eventDisplay="block"
                    dayMaxEvents={3}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Toutes les sorties ({releases.length})
                  </h2>
                  {releases.map(release => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prochaines sorties */}
              {upcomingReleases.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🔮 Prochaines sorties
                  </h3>
                  <div className="space-y-3">
                    {upcomingReleases.map(release => (
                      <div key={release.id} className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium text-gray-900">{release.name}</p>
                        <p className="text-sm text-gray-600">{release.artist.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(release.releaseDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sorties récentes */}
              {recentReleases.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🆕 Sorties récentes
                  </h3>
                  <div className="space-y-3">
                    {recentReleases.map(release => (
                      <div key={release.id} className="border-l-4 border-green-500 pl-4">
                        <p className="font-medium text-gray-900">{release.name}</p>
                        <p className="text-sm text-gray-600">{release.artist.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(release.releaseDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Légende */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm text-gray-600">Albums</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">EPs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Singles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal pour les détails de sortie */}
      {selectedRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la sortie</h3>
              <button
                onClick={() => setSelectedRelease(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ReleaseCard release={selectedRelease} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleasesPage;
