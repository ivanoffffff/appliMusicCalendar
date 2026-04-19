import React from 'react';

interface GenreData {
  name: string;
  count: number;
  percentage: number;
}

interface GenreDistributionProps {
  genres: GenreData[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const MEDALS = ['🥇', '🥈', '🥉'];

const GenreDistribution: React.FC<GenreDistributionProps> = ({ genres }) => {
  if (genres.length === 0) {
    return (
      <div className="music-card text-center py-16">
        <div className="text-6xl mb-4 animate-float">🎵</div>
        <p className="text-secondary">
          Ajoutez des artistes pour voir la répartition des genres
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...genres.map(g => g.count));
  const totalArtists = genres.reduce((s, g) => s + g.count, 0);

  return (
    <div className="grid md:grid-cols-5 gap-5">

      {/* ── Barres horizontales (3/5 de la largeur) ── */}
      <div className="md:col-span-3 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-card">
        <div className="mb-5">
          <h3 className="text-base font-bold text-primary">Genres musicaux</h3>
          <p className="text-xs text-secondary mt-0.5">
            Basé sur vos {totalArtists} artiste{totalArtists > 1 ? 's' : ''} favoris
          </p>
        </div>

        <div className="space-y-4">
          {genres.map((genre, i) => {
            const barWidth = Math.round((genre.count / maxCount) * 100);
            return (
              <div key={genre.name} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-primary truncate max-w-[55%]">
                    {genre.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-secondary">
                      {genre.count} artiste{genre.count > 1 ? 's' : ''}
                    </span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: COLORS[i % COLORS.length] }}
                    >
                      {genre.percentage}%
                    </span>
                  </div>
                </div>

                {/* Barre */}
                <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}cc, ${COLORS[i % COLORS.length]})`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Colonne droite (2/5) ── */}
      <div className="md:col-span-2 flex flex-col gap-5">

        {/* Top 3 podium */}
        <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-card flex-1">
          <h3 className="text-base font-bold text-primary mb-4">🏆 Top Genres</h3>
          <div className="space-y-3">
            {genres.slice(0, 3).map((genre, i) => (
              <div
                key={genre.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors animate-entrance"
                style={{
                  backgroundColor: `${COLORS[i]}12`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <span className="text-lg shrink-0">{MEDALS[i]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{genre.name}</p>
                  <p className="text-xs text-secondary">
                    {genre.count} artiste{genre.count > 1 ? 's' : ''}
                  </p>
                </div>
                <span
                  className="text-sm font-bold shrink-0"
                  style={{ color: COLORS[i] }}
                >
                  {genre.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Diversité */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-spotify-500/10 dark:from-primary-900/25 dark:via-accent-900/20 dark:to-spotify-900/15 border border-primary-100 dark:border-primary-800/20 rounded-2xl p-6 shadow-card">
          <div className="text-3xl mb-2 animate-bounce-subtle">🌈</div>
          <p className="text-3xl font-black text-primary mb-0.5">{genres.length}</p>
          <p className="text-sm text-secondary">genres uniques découverts</p>

          {/* Décoration */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-accent-500/10 blur-xl" />
        </div>

      </div>
    </div>
  );
};

export default GenreDistribution;
