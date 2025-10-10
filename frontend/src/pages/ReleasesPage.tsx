import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { Release, CalendarEvent } from '../types';
import { releaseService } from '../services/api';
import ReleaseCard from '../components/releases/ReleaseCard';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ReleasesPage: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<'all' | 'past' | 'upcoming'>('all');

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // ✅ Charger les sorties des 6 derniers mois jusqu'aux 6 prochains mois
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

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
        await loadReleases();
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
        return { bg: '#8b5cf6', border: '#7c3aed' };
      case 'EP': 
        return { bg: '#3b82f6', border: '#2563eb' };
      case 'SINGLE': 
        return { bg: '#10b981', border: '#059669' };
      default: 
        return { bg: '#6b7280', border: '#4b5563' };
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const release = clickInfo.event.extendedProps.release;
    setSelectedRelease(release);
  };

  // ✨ Fonction de filtrage
  const getFilteredReleases = () => {
    const now = new Date();
    
    switch (filter) {
      case 'past':
        return releases.filter(r => new Date(r.releaseDate) <= now);
      case 'upcoming':
        return releases.filter(r => new Date(r.releaseDate) > now);
      default:
        return releases;
    }
  };

  const filteredReleases = getFilteredReleases();
  const upcomingCount = releases.filter(r => new Date(r.releaseDate) > new Date()).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <LoadingSpinner size="xl" type="musical" />
            <p className="text-secondary mt-4">Chargement du calendrier...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Controls */}
      <div className="bg-secondary/80 backdrop-blur-md border-b border-custom">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  view === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                📅 Vue calendrier
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                📋 Vue liste
              </button>
            </div>

            {/* ✨ Filtres pour la vue liste */}
            {view === 'list' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Tout
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    filter === 'upcoming'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  🗓️ À venir ({upcomingCount})
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    filter === 'past'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  📅 Sorties
                </button>
              </div>
            )}
            
            <button
              onClick={syncReleases}
              disabled={isSyncing}
              className="btn-spotify px-4 py-2 text-sm disabled:opacity-50"
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
              ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {releases.length === 0 ? (
          <div className="text-center py-12">
            <div className="music-card p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Aucune sortie trouvée
              </h2>
              <p className="text-secondary mb-6">
                Ajoutez des artistes à vos favoris et synchronisez pour voir leurs sorties !
              </p>
              <div className="space-x-4">
                <a
                  href="/artists"
                  className="btn-primary px-6 py-2"
                >
                  Ajouter des artistes
                </a>
                <button
                  onClick={syncReleases}
                  disabled={isSyncing}
                  className="btn-spotify px-6 py-2 disabled:opacity-50"
                >
                  {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {view === 'calendar' ? (
              <div className="music-card p-6">
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
                {filteredReleases.length === 0 ? (
                  <div className="text-center py-12 music-card">
                    <p className="text-secondary">
                      {filter === 'upcoming' 
                        ? "Aucune sortie à venir pour le moment 📅"
                        : "Aucune sortie correspondante"}
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-primary">
                      {filter === 'all' && `Toutes les sorties (${filteredReleases.length})`}
                      {filter === 'upcoming' && `Sorties à venir (${filteredReleases.length})`}
                      {filter === 'past' && `Sorties disponibles (${filteredReleases.length})`}
                    </h2>
                    {filteredReleases.map(release => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal pour les détails de sortie */}
      {selectedRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-primary">Détails de la sortie</h3>
              <button
                onClick={() => setSelectedRelease(null)}
                className="text-secondary hover:text-primary"
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