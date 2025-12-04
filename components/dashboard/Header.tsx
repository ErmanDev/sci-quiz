import React, { useState } from 'react';
import { ProfileData } from '../StudentDashboard';
import { useTranslations } from '../../hooks/useTranslations';
import { API_URL } from '../../server/src/config';
import { resolveAvatar, defaultAvatar } from '../../src/avatarAssets';

interface HeaderProps {
  onJoinClassClick: () => void;
  profile: Pick<ProfileData, 'name' | 'avatar' | 'level' | 'xp'>;
  xpPerLevel: number;
  studentJoinedClassIds?: string[];
  onUnenrollSuccess?: () => void;
}

const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length > 1 && names[names.length - 1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};


const Header: React.FC<HeaderProps> = ({ onJoinClassClick, profile, studentJoinedClassIds = [], onUnenrollSuccess }) => {
  const { t } = useTranslations();
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  
  // Ensure level and xp have default values to prevent NaN
  const xpPerLevel = 500;
  const xp = Number(profile.xp) || 0; 
  const level = Math.floor(xp / xpPerLevel);
  const xpForCurrentLevelStart = level > 0 ? (level - 1) * xpPerLevel : 0;
  const xpInCurrentLevel = xp - xpForCurrentLevelStart;
  const progressPercentage = xpPerLevel > 0 ? Math.max(0, Math.min(100, (xpInCurrentLevel / xpPerLevel) * 100)) : 0;

  const hasJoinedClass = studentJoinedClassIds.length > 0;

  const handleUnenroll = async () => {
    if (!window.confirm('Are you sure you want to leave this class? You will lose access to its quizzes and materials.')) {
      return;
    }

    setIsUnenrolling(true);
    try {
      const me = (() => {
        try {
          const raw = localStorage.getItem('currentUser');
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();
      
      const studentId = String(me?.id || me?.email || '');
      if (!studentId) throw new Error('Student not found');

      // Get the membership ID for the first joined class
      const classId = studentJoinedClassIds[0];
      const res = await fetch(`${API_URL}/api/class-students?classId=${encodeURIComponent(String(classId))}&studentId=${encodeURIComponent(studentId)}`);
      
      if (!res.ok) throw new Error('Failed to fetch membership');
      
      const memberships = await res.json();
      if (!Array.isArray(memberships) || memberships.length === 0) {
        throw new Error('Membership not found');
      }

      const membershipId = memberships[0].id;

      // Delete the membership
      const deleteRes = await fetch(`${API_URL}/api/class-students/${encodeURIComponent(membershipId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!deleteRes.ok) throw new Error('Failed to unenroll');

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('class:left', { 
        detail: { classId, studentId } 
      }));

      onUnenrollSuccess?.();
    } catch (err: any) {
      console.error('Unenroll failed:', err);
      alert(err?.message || 'Failed to unenroll from class');
    } finally {
      setIsUnenrolling(false);
    }
  };

  return (
    <header className="px-4 pt-8 pb-4">
      <div className="flex items-center space-x-4">
        {profile.avatar ? (
            <img
              src={resolveAvatar(profile.avatar) || profile.avatar || defaultAvatar()}
              alt="Profile Avatar"
              className="w-14 h-14 bg-brand-mid-purple rounded-lg object-cover"
            />
        ) : (
            <div className="w-14 h-14 bg-brand-accent rounded-lg flex items-center justify-center font-bold text-2xl text-white">
                {getInitials(profile.name)}
            </div>
        )}

        <div className="flex-grow">
          <h1 className="font-bold text-lg">{profile.name}</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('level')} {level}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{xpInCurrentLevel} / {xpPerLevel} XP</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-brand-mid-purple rounded-full h-1.5 mt-1">
            <div className="bg-brand-glow h-1.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
        {!hasJoinedClass ? (
          <button 
            onClick={onJoinClassClick}
            className="bg-transparent border border-gray-300 dark:border-brand-light-purple text-gray-800 dark:text-white text-sm font-semibold py-2 px-4 rounded-lg
                             hover:bg-gray-100/50 dark:hover:bg-brand-light-purple/50 transition-colors duration-300">
            {t('joinClass')}
          </button>
        ) : (
          <button 
            onClick={handleUnenroll}
            disabled={isUnenrolling}
            className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 text-sm font-semibold py-2 px-4 rounded-lg
                             hover:bg-red-500/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {isUnenrolling ? 'Leaving...' : 'Unenroll'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;