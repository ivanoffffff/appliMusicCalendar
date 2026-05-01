import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Status = 'loading' | 'success' | 'error';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:  'Tu as refusé l\'accès à Spotify.',
  missing_params: 'Paramètres manquants dans la réponse Spotify.',
  auth_failed:    'L\'authentification a échoué. Réessaie.',
};

const SpotifyCallbackPage: React.FC = () => {
  const [searchParams]  = useSearchParams();
  const navigate         = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error   = searchParams.get('error');

    if (success === 'true') {
      setStatus('success');
      // Rediriger vers la page artistes après 2 s
      setTimeout(() => navigate('/artists', { replace: true }), 2000);
    } else {
      const msg = error ? (ERROR_MESSAGES[error] ?? `Erreur : ${error}`) : 'Erreur inconnue.';
      setErrorMsg(msg);
      setStatus('error');
      setTimeout(() => navigate('/artists', { replace: true }), 4000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1db954]/10 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-[#1db954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <p className="text-secondary">Connexion en cours…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-entrance">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Spotify connecté !</h2>
              <p className="text-sm text-secondary mt-1">Redirection vers tes artistes…</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-entrance">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Connexion échouée</h2>
              <p className="text-sm text-secondary mt-1">{errorMsg}</p>
              <p className="text-xs text-secondary mt-3">Redirection dans quelques secondes…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallbackPage;
