// components/dashboard/QuizzesScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { NewQuizIcon, MissedQuizIcon, DoneQuizzesIcon } from '../icons';
import OutlineButton from '../OutlineButton';
import { useTranslations } from '../../hooks/useTranslations';
import { API_URL } from '../../server/src/config';
import StudentQuizDetailModal from './StudentQuizDetailModal';

// ---------- Minimal types ----------
type QuizMode = 'Solo' | 'Team' | 'Classroom';
type QuizType = 'Card Game' | 'Board Game' | 'Normal';

export interface ServerQuiz {
  id: string | number;
  title: string;
  type: QuizType;
  mode: QuizMode;
  status: 'draft' | 'posted';
  teacherId: string;
  questions: Array<{ id: string | number; points: number; question: string; type: string; answer: string; options?: string[] }>;
  classIds?: string[];
  dueDate?: string;
}

export interface ServerSubmission {
  id: string;
  quizId: string | number;
  studentId: string;
  score: number;
  submittedAt: string;
}

export interface ClientQuizNew {
  id: string | number;
  topic: string;
  subpart: string;
  dueDate?: string;
}

export interface ClientQuizDone extends ClientQuizNew {
  score: string;
}

// ---------- UI ----------
interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'bg-gradient-to-r from-blue-500 to-brand-accent';
  const inactiveClasses = 'bg-gray-200 dark:bg-brand-mid-purple/60';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-24 h-20 rounded-xl space-y-1 transition-all duration-300 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className={`text-xs font-semibold ${isActive ? 'text-white' : ''}`}>{label}</span>
    </button>
  );
};

const formatPrettyDue = (iso?: string) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(d);
  } catch {
    return 'Invalid Date';
  }
};

