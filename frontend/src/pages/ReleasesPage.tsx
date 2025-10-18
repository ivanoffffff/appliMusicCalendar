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
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [filter, setFilter] = useState<'all' | 'past' | 'upcoming'>('all');

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Charger les sorties des 6 derniers mois jusqu'aux 6 prochains mois
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
      allDay: true,
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

      {/* Controls - Version compacte */}
      <div className="sticky top-14 md:top-16 z-40 bg-secondary/80 backdrop-blur-md border-b border-custom">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-3">
            {/* Boutons de vue - Plus compacts sur mobile */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  view === 'list'
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-primary/10 text-secondary hover:text-primary hover:bg-primary/20'
                }`}
              >
                📋 <span className="hidden sm:inline">Vue </span>Liste
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  view === 'calendar'
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'bg-primary/10 text-secondary hover:text-primary hover:bg-primary/20'
                }`}
              >
                📅 <span className="hidden sm:inline">Vue </span>Calendrier
              </button>
            </div>
            
            {/* Bouton Synchroniser - Icône seule sur mobile */}
            <button
              onClick={syncReleases}
              disabled={isSyncing}
              className="btn-spotify px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm disabled:opacity-50 whitespace-nowrap"
            >
              {isSyncing ? (
                <>
                  <span className="inline md:hidden">🔄</span>
                  <span className="hidden md:inline">🔄 Synchronisation...</span>
                </>
              ) : (
                <>
                  <span className="inline md:hidden">🔄</span>
                  <span className="hidden md:inline">🔄 Synchroniser</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Message d'erreur ou de succès */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-3">
          <div className={`px-3 py-2 rounded-lg text-sm ${
            error.includes('✅') 
              ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {error}
          </div>
        </div>
      )}

      {/* Main content avec padding bottom pour la bottom nav mobile */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {releases.length === 0 ? (
          <div className="text-center py-12">
            <div className="music-card p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Aucune sortie trouvée
              </h2>
              <p className="text-secondary mb-6">
                Ajoutez des artistes à vos favoris et synchronisez pour voir leurs sorties !
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              <div className="music-card p-4 md:p-6">
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
                    <p className="text-secondary">Aucune sortie disponible</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-primary">
                      Toutes les sorties ({filteredReleases.length})
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