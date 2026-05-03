import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SpotifyConnect from '../components/artists/SpotifyConnect';
import {
  BellIcon,
  MailIcon,
  MusicalNotesIcon,
  DiscIcon,
  MusicNoteIcon,
  VinylIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SaveIcon,
  LogoutIcon,
} from '../components/ui/Icons';

interface NotificationPreferences {
  emailNotifications: boolean;
  notificationTypes: {
    newAlbum: boolean;
    newSingle: boolean;
    newCompilation: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  weeklySummary?: boolean;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
      checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-2xl p-5 space-y-4 dark:backdrop-blur-sm">
    {children}
  </div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-1">
    {icon}
    <h3 className="text-sm font-bold text-primary">{children}</h3>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const NotificationSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    notificationTypes: { newAlbum: true, newSingle: true, newCompilation: true },
    frequency: 'immediate',
    weeklySummary: true,
  });
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving,  setIsSaving]    = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => { loadPreferences(); }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getPreferences();
      if (response.success && response.data) {
        setPreferences({ ...response.data, weeklySummary: response.data.weeklySummary ?? true });
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      const response = await notificationService.updatePreferences(preferences);
      setSaveStatus(response.success ? 'success' : 'error');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Header />
        <LoadingSpinner size="lg" type="musical" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-5">

        {/* ── En-tête ── */}
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2 mb-1">
            <BellIcon className="w-6 h-6 text-primary-500 shrink-0" />
            Paramètres
          </h1>
          <p className="text-secondary text-sm">Notifications et préférences du compte</p>
        </div>

        {/* ── Profil ── */}
        <Card>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-primary truncate">{user?.firstName || user?.username}</p>
              <p className="text-xs text-secondary truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer ml-auto"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </Card>

        {/* ── Spotify ── */}
        <SpotifyConnect />

        {/* ── Feedback sauvegarde ── */}
        {saveStatus !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-entrance ${
            saveStatus === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400'
          }`}>
            {saveStatus === 'success'
              ? <><CheckCircleIcon className="w-4 h-4 shrink-0" /> Préférences enregistrées !</>
              : <><XCircleIcon className="w-4 h-4 shrink-0" /> Erreur lors de l'enregistrement</>
            }
          </div>
        )}

        {/* ── Notifications email ── */}
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <SectionTitle icon={<MailIcon className="w-4 h-4 text-primary-500 shrink-0" />}>
                Notifications par email
              </SectionTitle>
              <p className="text-xs text-secondary">Recevoir des emails pour les nouvelles sorties</p>
            </div>
            <Toggle
              checked={preferences.emailNotifications}
              onChange={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
            />
          </div>
        </Card>

        {/* ── Types de sorties ── */}
        <Card>
          <SectionTitle icon={<MusicalNotesIcon className="w-4 h-4 text-primary-500 shrink-0" />}>
            Types de sorties à suivre
          </SectionTitle>
          <div className="space-y-2">
            {[
              { key: 'newAlbum',       Icon: DiscIcon,      color: 'text-violet-500', label: 'Albums',           sub: 'Albums complets' },
              { key: 'newSingle',      Icon: MusicNoteIcon, color: 'text-emerald-500', label: 'Singles',          sub: 'Singles et morceaux' },
              { key: 'newCompilation', Icon: VinylIcon,     color: 'text-blue-500',    label: 'Compilations & EP', sub: 'EP et compilations' },
            ].map(({ key, Icon, color, label, sub }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/8 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">{label}</p>
                  <p className="text-xs text-secondary">{sub}</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notificationTypes[key as keyof typeof preferences.notificationTypes]}
                  onChange={e => setPreferences(p => ({
                    ...p,
                    notificationTypes: { ...p.notificationTypes, [key]: e.target.checked },
                  }))}
                  className="h-4 w-4 shrink-0 text-primary-500 rounded focus:ring-primary-400 accent-primary-500"
                />
              </label>
            ))}
          </div>
        </Card>

        {/* ── Fréquence ── */}
        <Card>
          <SectionTitle icon={<ClockIcon className="w-4 h-4 text-primary-500 shrink-0" />}>
            Fréquence
          </SectionTitle>
          <div className="space-y-2">
            {[
              { value: 'immediate', label: 'Immédiatement', sub: 'Dès qu\'une sortie est détectée' },
              { value: 'daily',     label: 'Quotidien',     sub: 'Un résumé chaque jour' },
              { value: 'weekly',    label: 'Hebdomadaire',  sub: 'Un résumé chaque semaine' },
            ].map(({ value, label, sub }) => (
              <label
                key={value}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/8 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="frequency"
                  value={value}
                  checked={preferences.frequency === value}
                  onChange={e => setPreferences(p => ({ ...p, frequency: e.target.value as typeof p.frequency }))}
                  className="h-4 w-4 shrink-0 text-primary-500 accent-primary-500"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{label}</p>
                  <p className="text-xs text-secondary">{sub}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* ── Résumé hebdo ── */}
        {preferences.frequency !== 'weekly' && (
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <SectionTitle icon={<ChartBarIcon className="w-4 h-4 text-primary-500 shrink-0" />}>
                  Résumé hebdomadaire
                </SectionTitle>
                <p className="text-xs text-secondary">Récapitulatif chaque semaine en plus des notifications</p>
              </div>
              <Toggle
                checked={!!preferences.weeklySummary}
                onChange={() => setPreferences(p => ({ ...p, weeklySummary: !p.weeklySummary }))}
              />
            </div>
          </Card>
        )}

        {/* ── Boutons action ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={loadPreferences}
            className="flex-1 sm:flex-none px-5 py-2.5 btn-secondary rounded-xl text-sm font-semibold cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={savePreferences}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 btn-primary rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving
              ? <><LoadingSpinner size="sm" /><span>Enregistrement…</span></>
              : <><SaveIcon className="w-4 h-4" /><span>Enregistrer</span></>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotificationSettingsPage;