const QuizItem: React.FC<{
  quiz: ClientQuizNew | ClientQuizDone;
  status: 'new' | 'missed' | 'done';
  onTakeQuiz?: (quiz: ClientQuizNew) => void;
  onViewDetails?: (quiz: ClientQuizDone) => void;
}> = ({ quiz, status, onTakeQuiz, onViewDetails }) => {
  const { t } = useTranslations();

  const take = () => {
    if (status === 'new' && onTakeQuiz) {
      onTakeQuiz(quiz as ClientQuizNew);
    }
  };
  const view = () => {
    if (status === 'done' && onViewDetails) onViewDetails(quiz as ClientQuizDone);
  };

  return (
    <div className="py-3 border-b border-gray-200 dark:border-brand-light-purple/30 last:border-b-0">
      <div className="flex justify-between items-center space-x-4">
        <div>
          <h4 className="font-bold text-lg font-orbitron">{quiz.topic}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{(quiz as any).subpart}</p>
          {status !== 'done' && quiz.dueDate && (
            <p className="text-xs text-red-400 mt-1">
              {t('due') || 'Due'}: {formatPrettyDue(quiz.dueDate)}
            </p>
          )}
        </div>

        {status === 'missed' && (
          <div className="w-24 flex-shrink-0">
            <button className="w-full bg-transparent border border-red-500 text-red-500 font-semibold py-1 px-3 rounded-lg text-sm cursor-default" disabled>
              {t('missed')}
            </button>
          </div>
        )}

        {status === 'done' && (
          <div className="text-right">
            <p className="font-bold text-lg text-brand-glow">{(quiz as ClientQuizDone).score}</p>
            <button onClick={view} className="text-xs text-gray-500 dark:text-gray-400 hover:underline bg-transparent border-none">
              {t('viewDetails')}
            </button>
          </div>
        )}

        {status === 'new' && (
          <div className="w-28 flex-shrink-0">
            <OutlineButton onClick={take}>{t('takeQuiz')}</OutlineButton>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Component ----------
interface QuizzesScreenProps {
  onTakeQuiz: (quiz: any) => void;
  onViewDetails: (quiz: ClientQuizDone) => void;
}

const QuizzesScreen: React.FC<QuizzesScreenProps> = ({ onTakeQuiz, onViewDetails }) => {
  const { t } = useTranslations();
  const [activeFilter, setActiveFilter] = useState<'new' | 'missed' | 'done'>('new');

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  const [allQuizzes, setAllQuizzes] = useState<ServerQuiz[]>([]);
  const [newQuizzes, setNewQuizzes] = useState<ClientQuizNew[]>([]);
  const [missedQuizzes, setMissedQuizzes] = useState<ClientQuizNew[]>([]);
  const [doneQuizzes, setDoneQuizzes] = useState<ClientQuizDone[]>([]);

  const [selectedQuiz, setSelectedQuiz] = useState<ClientQuizDone | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (quiz: ClientQuizDone) => {
    setSelectedQuiz(quiz);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailModalOpen(false);
    setSelectedQuiz(null);
  };

  const handleTakeQuizWrapper = (quiz: ClientQuizNew) => {
    const quizToTake = allQuizzes.find(q => q.id === quiz.id);
    if (quizToTake) {
      onTakeQuiz(quizToTake);
    } else {
      console.error("Could not find quiz details to take quiz.");
    }
  };

  const getCurrentStudent = () => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const processQuizzes = (quizzes: ServerQuiz[], submissions: ServerSubmission[]) => {
    const submittedIds = new Set(submissions.map(s => s.quizId));
    const now = new Date();

    const newQs: ClientQuizNew[] = [];
    const missedQs: ClientQuizNew[] = [];
    const doneQs: ClientQuizDone[] = [];

    quizzes.forEach(q => {
      const clientQuiz = {
        id: q.id,
        topic: q.title,
        subpart: `${q.type} - ${q.mode}`,
        dueDate: q.dueDate,
      };

      if (submittedIds.has(q.id)) {
        const submission = submissions.find(s => s.quizId === q.id)!;
        const totalQuestions = q.questions?.length || 0;
        doneQs.push({
          ...clientQuiz,
          score: `${submission.score}/${totalQuestions}`,
        });
      } else {
        const isMissed = q.dueDate ? new Date(q.dueDate) < now : false;
        if (isMissed) {
          missedQs.push(clientQuiz);
        } else {
          newQs.push(clientQuiz);
        }
      }
    });

    return { newQs, missedQs, doneQs };
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr('');

        const me = getCurrentStudent();
        if (!me) throw new Error('Please log in.');
        const studentId: string = String(me.id || me.email || me.name || 'student');

        const rosterRes = await fetch(`${API_URL}/api/class-students?studentId=${encodeURIComponent(studentId)}`);
        if (!rosterRes.ok) throw new Error('Failed to load class roster');
        const roster: Array<{ classId: string }> = await rosterRes.json();
        const classIds = Array.from(new Set((roster || []).map(r => String(r.classId))));

        const qRes = await fetch(`${API_URL}/api/quizzes?status=posted&classId=${encodeURIComponent(classIds.join(','))}`);
        if (!qRes.ok) throw new Error('Failed to load quizzes');
        const allPosted: ServerQuiz[] = await qRes.json();
        setAllQuizzes(allPosted);

        const filteredPosted = allPosted.filter(q => {
          const quizClassIds = Array.isArray(q.classIds) ? q.classIds : [];
          return quizClassIds.length > 0 && classIds.length > 0 && quizClassIds.some(cid => classIds.includes(String(cid)));
        });

        const sRes = await fetch(`${API_URL}/api/submissions?studentId=${encodeURIComponent(studentId)}`);
        if (!sRes.ok) throw new Error('Failed to load submissions');
        const submissions: ServerSubmission[] = await sRes.json();

        const { newQs, missedQs, doneQs } = processQuizzes(filteredPosted, submissions);
        setNewQuizzes(newQs);
        setMissedQuizzes(missedQs);
        setDoneQuizzes(doneQs);

      } catch (e: any) {
        setErr(e?.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quizzesToDisplay = useMemo(() => {
    switch (activeFilter) {
      case 'new': return newQuizzes;
      case 'missed': return missedQuizzes;
      case 'done': return doneQuizzes;
      default: return [];
    }
  }, [activeFilter, newQuizzes, missedQuizzes, doneQuizzes]);

  return (
    <div className="space-y-6">
      <div className="flex justify-around">
        <FilterButton icon={<NewQuizIcon />} label={t('New')} isActive={activeFilter === 'new'} onClick={() => setActiveFilter('new')} />
        <FilterButton icon={<MissedQuizIcon />} label={t('missed')} isActive={activeFilter === 'missed'} onClick={() => setActiveFilter('missed')} />
        <FilterButton icon={<DoneQuizzesIcon />} label={t('done')} isActive={activeFilter === 'done'} onClick={() => setActiveFilter('done')} />
      </div>

      <div>
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
        ) : err ? (
          <p className="text-center text-red-500 py-8">Error: {err}</p>
        ) : quizzesToDisplay.length > 0 ? (
          quizzesToDisplay.map(quiz => (
            <QuizItem
              key={quiz.id}
              quiz={quiz}
              status={activeFilter}
              onTakeQuiz={handleTakeQuizWrapper}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noQuizzes')}</p>
        )}
      </div>
      <StudentQuizDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetails}
        quiz={selectedQuiz}
        serverQuiz={allQuizzes.find(q => q.id === selectedQuiz?.id) ?? null}
      />
    </div>
  );
};

export default QuizzesScreen;