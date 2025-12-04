import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PencilIcon, SettingsIcon, LevelUpIcon, ChevronRightIcon } from '../icons';
import { Badge, BadgeCategory, badgeData } from '../../data/badges';
import EditProfileModal from './EditProfileModal';
import { ProfileData } from '../StudentDashboard';
import SettingsModal from './SettingsModal';
import { useTranslations } from '../../hooks/useTranslations';
import { DashboardView, View } from '../../data/quizzes';
import { Conversation } from '../../App';
import { achievementMessages } from '../../data/achievements';
import { resolveAvatar } from '../../src/avatarAssets';

const nameToFilename: Record<string, string> = {
  // Consistent Performer
  'Bronze Challenger': 'BC2.png',
  'Silver Contender': 'SC.png',
  'Gold Guardian': 'GG.png',
  'Diamond Dominator': 'DD1.png',

  // Apex Achiever
  'Bronze Victor': 'BV.png',
  'Silver Champion': 'SV.png',
  'Gold Conqueror': 'GC.png',
  'Diamond Deity': 'DD2.png',

  // Quiz Milestone
  'First Flight': 'FF.png',
  'Adept Apprentice': 'AA.png',
  'Seasoned Solver': 'SS2.png',
  'Veteran Voyager': 'VV.png',

  // Perfect Score
  'Flawless Start': 'FS.png',
  'Precision Pundit': 'PP.png',
  'Immaculate Intellect': 'II.png',
  'Zenith Genius': 'ZG.png',

  // Speed Responder
  'Swift Spark': 'SS.png',
  'Rapid Reflex': 'RR.png',
  'Calculated Sprint': 'CS.png',
};

const bundledImages = (() => {
  try {
    const mods = import.meta.glob('/Image/Badges/*.{png,jpg,jpeg,webp,svg,gif}', {
      eager: true,
      import: 'default',
    }) as Record<string, string>;

    const map: Record<string, string> = {};
    for (const [abs, url] of Object.entries(mods)) {
      const filename = abs.split('/').pop()!;
      map[filename] = url as string;
    }
    return map;
  } catch {
    return {} as Record<string, string>;
  }
})();

function resolveBadgeImg(badge: Badge): string {
  const guessed = nameToFilename[badge.name];
  if (guessed) {
    if (bundledImages[guessed]) return bundledImages[guessed];
    return `/Image/Badges/${guessed}`;
  }
  return badge.imgSrc;
}

interface Achievement {
  level: number;
  title: string;
  message: string;
}

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => (
  <div className="bg-white dark:bg-brand-mid-purple/80 border border-gray-200 dark:border-brand-light-purple/50 rounded-xl p-3 text-center flex flex-col justify-center items-center h-24">
    <div className="flex items-center justify-center">
      <span className="text-3xl font-bold font-orbitron text-gray-800 dark:text-white">{value}</span>
      {icon}
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{label}</span>
  </div>
);

