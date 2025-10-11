import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GenreData {
  name: string;
  count: number;
  percentage: number;
}

interface GenreDistributionProps {
  genres: GenreData[];
}

const GenreDistribution: React.FC<GenreDistributionProps> = ({ genres }) => {
  // Couleurs pour les barres (palette variée)
  const COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  // Top 3 genres pour les badges
  const topGenres = genres.slice(0, 3);

  if (genres.length === 0) {
    return (
      <div className="music-card text-center py-12">
        <div className="text-6xl mb-4">🎵</div>
        <p className="text-secondary">
          Ajoutez des artistes pour voir la répartition des genres
        </p>
      </div>
    );
  }

  return (
    <div className="music-card">
      {/* En-tête avec description */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-primary mb-2">
          Vos genres musicaux
        </h3>
        <p className="text-sm text-secondary">
          Répartition basée sur vos {genres.reduce((sum, g) => sum + g.count, 0)} artistes favoris
        </p>
      </div>

      {/* Badges des top 3 genres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {topGenres.map((genre, index) => {
          const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          return (
            <div
              key={genre.name}
              className="px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 animate-entrance"
              style={{
                backgroundColor: `${COLORS[index]}15`,
                color: COLORS[index],
                animationDelay: `${index * 100}ms`
              }}
            >
              <span>{emoji}</span>
              <span>{genre.name}</span>
              <span className="font-bold">{genre.percentage}%</span>
            </div>
          );
        })}
      </div>

      {/* Graphique en barres */}
      <div className="w-full h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={genres}
            margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{ 
                value: 'Nombre d\'artistes', 
                angle: -90,
                position: 'center', 
                fill: '#9ca3af',
                style: { textAnchor: 'middle' },
                dx: -10
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} artiste${value > 1 ? 's' : ''} (${props.payload.percentage}%)`,
                'Total'
              ]}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {genres.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Légende textuelle pour les genres restants */}
      {genres.length > 3 && (
        <div className="mt-6 pt-6 border-t border-primary/10">
          <p className="text-xs text-secondary mb-3 font-medium">
            Autres genres ({genres.length - 3}) :
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.slice(3).map((genre, index) => (
              <span
                key={genre.name}
                className="text-xs px-3 py-1 rounded-full bg-primary/5 text-secondary"
              >
                {genre.name} ({genre.percentage}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreDistribution;