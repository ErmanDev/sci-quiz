import React, { useState, useMemo, useEffect } from 'react';
import { PencilIcon, ChevronRightIcon, SettingsIcon } from '../icons';
import { useTranslations } from '../../hooks/useTranslations';
import { ClassData } from '../ClassCard';
import { TeacherQuiz } from '../../data/teacherQuizzes';
import EditTeacherProfileModal, { TeacherProfileData } from './EditTeacherProfileModal';
import TeacherSettingsModal from './TeacherSettingsModal';
import { TeacherDashboardView } from './TeacherBottomNav';
import { View } from '../../data/quizzes';
import { Conversation } from '../../App';
import { API_URL } from '../../server/src/config';

interface StatBoxProps {
  value: number;
  label: string;
}

const StatBox: React.FC<StatBoxProps> = ({ value, label }) => (
  <div className="bg-brand-mid-purple/70 border border-brand-light-purple/50 rounded-xl py-3 px-4 flex flex-col items-center justify-center w-24">
    <p className="text-3xl font-orbitron font-bold text-white">{value}</p>
    <p className="text-xs text-gray-300">{label}</p>
  </div>
);

interface TeacherProfileScreenProps {
  classes: ClassData[];
  quizzes: TeacherQuiz[];
  profile: TeacherProfileData;
  onSave: (newProfile: Partial<TeacherProfileData>) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  setView: (view: TeacherDashboardView) => void;
  setAppView: (view: View) => void;
}

const safeInitials = (name?: string) => {
  const n = (name || '').trim();
  if (!n) return '??';
  const parts = n.split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : n.substring(0, 2).toUpperCase();
};

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({
  classes,
  quizzes,
  profile,
  onSave,
  isDarkMode,
  onToggleDarkMode,
  setView,
  setAppView,
}) => {
  const { t } = useTranslations();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const totalClasses = Array.isArray(classes) ? classes.length : 0;
  const totalStudents = Array.isArray(classes)
    ? classes.reduce((sum, c) => sum + (Number(c?.studentCount) || 0), 0)
    : 0;
  const totalQuizzes = Array.isArray(quizzes) ? quizzes.length : 0;
  const [quizCount, setQuizCount] = useState<number>(totalQuizzes);

  useEffect(() => {
    setQuizCount(totalQuizzes);
  }, [totalQuizzes]);

  useEffect(() => {
    let cancelled = false;

    const teacherId = (() => {
      try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return (
          (parsed?.id && String(parsed.id)) ||
          (parsed?.email && String(parsed.email)) ||
          null
        );
      } catch {
        return null;
      }
    })();

    if (!teacherId) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/quizzes?teacherId=${encodeURIComponent(teacherId)}`);
        if (!res.ok) throw new Error('Failed to load quizzes');
        const data = await res.json();
        if (!cancelled) {
          setQuizCount(Array.isArray(data) ? data.length : totalQuizzes);
        }
      } catch {
        if (!cancelled) setQuizCount(totalQuizzes);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // run when profile screen mounts

  const handleSaveProfile = (newProfile: Partial<TeacherProfileData>) => {
    onSave(newProfile);
    setEditModalOpen(false);
  };

  const isModalOpen = isEditModalOpen || isSettingsModalOpen;

  return (
    <div className="relative">
      <div
        className={`w-full bg-brand-deep-purple text-white p-6 pt-10 flex flex-col items-center transition-all duration-300 ${
          isModalOpen ? 'blur-sm' : ''
        }`}
      >
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="absolute top-6 right-6 text-brand-glow"
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>

        <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-4 shadow-glow overflow-hidden">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Teacher Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-brand-accent flex items-center justify-center">
              <span className="text-6xl font-bold font-orbitron">{safeInitials(profile?.name)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">{profile?.name || 'Teacher'}</h1>
          <button onClick={() => setEditModalOpen(true)} aria-label="Edit name">
            <PencilIcon className="w-5 h-5 text-brand-glow" />
          </button>
        </div>

        <div className="text-center text-sm text-gray-300 mt-2 space-y-0.5">
          {profile?.email ? <p>{profile.email}</p> : null}
          {typeof profile?.motto === 'string' ? <p>"{profile.motto}"</p> : null}
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <StatBox value={totalClasses} label={t('classes')} />
          <StatBox value={totalStudents} label={t('students')} />
          <StatBox value={quizCount} label={t('quizzes')} />
        </div>
      </div>

      {isEditModalOpen && (
        <EditTeacherProfileModal
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProfile}
          classes={classes}
        />
      )}
      {isSettingsModalOpen && (
        <TeacherSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          setView={setView}
          setAppView={setAppView}
        />
      )}
    </div>
  );
};

export default TeacherProfileScreen;