interface ProfileScreenProps {
  profile: ProfileData;
  onSave: (newProfile: Partial<ProfileData>) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  setView: (view: DashboardView) => void;
  setAppView: (view: View) => void;
  sectionName?: string;
  badgeProgress: BadgeCategory[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onSave,
  isDarkMode,
  onToggleDarkMode,
  setView,
  setAppView,
  sectionName,
  badgeProgress,
}) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [
    selectedTitleForConfirmation,
    setSelectedTitleForConfirmation,
  ] = useState<Achievement | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const previousLevel = useRef(Math.floor((profile?.xp ?? 0) / 500));

  const { t } = useTranslations();

  const earnedAchievements = useMemo(() => {
    const achievements: Achievement[] = [];
    if (profile) {
      const xpPerLevel = 500;
      const currentLevel = Math.floor((profile.xp ?? 0) / xpPerLevel);
      for (const levelStr in achievementMessages) { 
        const level = parseInt(levelStr);
        if (currentLevel >= level) {
          achievements.push({ level, ...achievementMessages[level] });
        }
      }
    }
    return achievements.reverse();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const xpPerLevel = 500;
    const currentLevel = Math.floor((profile.xp ?? 0) / xpPerLevel);

    if (currentLevel > previousLevel.current) {
      const newAchievement = earnedAchievements.find(ach => ach.level === currentLevel);
      if (newAchievement) {
        setUnlockedAchievement(newAchievement);
      }
    }
    previousLevel.current = currentLevel;
  }, [profile?.xp, earnedAchievements]);

  const handleTitleSelect = (achievement: Achievement | null) => {
    if (achievement) {
      setSelectedTitleForConfirmation(achievement);
    } else {
      onSave({ ...profile, title: '' });
    }
  };

  const handleConfirmTitleSelection = () => {
    if (selectedTitleForConfirmation) {
      onSave({ ...profile, title: selectedTitleForConfirmation.title });
      setSelectedTitleForConfirmation(null);
    }
  };

  const earnedBadges = useMemo(() => {
    if (!badgeProgress) return [];
    return badgeProgress
      .flatMap((category) => category.badges)
      .filter((badge) => badge.progress >= badge.goal);
  }, [badgeProgress]);

  const getInitials = (name: string) => {
    const safe = (name || '').trim();
    if (!safe) return '??';
    const parts = safe.split(/\s+/);
    if (parts.length > 1 && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return safe.substring(0, 2).toUpperCase();
  };

  const handleSaveProfile = (newProfile: Partial<ProfileData>) => {
    onSave(newProfile);
    setEditModalOpen(false);
  };

  const isModalOpen = isEditModalOpen || isSettingsModalOpen || !!unlockedAchievement;

  return (
    <div className="relative">
      <div className={`space-y-6 transition-all duration-300 px-4 pt-8 ${isModalOpen ? 'blur-sm' : ''}`}>
        {/* Header/Profile */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {profile?.avatar ? (
              <img
                src={resolveAvatar(profile.avatar) || profile.avatar}
                alt="Profile Avatar"
                className="w-16 h-16 bg-brand-mid-purple rounded-lg object-cover shadow-glow"
              />
            ) : (
              <div className="w-16 h-16 bg-brand-accent rounded-lg flex items-center justify-center font-bold text-3xl text-white shadow-glow">
                {getInitials(profile?.name ?? '')}
              </div>
            )}
            <div>
              <h1 className="flex items-center space-x-2 font-bold text-xl">
                <span>{profile?.name ?? 'Student'}</span>
                <button onClick={() => setEditModalOpen(true)} aria-label="Edit name">
                  <PencilIcon />
                </button>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('bioLabel')}: "{profile?.bio ?? ''}"</p>
              {profile.title && <p className="text-sm font-semibold text-yellow-400 dark:text-yellow-300">{profile.title}</p>}
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('sectionLabel')}: {sectionName || '—'}</p>
            </div>
          </div>
          <button onClick={() => setSettingsModalOpen(true)} aria-label="Settings">
            <SettingsIcon />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard value={(profile?.xp ?? 0).toString()} label={t('xp')} />
          <StatCard
            value={Math.floor((profile?.xp ?? 0) / 500).toString()}
            label={t('level')}
            icon={<LevelUpIcon />}
          />
          <StatCard value={`${profile?.accuracy ?? 0}%`} label={t('accuracy')} />
          <StatCard value={(profile?.streaks ?? 0).toString()} label={t('streaks')} />
        </div>

        {/* Title Selector */}
        {earnedAchievements.length > 0 && profile.xp > 0 && (
          <div className="space-y-2">
            <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Title
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleTitleSelect(null)}
                className={`p-2 text-center rounded-md text-sm font-semibold transition-all ${
                  !profile.title
                    ? 'bg-brand-accent text-white shadow-glow scale-105'
                    : 'bg-white dark:bg-brand-mid-purple/80 border border-gray-200 dark:border-brand-light-purple/50 hover:bg-gray-100 dark:hover:bg-brand-mid-purple'
                }`}
              >
                -- No Title --
              </button>
              {earnedAchievements.map((achievement) => (
                <button
                  key={achievement.level}
                  onClick={() => handleTitleSelect(achievement)}
                  className={`p-2 text-center rounded-md text-sm font-semibold truncate transition-all ${
                    profile.title === achievement.title
                      ? 'bg-brand-accent text-white shadow-glow scale-105'
                      : 'bg-white dark:bg-brand-mid-purple/80 border border-gray-200 dark:border-brand-light-purple/50 hover:bg-gray-100 dark:hover:bg-brand-mid-purple'
                  }`}
                >
                  {achievement.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold font-orbitron text-brand-glow">{t('badges')}</h2>
            <button onClick={() => setView('badges')} className="text-sm font-semibold text-brand-accent hover:underline">
              {t('viewAll')}
            </button>
          </div>
          <div className="bg-white dark:bg-brand-mid-purple/30 rounded-2xl border border-gray-200 dark:border-brand-light-purple/50 p-4 shadow-lg">
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center justify-start text-center">
                    <div
                      className="w-16 h-16 bg-gray-100 dark:bg-black/20 rounded-lg flex items-center justify-center p-1 mb-1"
                    >
                      <img src={resolveBadgeImg(badge)} alt={badge.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-tight break-words w-16">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noBadgesEarned')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          setView={setView}
          setAppView={setAppView}
        />
      )}

      {selectedTitleForConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div 
            className="w-full max-w-sm rounded-2xl p-[3px] bg-gradient-to-b from-blue-500 to-brand-accent shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#21103F] rounded-[14px] p-6 flex flex-col items-center text-white">
              <h3 className="text-xl font-bold font-orbitron text-brand-glow mb-2">
                {selectedTitleForConfirmation.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">Unlocked at Level {selectedTitleForConfirmation.level}</p>
              <p className="text-gray-300 mb-6 text-center">
                {selectedTitleForConfirmation.message}
              </p>
              <div className="flex justify-center space-x-4 w-full">
                <button
                  onClick={() => setSelectedTitleForConfirmation(null)}
                  className="w-full bg-[#3D2569] text-white font-semibold py-3 rounded-lg transition-colors hover:bg-brand-light-purple"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTitleSelection}
                  className="w-full bg-brand-accent text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-opacity-90 hover:shadow-glow"
                >
                  Display
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {unlockedAchievement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div 
            className="w-full max-w-sm rounded-2xl p-[3px] bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#21103F] rounded-[14px] p-6 flex flex-col items-center text-white">
              <h3 className="text-2xl font-bold font-orbitron text-yellow-300 mb-2">
                Achievement Unlocked!
              </h3>
              <p className="text-lg font-semibold text-gray-200 mb-4">You've earned the title: "{unlockedAchievement.title}"</p>
              <p className="text-gray-300 mb-6 text-center">
                {unlockedAchievement.message}
              </p>
              <button
                onClick={() => setUnlockedAchievement(null)}
                className="w-full bg-brand-accent text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-opacity-90 hover:shadow-glow"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;