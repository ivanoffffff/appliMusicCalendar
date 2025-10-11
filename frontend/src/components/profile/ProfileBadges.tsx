import React from 'react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  earned: boolean;
}

interface ProfileBadgesProps {
  totalArtists: number;
  totalGenres: number;
  username?: string;
  firstName?: string;
}

const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  totalArtists,
  totalGenres,
  username,
  firstName
}) => {
  // Définition des badges avec conditions
  const badges: Badge[] = [
    {
      id: 'newbie',
      title: 'Débutant',
      description: 'Premiers pas dans Music Tracker',
      icon: '🌱',
      color: '#10b981',
      bgColor: '#10b98115',
      earned: totalArtists >= 1 && totalArtists < 5
    },
    {
      id: 'collector',
      title: 'Collectionneur',
      description: `${totalArtists} artistes suivis`,
      icon: '🎵',
      color: '#3b82f6',
      bgColor: '#3b82f615',
      earned: totalArtists >= 5 && totalArtists < 20
    },
    {
      id: 'mega-collector',
      title: 'Méga Collectionneur',
      description: `${totalArtists} artistes suivis !`,
      icon: '🎸',
      color: '#8b5cf6',
      bgColor: '#8b5cf615',
      earned: totalArtists >= 20
    },
    {
      id: 'explorer',
      title: 'Explorateur',
      description: `${totalGenres} genres différents`,
      icon: '🌍',
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      earned: totalGenres >= 3 && totalGenres < 10
    },
    {
      id: 'music-guru',
      title: 'Guru Musical',
      description: `${totalGenres} genres explorés !`,
      icon: '🎭',
      color: '#ec4899',
      bgColor: '#ec489915',
      earned: totalGenres >= 10
    }
  ];

  // Filtrer uniquement les badges gagnés
  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className="music-card">
      {/* En-tête du profil */}
      <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-primary/10">
        {/* Avatar avec gradient */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 via-accent-500 to-spotify-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-glow animate-entrance">
          {(firstName?.[0] || username?.[0] || 'U').toUpperCase()}
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-primary mb-1">
            {firstName || username || 'Utilisateur'}
          </h3>
          <p className="text-sm text-secondary">
            🎵 Passionné de musique
          </p>
        </div>
      </div>

      {/* Section des badges */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          🏆 Vos Badges
          <span className="text-sm font-normal text-secondary">
            ({earnedBadges.length} débloqué{earnedBadges.length > 1 ? 's' : ''})
          </span>
        </h4>

        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {earnedBadges.map((badge, index) => (
              <div
                key={badge.id}
                className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 animate-entrance"
                style={{
                  backgroundColor: badge.bgColor,
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Icône du badge */}
                <div className="text-3xl mb-2 group-hover:scale-100 transition-transform duration-300">
                  {badge.icon}
                </div>
                
                {/* Titre */}
                <h5 className="font-bold text-sm mb-1" style={{ color: badge.color }}>
                  {badge.title}
                </h5>
                
                {/* Description */}
                <p className="text-xs text-secondary">
                  {badge.description}
                </p>

                {/* Effet brillance */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-primary/5 rounded-xl">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-secondary text-sm">
              Ajoutez des artistes pour débloquer vos premiers badges !
            </p>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {totalArtists}
          </div>
          <div className="text-xs text-secondary">
            Artistes
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {totalGenres}
          </div>
          <div className="text-xs text-secondary">
            Genres
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {earnedBadges.length}
          </div>
          <div className="text-xs text-secondary">
            Badges
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBadges;