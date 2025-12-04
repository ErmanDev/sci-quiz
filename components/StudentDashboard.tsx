import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Header from './dashboard/Header';
import NotificationCard from './dashboard/NotificationCard';
import BottomNav from './dashboard/BottomNav';
import { BellIcon, EnvelopeIcon, UserAddIcon } from './icons';
import JoinClassModal from './dashboard/JoinClassModal';
import { DashboardView, View, DoneQuiz, Quiz } from '../data/quizzes';
import QuizzesScreen from './dashboard/QuizzesScreen';
import RankingsScreen from './dashboard/RankingsScreen';
import BadgesScreen from './dashboard/BadgesScreen';
import ProfileScreen from './dashboard/ProfileScreen';
import { useTranslations } from '../hooks/useTranslations';
import ChatHubScreen from './dashboard/MessagesScreen';
import { ClassData } from './teacher/ClassroomScreen';
import QuizTakingScreen from './quiz/QuizTakingScreen';
import QuizCompletedScreen from './quiz/QuizCompletedScreen';
import { Badge, BadgeCategory } from '../data/badges';
import StudentQuizDetailModal from './dashboard/StudentQuizDetailModal';
import { TeacherQuiz } from '../data/teacherQuizzes';
import { ClassStudent } from '../data/classStudentData';
import TeamPlayersModal from './quiz/TeamPlayersModal';
import { Conversation, ChatMessage } from '../App';
import { TeacherProfileData } from './teacher/EditTeacherProfileModal';
import { API_URL } from '../server/src/config';
import track1 from '../Image/BG MUSIC/SQ1.mp3';
import track2 from '../Image/BG MUSIC/SQ2.mp3';
import track3 from '../Image/BG MUSIC/SQ3.mp3';

// Types matching backend
type Announcement = {
  id: string;
  title: string;
  body: string;
  senderId: string;
  classId?: string;
  date: string; // ISO
};

type NotificationDoc = {
  id: string;
  title: string;
  body: string;
  recipientType: 'class' | 'user' | 'all';
  recipientId?: string | null;
  createdAt: string; // ISO
  createdBy: string;
  read: boolean;
  quizId?: string | number;
};

// Data loaders
async function fetchAnnouncementsForStudent(studentId: string): Promise<Announcement[]> {
  const res = await fetch(`${API_URL}/api/announcements?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error('Failed to load announcements');
  return res.json();
}

async function fetchNotificationsForStudent(studentId: string): Promise<NotificationDoc[]> {
  const res = await fetch(`${API_URL}/api/notifications?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

async function deleteNotificationById(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete notification');
}

interface StudentDashboardProps {
  activeView: DashboardView;
  setView: (view: DashboardView) => void;
  setAppView: (view: View) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  classes: ClassData[];
  onAddStudentToClass: (classId: string, studentProfile: ProfileData) => void;
  newQuizzes: Quiz[];
  missedQuizzes: Quiz[];
  doneQuizzes: DoneQuiz[];
  takingQuiz: (Quiz & { teamMembers?: string[] }) | null;
  onTakeQuiz: (quiz: (Quiz & { teamMembers?: string[] })) => void;
  onQuizComplete: (quizId: number, results: { questionId: number; wasCorrect: boolean }[], teamMembers?: string[], expInfo?: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number }) => void;
  badgeProgress: BadgeCategory[];
  lastCompletedQuizStats: { quiz: DoneQuiz; earnedBadges: Badge[]; expInfo?: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number } } | null;
  onDismissCompletionScreen: () => void;
  profile: ProfileData;
  onSaveProfile: (newProfile: Partial<ProfileData>) => void;
  xpPerLevel: number;
  reportsData: any;
  classRosters: Record<string, ClassStudent[]>;
  studentJoinedClassIds: string[];
  postedQuizzes: TeacherQuiz[];
  teamsData: any;
  conversations: Conversation[];
  onSendMessage: (participant1: string, participant2: string, newMessage: Omit<ChatMessage, 'id'>) => void;
  onSendMessageToConversation: (conversationId: string, newMessage: Omit<ChatMessage, 'id'>) => void;
  teacherProfile: TeacherProfileData;
}

export interface ProfileData {
    name: string;
    bio: string;
    avatar: string | null;
    level: number;
    xp: number;
    accuracy: number;
    streaks: number;
    title?: string;
}

interface Notification {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  type: 'announcement' | 'local';
  date?: string;
}

export interface Track {
    id: number;
    name: string;
    type: 'default' | 'uploaded';
    src: string;
}

export const defaultMusic: Track[] = [
    { id: 1, name: 'SQ1.mp3', type: 'default', src: track1 },
    { id: 2, name: 'SQ2.mp3', type: 'default', src: track2 },
    { id: 3, name: 'SQ3.mp3', type: 'default', src: track3 },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
    activeView, setView, setAppView, isDarkMode, onToggleDarkMode, 
    classes, onAddStudentToClass, newQuizzes, missedQuizzes, doneQuizzes, takingQuiz, onTakeQuiz, onQuizComplete,
    badgeProgress, lastCompletedQuizStats, onDismissCompletionScreen, profile, onSaveProfile,
    xpPerLevel, reportsData, classRosters, studentJoinedClassIds, postedQuizzes, teamsData,
    conversations, onSendMessage, onSendMessageToConversation, teacherProfile
}) => {
  const { t } = useTranslations();
  const [isJoinClassModalOpen, setJoinClassModalOpen] = useState(false);
  const [quizToViewDetails, setQuizToViewDetails] = useState<DoneQuiz | null>(null);
  const [quizForTeamSetup, setQuizForTeamSetup] = useState<Quiz | null>(null);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  // Background Music State
  const [musicTracks, setMusicTracks] = useState<Track[]>(defaultMusic);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(defaultMusic[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(60);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = useMemo(() => musicTracks.find(t => t.id === currentTrackId), [musicTracks, currentTrackId]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  useEffect(() => {
      if (audioRef.current) {
          if (isPlaying) {
              audioRef.current.play().catch(e => console.error("Audio play failed:", e));
          } else {
              audioRef.current.pause();
          }
      }
  }, [isPlaying, currentTrackId]);

  const studentId: string | null = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      const u = raw ? JSON.parse(raw) : null;
      return (u?.id && String(u.id)) || (u?.email && String(u.email)) || null;
    } catch {
      return null;
    }
  }, []);

  const loadAll = useCallback(async () => {
    if (!studentId) {
      setErr('Not logged in.');
      setLoading(false);
      return;
    }
    try {
      setErr('');
      setLoading(true);
      const [anns, notifs] = await Promise.all([
        fetchAnnouncementsForStudent(studentId),
        fetchNotificationsForStudent(studentId),
      ]);

      anns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setAnnouncements(anns);
      setNotifications(notifs);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const handleDeleteNotificationBackend = async (id: string) => {
    try {
      await deleteNotificationById(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete notification');
    }
  };

  useEffect(() => {
    loadAll();
    // Refresh when "class:joined" event fires
    const onJoined = () => loadAll();
    window.addEventListener('class:joined', onJoined as EventListener);
    return () => { window.removeEventListener('class:joined', onJoined as EventListener); };
  }, [loadAll]);
  
  const studentConversations = useMemo(() => {
    return conversations.filter(c => 
        c.participantNames.includes(profile.name) || 
        (c.id.startsWith('class-') && studentJoinedClassIds.includes(c.id.split('-')[1]))
    );
  }, [conversations, profile.name, studentJoinedClassIds]);
  
  const latestMessage = useMemo(() => {
    if (studentConversations.length === 0) return null;
    const mostRecentConversation = studentConversations[0];
    if (mostRecentConversation.messages.length === 0) return null;
    return mostRecentConversation.messages[mostRecentConversation.messages.length - 1];
  }, [studentConversations]);
  
  const handleDismissNotification = (id: number) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleJoinClassSuccess = (classData: ClassData) => {
      onAddStudentToClass(classData.id, profile);
      const newNotification: Notification = {
          id: Date.now(),
          icon: <UserAddIcon />,
          title: 'Class Joined!',
          subtitle: `You've successfully joined ${classData.name} - ${classData.section}.`,
          description: "You'll now get updates from this class.",
          type: 'local'
      };
      setLocalNotifications(prev => [newNotification, ...prev]);
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    const quizDetails = postedQuizzes.find(q => String(q.id) === String(quiz.id));
    if (quizDetails?.mode === 'Team') {
        setQuizForTeamSetup(quiz);
    } else {
        onTakeQuiz(quiz);
    }
  };

  const handleTeamSetupDone = (teamName: string, members: string[]) => {
    if (quizForTeamSetup) {
        console.log(`Team \"${teamName}\" created with members: ${members.join(', ')} for quiz \"${quizForTeamSetup.topic}\"`);
        onTakeQuiz({ ...quizForTeamSetup, teamMembers: members });
        setQuizForTeamSetup(null);
    }
  };


  if (takingQuiz) {
    return <QuizTakingScreen 
      quiz={takingQuiz} 
      onQuizComplete={onQuizComplete}
      classRosters={classRosters}
    />;
  }
  
  if (lastCompletedQuizStats) {
      let completionQuizScores: { name: string; score: string }[] = [];
      let currentUserTeamName: string | undefined = undefined;

      // Ensure reportsData has default structure to prevent errors
      const safeReportsData = reportsData || {
        singleQuizStudentScores: [],
        allQuizzesStudentScores: [],
      };

      if (lastCompletedQuizStats.quiz.mode === 'Team') {
          const currentClassId = studentJoinedClassIds[0];
          const classTeams = teamsData[currentClassId as keyof typeof teamsData] || {};
          
          for (const teamName in classTeams) {
              if (classTeams[teamName].includes(profile.name)) {
                  currentUserTeamName = teamName;
                  break;
              }
          }

          completionQuizScores = Object.entries(classTeams).map(([teamName, members]: [string, any[]]) => {
              let totalScore = 0;
              let memberCount = 0;
              members.forEach(memberName => {
                  const scoreData = safeReportsData.singleQuizStudentScores?.find(
                      (s: any) => s.name === memberName && s.quizNumber === lastCompletedQuizStats.quiz.id
                  );
                  if (scoreData) {
                      totalScore += parseFloat(scoreData.score);
                      memberCount++;
                  }
              });
              const avgScore = memberCount > 0 ? (totalScore / memberCount).toFixed(0) : '0';
              return { name: teamName, score: `${avgScore}%` };
          });
      } else {
          completionQuizScores = (safeReportsData.singleQuizStudentScores || []).filter(
              (s: any) => s.quizNumber === lastCompletedQuizStats.quiz.id
          );
      }

      return <QuizCompletedScreen 
        stats={lastCompletedQuizStats} 
        onDone={onDismissCompletionScreen} 
        profileName={profile.name}
        quizScores={completionQuizScores}
        quizMode={lastCompletedQuizStats.quiz.mode}
        currentUserTeamName={currentUserTeamName}
      />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'quizzes':
        return <QuizzesScreen newQuizzes={newQuizzes} missedQuizzes={missedQuizzes} doneQuizzes={doneQuizzes} onTakeQuiz={handleTakeQuiz} onViewDetails={setQuizToViewDetails} />;
      case 'rankings':
        return <RankingsScreen 
                    profile={profile} 
                    reportsData={reportsData}
                    classRosters={classRosters}
                    studentJoinedClassIds={studentJoinedClassIds}
                    postedQuizzes={postedQuizzes}
                    teamsData={teamsData}
                />;
      case 'badges':
        return <BadgesScreen badgeProgress={badgeProgress} />;
      case 'profile':
        return (
          <ProfileScreen 
            profile={profile} 
            onSave={onSaveProfile} 
            isDarkMode={isDarkMode} 
            onToggleDarkMode={onToggleDarkMode}
            setView={setView} 
            setAppView={setAppView}
            onViewMessages={() => setView('chat')}
            conversations={studentConversations}
            sectionName={(() => {
              const firstJoined = studentJoinedClassIds[0];
              const cls = classes.find(c => String(c.id) === String(firstJoined));
              return cls ? `${cls.name}${cls.section ? ' - ' + cls.section : ''}` : undefined;
            })()}
            badgeProgress={badgeProgress}
            musicProps={{
                musicTracks,
                setMusicTracks,
                currentTrackId,
                setCurrentTrackId,
                isPlaying,
                setIsPlaying,
                musicVolume,
                setMusicVolume,
            }}
          />
        );
      case 'chat':
        return (
          <ChatHubScreen 
            userRole="student"
            currentUser={profile}
            conversations={studentConversations}
            contacts={[{name: teacherProfile.name}]}
            onSendMessage={onSendMessage}
            onSendMessageToConversation={onSendMessageToConversation}
            onBack={() => setView('profile')}
          />
        );
      case 'home':
      default:
        // Filter classes that the student has joined
        const joinedClasses = classes.filter(c => studentJoinedClassIds.includes(String(c.id)));
        
        if (loading) {
          return <div className="p-4 text-center text-gray-500">Loading...</div>;
        }

        if (err) {
          return <div className="p-4 text-center text-red-400">{err}</div>;
        }

        return (
          <div className="space-y-4">
            {/* Joined Classes Section */}
            {joinedClasses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                  {t('myClasses') || 'My Classes'}
                </h2>
                <div className="space-y-3">
                  {joinedClasses.map((classData) => (
                    <div
                      key={classData.id}
                      className="bg-gradient-to-r from-brand-mid-purple/90 to-brand-mid-purple/70 rounded-xl p-4 text-white border border-brand-light-purple/50 shadow-md"
                    >
                      <h3 className="font-bold text-lg mb-1">
                        {classData.name}{classData.section ? ` - ${classData.section}` : ''}
                      </h3>
                      <p className="text-sm opacity-90">
                        {t('classCode')}: {classData.code}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local notifications */}
            {localNotifications.map((notification) => (
              <NotificationCard
                  key={notification.id}
                  icon={notification.icon}
                  title={notification.title}
                  subtitle={notification.subtitle}
                  description={notification.description}
                  onDismiss={() => handleDismissNotification(notification.id)}
              />
            ))}

            {/* Message notification */}
            {latestMessage && latestMessage.senderName !== profile.name && (
              <NotificationCard
                icon={<EnvelopeIcon />}
                title={t('message')}
                subtitle={`New message from ${latestMessage.senderName}`}
                description={latestMessage.text}
                onClick={() => setView('chat')}
              />
            )}

            {/* Notifications from backend */}
            <div className="bg-white dark:bg-brand-mid-purple/80 rounded-2xl p-4">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <BellIcon /> {t('notification') || 'Notifications'}
              </h2>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">{t('No notifications yet.')}</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <NotificationCard
                      key={n.id}
                      icon={<BellIcon />}
                      title={n.title || 'Notification'}
                      subtitle={new Date(n.createdAt).toLocaleString()}
                      description={n.body}
                      onDismiss={() => handleDeleteNotificationBackend(n.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Announcements from backend */}
            <div className="bg-white dark:bg-brand-mid-purple/80 rounded-2xl p-4">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <EnvelopeIcon /> {t('announcement') || 'Announcements'}
              </h2>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500">{t('No announcements yet.')}</p>
              ) : (
                <div className="space-y-2">
                  {announcements.map(a => (
                    <NotificationCard
                      key={a.id}
                      icon={<EnvelopeIcon />}
                      title={a.title || 'Announcement'}
                      subtitle={new Date(a.date).toLocaleString()}
                      description={a.body}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  }
  
  const isFullScreenView = activeView === 'profile' || activeView === 'chat';

  const handleUnenrollSuccess = () => {
    // Reload page or update state to reflect the unenroll
    window.location.reload();
  };

  const currentClassId = studentJoinedClassIds.length > 0 ? studentJoinedClassIds[0] : undefined;

  return (
    <div className="w-full max-w-sm mx-auto h-screen flex flex-col text-gray-800 dark:text-white font-sans overflow-hidden">
      {currentTrack && <audio ref={audioRef} src={currentTrack.src} loop />}
      {!isFullScreenView && (
        <Header 
          profile={profile} 
          onJoinClassClick={() => setJoinClassModalOpen(true)} 
          xpPerLevel={xpPerLevel}
          studentJoinedClassIds={studentJoinedClassIds}
          onUnenrollSuccess={handleUnenrollSuccess}
        />
      )}
      <main className={`flex-grow overflow-y-auto pb-24 hide-scrollbar ${!isFullScreenView ? 'p-4 space-y-4' : ''}`}>
        {renderContent()}
      </main>
      <BottomNav activeView={activeView} onNavigate={setView} />
      <JoinClassModal 
        isOpen={isJoinClassModalOpen} 
        onClose={() => setJoinClassModalOpen(false)}
        onJoinSuccess={handleJoinClassSuccess}
      />
      <StudentQuizDetailModal
        isOpen={!!quizToViewDetails}
        quiz={quizToViewDetails}
        onClose={() => setQuizToViewDetails(null)}
      />
      <TeamPlayersModal
        isOpen={!!quizForTeamSetup}
        onClose={() => setQuizForTeamSetup(null)}
        onDone={handleTeamSetupDone}
        studentName={profile.name}
        classRoster={currentClassId ? classRosters[currentClassId] || [] : []}
        teams={currentClassId ? teamsData[currentClassId] || {} : {}}
        currentQuizId={quizForTeamSetup?.id}
      />
    </div>
  );
};

export default StudentDashboard;