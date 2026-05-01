import React, { useEffect, useState } from 'react';
import { spotifyAccountService } from '../../services/api';

const SpotifyLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

const SpotifyConnect: React.FC = () => {
  const [connected, setConnected]       = useState<boolean | null>(null); // null = loading
  const [connecting, setConnecting]     = useState(false);
  const [importing, setImporting]       = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError]               = useState<string | null>(null);

  // ── Charger le statut de connexion ──────────────────────────────────────
  useEffect(() => {
    spotifyAccountService.getStatus()
      .then(res => setConnected(res.connected))
      .catch(() => setConnected(false));
  }, []);

  // ── Connecter Spotify ────────────────────────────────────────────────────
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const { url } = await spotifyAccountService.getAuthUrl();
      window.location.href = url;
    } catch {
      setError('Impossible de lancer la connexion Spotify. Réessaie.');
      setConnecting(false);
    }
  };

  // ── Importer les artistes suivis ─────────────────────────────────────────
  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setImportResult(null);
    try {
      const res = await spotifyAccountService.importFollowing();
      setImportResult({ imported: res.imported, skipped: res.skipped, total: res.total });
    } catch {
      setError('Erreur lors de l\'import. Réessaie dans un moment.');
    } finally {
      setImporting(false);
    }
  };

  // ── Déconnecter Spotify ──────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!confirm('Déconnecter ton compte Spotify ? Tes artistes favoris ne seront pas supprimés.')) return;
    setDisconnecting(true);
    try {
      await spotifyAccountService.disconnect();
      setConnected(false);
      setImportResult(null);
    } catch {
      setError('Erreur lors de la déconnexion.');
    } finally {
      setDisconnecting(false);
    }
  };

  // ── État de chargement initial ───────────────────────────────────────────
  if (connected === null) {
    return (
      <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-2xl p-4 animate-pulse h-24" />
    );
  }

  // ── Non connecté ────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="bg-gradient-to-r from-[#1db954]/8 to-emerald-500/5 border border-[#1db954]/20 rounded-2xl p-4 flex items-center gap-4 animate-entrance">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#1db954]/15 flex items-center justify-center text-[#1db954]">
          <SpotifyLogo />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">Connecte ton compte Spotify</p>
          <p className="text-xs text-secondary mt-0.5">Importe automatiquement tes artistes suivis</p>
        </div>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="shrink-0 inline-flex items-center gap-2 bg-[#1db954] hover:bg-[#17a349] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          {connecting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <SpotifyLogo />
          )}
          {connecting ? 'Redirection…' : 'Connecter'}
        </button>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // ── Connecté ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-gradient-to-r from-[#1db954]/8 to-emerald-500/5 border border-[#1db954]/30 rounded-2xl p-4 animate-entrance">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#1db954] flex items-center justify-center text-white shadow-md">
          <SpotifyLogo />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-primary">Spotify connecté</p>
            <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
          </div>
          {importResult ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              ✅ {importResult.imported} importé{importResult.imported > 1 ? 's' : ''}
              {importResult.skipped > 0 && `, ${importResult.skipped} déjà en favoris`}
            </p>
          ) : (
            <p className="text-xs text-secondary mt-0.5">Importe tes artistes suivis en un clic</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleImport}
            disabled={importing}
            className="inline-flex items-center gap-1.5 bg-[#1db954] hover:bg-[#17a349] disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          >
            {importing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Import…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Importer
              </>
            )}
          </button>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Déconnecter Spotify"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 pl-14">{error}</p>
      )}
    </div>
  );
};

export default SpotifyConnect;
