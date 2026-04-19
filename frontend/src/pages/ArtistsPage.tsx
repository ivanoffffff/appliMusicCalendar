import React, { useState, useEffect, useRef } from 'react';
import type { Artist, FavoriteArtist } from '../types';
import { artistService } from '../services/api';
import ArtistCard from '../components/artists/ArtistCard';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type Tab = 'favorites' | 'search';

// ─── Pill tab switcher ─────────────────────────────────────────────────────
const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'favorites', emoji: '❤️', label: 'Mes favoris' },
  { id: 'search',    emoji: '🔍', label: 'Rechercher' },
];

// ─── Page ─────────────────────────────────────────────────────────────────
const ArtistsPage: React.FC = () => {
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState<Artist[]>([]);
  const [favorites, setFavorites]             = useState<FavoriteArtist[]>([]);
  const [isSearching, setIsSearching]         = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [error, setError]                     = useState('');
  const [activeTab, setActiveTab]             = useState<Tab>('favorites');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadFavorites(); }, []);

  // Focus l'input quand on passe à l'onglet recherche
  useEffect(() => {
    if (activeTab === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [activeTab]);

  const loadFavorites = async () => {
    try {
      setIsLoadingFavorites(true);
      const res = await artistService.getFavorites();
      if (res.success && res.data) setFavorites(res.data);
    } catch {
      // silencieux
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError('');
    try {
      const res = await artistService.searchArtists(searchQuery, 20);
      if (res.success && res.data) {
        setSearchResults(res.data);
      } else {
        setError(res.message || 'Erreur lors de la recherche');
      }
    } catch {
      setError('Erreur de connexion. Vérifiez que le backend est démarré.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleFavorite = async (artist: Artist) => {
    try {
      const existing = favorites.find(f => f.artist.spotifyId === artist.spotifyId);
      if (existing) {
        await artistService.removeFromFavorites(existing.artist.id);
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
      } else {
        const res = await artistService.addToFavorites(artist.spotifyId, 'default');
        if (res.success) await loadFavorites();
      }
    } catch {
      setError('Erreur lors de la modification des favoris');
    }
  };

  const isArtistFavorite = (artist: Artist) =>
    favorites.some(f => f.artist.spotifyId === artist.spotifyId);

  // ── Artistes favoris normalisés en Artist ────────────────────────────
  const favoriteArtists: Artist[] = favorites.map(f => ({
    spotifyId: f.artist.spotifyId!,
    deezerId:  f.artist.deezerId,
    name:      f.artist.name,
    genres:    f.artist.genres,
    imageUrl:  f.artist.imageUrl || undefined,
    popularity: f.artist.popularity || 0,
    followers:  f.artist.followers || 0,
    spotifyUrl: f.artist.spotifyUrl || `https://open.spotify.com/artist/${f.artist.spotifyId}`,
    deezerUrl:  f.artist.deezerUrl,
  }));

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* ══════════ STICKY PILL TABS ══════════ */}
      <div className="sticky top-14 md:top-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {tab.id === 'favorites' && favorites.length > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'favorites'
                      ? 'bg-white/25 text-white'
                      : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  }`}
                >
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ SEARCH TAB ══════════ */}
      {activeTab === 'search' && (
        <div className="animate-entrance">

          {/* Hero search */}
          <div className="relative overflow-hidden border-b border-gray-100 dark:border-slate-800/60">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/15 dark:to-purple-950/10" />
            <div
              className="absolute -top-20 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
            />

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
              <div className="text-4xl mb-3 animate-bounce-subtle">🎤</div>
              <h2 className="text-2xl font-bold text-primary mb-1">Découvrez des artistes</h2>
              <p className="text-secondary text-sm mb-7">
                Recherchez sur Spotify et ajoutez vos favoris en un clic
              </p>

              {/* Barre de recherche */}
              <form onSubmit={handleSearch} className="relative flex items-center">
                <div className="absolute left-4 text-secondary pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Drake, Taylor Swift, Daft Punk…"
                  className="w-full pl-12 pr-36 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary placeholder:text-secondary transition-all duration-300 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute right-28 text-secondary hover:text-primary transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 btn-primary px-5 py-2 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? <LoadingSpinner size="sm" /> : 'Rechercher'}
                </button>
              </form>
            </div>
          </div>

          {/* Contenu recherche */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-10">

            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-entrance">
                <span>⚠️</span> {error}
              </div>
            )}

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="xl" type="musical" />
                <p className="text-secondary mt-4 text-sm">Recherche en cours…</p>
              </div>

            ) : searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary">Résultats</h3>
                    <p className="text-xs text-secondary mt-0.5">{searchResults.length} artiste{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => setSearchResults([])}
                    className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Effacer
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {searchResults.map((artist, i) => (
                    <div
                      key={artist.spotifyId}
                      className="animate-entrance"
                      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                    >
                      <ArtistCard
                        artist={artist}
                        isFavorite={isArtistFavorite(artist)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </>

            ) : searchQuery && !isSearching ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">😔</div>
                <p className="text-primary font-semibold mb-1">Aucun résultat pour « {searchQuery} »</p>
                <p className="text-secondary text-sm">Essayez avec un autre nom d'artiste</p>
              </div>

            ) : (
              /* État vide — suggestions */
              <div className="text-center py-16">
                <div className="text-5xl mb-4 animate-bounce-subtle">🎵</div>
                <p className="text-primary font-semibold mb-1">Prêt à explorer ?</p>
                <p className="text-secondary text-sm mb-6">Tapez le nom d'un artiste dans la barre ci-dessus</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Drake', 'Beyoncé', 'Daft Punk', 'Taylor Swift', 'The Weeknd', 'Kendrick Lamar'].map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setSearchQuery(name);
                        setTimeout(() => searchInputRef.current?.form?.requestSubmit(), 50);
                      }}
                      className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-slate-800 text-secondary hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ FAVORITES TAB ══════════ */}
      {activeTab === 'favorites' && (
        <div className="animate-entrance">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-10">

            {isLoadingFavorites ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="xl" type="musical" />
                <p className="text-secondary mt-4 text-sm">Chargement de vos favoris…</p>
              </div>

            ) : favoriteArtists.length > 0 ? (
              <>
                {/* Header favoris */}
                <div className="flex items-center gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Mes artistes favoris</h2>
                    <p className="text-xs text-secondary mt-0.5">
                      {favoriteArtists.length} artiste{favoriteArtists.length !== 1 ? 's' : ''} suivi{favoriteArtists.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-slate-700 to-transparent" />
                  <button
                    onClick={() => setActiveTab('search')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter
                  </button>
                </div>

                {/* Grille */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteArtists.map((artist, i) => (
                    <div
                      key={artist.spotifyId}
                      className="animate-entrance"
                      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                    >
                      <ArtistCard
                        artist={artist}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </>

            ) : (
              /* Empty state favoris */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center text-5xl mb-6 shadow-card">
                  🎤
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Aucun artiste favori</h3>
                <p className="text-secondary text-sm text-center max-w-xs mb-8">
                  Ajoutez vos artistes préférés pour suivre leurs nouvelles sorties en temps réel.
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="btn-primary px-6 py-3 text-sm"
                >
                  🔍 Rechercher des artistes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;
