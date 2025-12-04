// screens/quiz/QuizTakingScreen.tsx
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../../server/src/config';
import { Question, MultipleChoiceQuestion, IdentificationQuestion } from '../../data/teacherQuizQuestions';
import backCard from '../../Image/CARD BG/Backcard.png';
import frontCard from '../../Image/CARD BG/Frontcard.png';
import QuizCompletedScreen from './QuizCompletedScreen';
import { DoneQuiz } from '../../data/quizzes';
import { Badge } from '../../data/badges';

type QuizType = 'Card Game' | 'Board Game' | 'Normal';

type PlayQuiz = {
  id: number | string;
  topic: string;
  subpart: QuizType;
  teamMembers?: string[];
  questions: Question[];
};

interface QuizTakingScreenProps {
  quizId: string | number;
  teamMembers?: string[];
  onQuizComplete: (
    quizId: number | string,
    results: { questionId: number; wasCorrect: boolean }[],
    teamMembers?: string[],
    expInfo?: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number },
    summary?: { score: number; total: number; percent: number; results: { questionId: number; wasCorrect: boolean }[] },
    resultScreenAlreadyShown?: boolean
  ) => void;
}

const FeedbackModal: React.FC<{
  isOpen: boolean;
isCorrect: boolean;
  questionText: string;
  correctAnswer: string;
  onNext: () => void;
}> = ({ isOpen, isCorrect, questionText, correctAnswer, onNext }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-xs rounded-2xl p-6 flex flex-col items-center border ${isCorrect ? 'border-green-400' : 'border-red-500'} bg-brand-mid-purple`}>
        <h3 className={`text-3xl font-bold font-orbitron ${isCorrect ? 'text-green-400' : 'text-red-500'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
        <p className="text-gray-400 text-sm mt-4 text-center">{questionText}</p>
        <p className="text-gray-300 mt-2">The correct answer is:</p>
        <p className="font-bold text-lg text-brand-glow my-2 text-center">{correctAnswer}</p>
        <button onClick={onNext} className="mt-6 w-full bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 hover:shadow-glow">Next</button>
      </div>
    </div>
  );
};

const FlippableCard: React.FC<{
  isFlipped: boolean;
  onFlip: () => void;
  children: React.ReactNode;
}> = ({ isFlipped, onFlip, children }) => {
  return (
    <div className="w-[350px] mx-auto" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-[580px] transition-transform duration-700`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={!isFlipped ? onFlip : undefined}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
          <img src={backCard} alt="Card Back" className="w-full h-full object-cover" />
        </div>

        {/* Card Front */}
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${frontCard})` }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center p-6 overflow-y-auto">
              {children}
            </div>
          </div>
</div>
      </div>
    </div>
  );
};

/**
 * Generates a square grid of letters with a given answer hidden inside.
 * The answer can be placed horizontally, vertically, or diagonally in any direction.
 * @param answer The word to hide in the grid.
 * @param size The width and height of the grid.
 */
const normalize = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

const generateGridWithAnswer = (answer: string, size: number = 12): string[][] => {
  const grid: (string | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = () => alphabet[Math.floor(Math.random() * alphabet.length)];
  const cleanAnswer = answer.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanAnswer.length === 0 || cleanAnswer.length > size * size) {
    return Array(size).fill(null).map(() => Array(size).fill('').map(randomLetter));
  }
const directions = [
    { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
    { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
  ];
  for (let i = directions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }
  let placed = false;
  for (const { dr, dc } of directions) {
    const valids: { r: number; c: number }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const endR = r + (cleanAnswer.length - 1) * dr;
        const endC = c + (cleanAnswer.length - 1) * dc;
        if (endR >= 0 && endR < size && endC >= 0 && endC < size) valids.push({ r, c });
      }
    }
    if (valids.length) {
      const { r, c } = valids[Math.floor(Math.random() * valids.length)];
      for (let i = 0; i < cleanAnswer.length; i++) grid[r + i * dr][c + i * dc] = cleanAnswer[i];
      placed = true;
      break;
    }
  }
  if (!placed && cleanAnswer.length <= size) {
    const row = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * (size - cleanAnswer.length + 1));
for (let i = 0; i < cleanAnswer.length; i++) grid[row][startCol + i] = cleanAnswer[i];
  }
  const finalGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) finalGrid[r][c] = grid[r][c] === null ? randomLetter() : grid[r][c]!;
  }
  return finalGrid;
};

const QuizTakingScreen: React.FC<QuizTakingScreenProps> = ({ quizId, teamMembers, onQuizComplete }) => {
  // STATE
  const [quiz, setQuiz] = useState<PlayQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());

  const [isFlipped, setIsFlipped] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<{ correct: boolean } | null>(null);
  const [questionResults, setQuestionResults] = useState<Map<number, boolean>>(new Map());
  const timerIntervalRef = useRef<number | null>(null);

  const [hasAnsweredLastQuestion, setHasAnsweredLastQuestion] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [boardAnswer, setBoardAnswer] = useState('');
  const [completionStats, setCompletionStats] = useState<{
    stats: {
      quiz: DoneQuiz;
      earnedBadges: Badge[];
      expInfo?: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number };
    };
    profileName: string;
quizScores: any[]; // QuizScore[]
    quizMode?: 'Solo' | 'Team';
} | null>(null);

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResultsData, setQuizResultsData] = useState<{
    quizId: number | string;
    results: { questionId: number; wasCorrect: boolean }[];
    teamMembers?: string[];
    expInfo?: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number };
    summary?: { score: number; total: number; percent: number; results: { questionId: number; wasCorrect: boolean }[] };
  } | null>(null);

  const [me, setMe] = useState<{ id?: string; username?: string }>({});
  useEffect(() => {
    if (quiz?.subpart === 'Card Game' || quiz?.subpart === 'Normal') {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [quiz?.subpart]);

  // Load quiz
  useEffect(() => {
    (async () => {
      try {
        if (quizId === undefined || quizId === null || String(quizId) === 'undefined') {
          throw new Error('No quiz selected. (quizId is undefined)');
        }
        setLoading(true);
        setErr('');
        const res = await fetch(`${API_URL}/api/quizzes/${encodeURIComponent(String(quizId))}`);
        if (!res.ok) throw new Error('Failed to load quiz.');
        const q = await res.json();

        const mapped: PlayQuiz = {
          id: q.id,
          topic: q.title,
          subpart: q.type as QuizType,
          teamMembers,
          questions: (q.questions || []).map((it: any) => ({
            id: Number(it.id || 0),
            type: it.type,
            question: it.question || '',
            options: it.options || (it.type === 'multiple-choice' ? ['', '', '', ''] : undefined),
            answer: it.answer || '',
            points: Number(it.points) || 1,
            // Set default XP based on question type if not provided
            xp: Number(it.xp) || (it.type === 'multiple-choice' ? 10 : 20),
            timeLimit: it.timeLimit || 30,
            category: it.category || 'Earth and Space',
            imageUrl: it.imageUrl,
          })),
        };

const QuestionContent: React.FC<{
  question: Question;
  onAnswerSelect: (answer: string) => void;
  currentAnswer: string;
}> = ({ question, onAnswerSelect, currentAnswer }) => {
  const hasImage = !!question.imageUrl;

  return (
    <div className="text-center text-black w-full h-full flex flex-col p-4">
      <div className="flex justify-between w-full mb-4">
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="font-bold text-sm">{question.points} Points</p>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="font-bold text-sm">{question.xp || 0} XP</p>
        </div>
      </div>
      
      {/* ... rest of the component ... */}
    </div>
  );
};
        setQuiz(mapped);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, teamMembers]);

  const questions = useMemo(() => quiz?.questions || [], [quiz?.questions]);
  const currentQuestion: Question | undefined = questions[currentQuestionIndex];
  const [timeLeft, setTimeLeft] = useState<number>(currentQuestion?.timeLimit ?? 30);

  // Generates and memoizes the word-search grid for the current board game question.
  const boardGrid = useMemo(() => {
    if (!quiz || quiz.subpart !== 'Board Game' || !currentQuestion || currentQuestion.type !== 'identification') return [];
    return generateGridWithAnswer((currentQuestion as IdentificationQuestion).answer, 12);
  }, [quiz, currentQuestion]);

  // Computes the currently selected word from the indices of selected cells in the grid.
  const selectedWord = useMemo(() => {
    if (!quiz || quiz.subpart !== 'Board Game') return '';
    const flatGrid = boardGrid.flat();
    return selectedCells.map(index => flatGrid[index]).join('');
  }, [selectedCells, boardGrid, quiz]);

  // Finalizes the selected word when the user releases the pointer (stops dragging).
  const handleGridPointerUp = useCallback(() => {
if (quiz?.subpart !== 'Board Game') return;
    if (isDragging) setBoardAnswer(selectedWord);
    setIsDragging(false);
  }, [isDragging, selectedWord, quiz?.subpart]);

  // Effect to handle the pointer-up event globally to end dragging, even if outside the grid.
  useEffect(() => {
    if (quiz?.subpart !== 'Board Game') return;
    window.addEventListener('pointerup', handleGridPointerUp);
    return () => window.removeEventListener('pointerup', handleGridPointerUp);
  }, [quiz?.subpart, handleGridPointerUp]);

  // Timer
  useEffect(() => {
if (!currentQuestion || !currentQuestion.timeLimit) return;
setTimeLeft(currentQuestion.timeLimit);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleCheckAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [currentQuestionIndex, currentQuestion]); // eslint-disable-line

  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, answer);
setAnswers(newAnswers);
  };

  // Evaluate current question
  const handleCheckAnswer = useCallback(() => {
if (!currentQuestion) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    let studentAnswer = '';
    if (quiz?.subpart === 'Board Game') studentAnswer = boardAnswer;
    else studentAnswer = answers.get(currentQuestion.id) || '';

    const isCorrect = normalize(studentAnswer) === normalize(currentQuestion.answer);
    setLastAnswerResult({ correct: isCorrect });
    setQuestionResults(prev => new Map(prev).set(currentQuestion.id, isCorrect));
    setShowFeedbackModal(true);
  }, [currentQuestion, boardAnswer, answers, quiz?.subpart]);

  const calculateAndFinish = async () => {
    // ensure feedback modal is closed
    setShowFeedbackModal(false);

    if (!quiz) return;

    const results = questions.map(q => ({
      questionId: q.id,
      wasCorrect: questionResults.get(q.id) || false,
    }));

    // compute score & percent
    const totalPoints = questions.reduce((s, q) => s + (q.points || 0), 0);
    const score = results.reduce((s, r) => {
      const q = questions.find(qq => qq.id === r.questionId)!;
      return s + (r.wasCorrect ? (q.points || 0) : 0);
    }, 0);
    const percent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    // build answers payload
    const answersPayload = questions.map(q => {
      const studentAnswer = (quiz.subpart === 'Board Game')
        ? (q.id === questions[currentQuestionIndex]?.id ? boardAnswer : '')
                : (answers.get(q.id) || '');

      return {
        questionId: q.id,
        answer: studentAnswer,
        correctAnswer: q.answer,
        wasCorrect: questionResults.get(q.id) || false,
        points: q.points || 0,
        xp: q.xp || 0,
      };
    });

    // who am I?
    let me: { id?: string, username?: string } = {};
    try {
      me = JSON.parse(localStorage.getItem('currentUser') || '{}');
} catch {}

    // POST to /api/submissions (server will update XP/level/accuracy)
    let expInfo: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number } | undefined;
    try {
      const payload = {
        quizId: quiz.id,
        studentId: me?.id,
        answers: answersPayload,
        score,
        percent,
      };
const res = await fetch(`${API_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        console.error('[QuizTakingScreen] submission failed:', t);
      } else {
const saved = await res.json();
        console.log('[QuizTakingScreen] submission saved:', saved);
        // Capture EXP/level info from server response
if (saved.expGain !== undefined) {
          expInfo = {
            expGain: saved.expGain,
            oldLevel: saved.oldLevel || 1,
            newLevel: saved.newLevel || 1,
            oldExp: saved.oldExp || 0,
newExp: saved.newExp || 0,
          };
        }
      }
} catch (e) {
      console.error('[QuizTakingScreen] submission error:', e);
    }

    // Notify parent so it can close the quiz modal / move to Done
    if (quiz.subpart === 'Normal') {
      const doneQuiz: DoneQuiz = {
        id: quiz.id,
        topic: quiz.topic,
        subpart: quiz.subpart,
        score: `${score}/${totalPoints}`,
        questionResults: questions.map(q => {
          const result = results.find(r => r.questionId === q.id)!;
          const studentAnswer = answers.get(q.id) || '';
          return {
            ...result,
            ...q,
            studentAnswer,
          };
        }),
        mode: quiz.teamMembers ? 'Team' : 'Solo',
      };
      setCompletionStats({
        stats: {
          quiz: doneQuiz,
          earnedBadges: [], // You might want to calculate this based on performance
          expInfo: expInfo,
        },
        profileName: me.username || 'Student',
        quizScores: [], // This would be populated from a broader state if available
        quizMode: quiz.teamMembers ? 'Team' : 'Solo',
      });
    } else { // Board Game and Card Game quizzes call onQuizComplete directly
      onQuizComplete(quiz.id, results, quiz.teamMembers, expInfo, {
        score,
        total: totalPoints,
        percent,
        results,
      });
    }
  };

  const handleNextOrFinish = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      void calculateAndFinish();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
}
  };

  const handleNextQuestionFromModal = () => {
    setShowFeedbackModal(false);
    setLastAnswerResult(null);
    setIsFlipped(false);
    setSelectedCells([]);
    setBoardAnswer('');

      if (currentQuestionIndex >= questions.length - 1) {
      void calculateAndFinish();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Starts the word selection process when a user presses down on a cell.
  const handleCellPointerDown = (index: number) => { setIsDragging(true); setSelectedCells([index]); setBoardAnswer(''); };

  // Extends the word selection as the user drags their pointer over adjacent cells.
  const handleCellPointerEnter = (index: number) => {
    if (!isDragging || selectedCells.includes(index)) return;
    const lastIndex = selectedCells[selectedCells.length - 1];
    const gridSize = 12;
    const lastRow = Math.floor(lastIndex / gridSize);
    const lastCol = lastIndex % gridSize;
    const currentRow = Math.floor(index / gridSize);
    const currentCol = index % gridSize;
    const isAdjacent = Math.abs(lastRow - currentRow) <= 1 && Math.abs(lastCol - currentCol) <= 1;
    if (isAdjacent) setSelectedCells(prev => [...prev, index]);
  };

  if (loading) return <div className="p-6 text-center text-white">Loading…</div>;
  if (err) return <div className="p-6 text-center text-red-400">{err}</div>;
  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="w-full max-w-sm mx-auto h-screen flex flex-col items-center justify-center text-white p-4">
        <p>This quiz has no questions.</p>
        <button onClick={() => onQuizComplete(quizId, [], teamMembers)} className="mt-4 px-4 py-2 bg-brand-accent rounded-lg">Go Back</button>
      </div>
    );
  }

  if (completionStats && (quiz.subpart === 'Normal')) {
    return (
      <QuizCompletedScreen
        {...completionStats}
        onDone={() => {
          const results = questions.map(q => ({
            questionId: q.id,
            wasCorrect: questionResults.get(q.id) || false,
          }));
          const totalPoints = questions.reduce((s, q) => s + (q.points || 0), 0);
          const score = results.reduce((s, r) => {
            const q = questions.find(qq => qq.id === r.questionId)!;
            return s + (r.wasCorrect ? (q.points || 0) : 0);
          }, 0);
          const percent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
          onQuizComplete(quiz.id, results, quiz.teamMembers, completionStats.stats.expInfo, {
            score,
            total: totalPoints,
            percent,
            results,
          }, true);
        }}
      />
    );
  }

  // =====================================================================================
  // == BOARD GAME UI
  // Renders the interface for the 'Board Game' quiz type (word search).
  // =====================================================================================
  if (quiz.subpart === 'Board Game') {
    return (
      <div className="relative w-full max-w-sm mx-auto h-screen flex flex-col text-white p-4 bg-brand-deep-purple">
        <header className="flex-shrink-0 mb-4 text-center">
          <h1 className="text-2xl font-bold font-orbitron truncate">{quiz.topic}</h1>
          <p className="text-lg text-brand-glow">{quiz.subpart}</p>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center space-y-4">
          <p className="text-lg font-semibold text-center">{currentQuestion!.question}</p>

          <div className="flex justify-around items-center w-full">
            <div className="text-center">
              <p className="text-gray-300">XP</p>
              <p className="text-2xl font-bold font-orbitron text-yellow-400 text-glow-yellow">{currentQuestion?.xp || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-300">Time Left</p>
              <p className="text-2xl font-bold font-orbitron text-brand-glow">{timeLeft}s</p>
            </div>
          </div>

          <div
            className="w-full max-w-[408px] aspect-square bg-brand-deep-purple/50 p-2 rounded-lg border-2 border-brand-light-purple/50 shadow-lg touch-none"
            onPointerUp={handleGridPointerUp}
            onPointerLeave={handleGridPointerUp}
          >
            <div className="grid grid-cols-12 gap-1 w-full h-full select-none">
              {boardGrid.flat().map((letter, index) => (
                <div
                  key={index}
                  onPointerDown={() => handleCellPointerDown(index)}
                  onPointerEnter={() => handleCellPointerEnter(index)}
                  className={`flex items-center justify-center rounded-sm text-white font-mono text-xs aspect-square transition-colors duration-150
                    ${selectedCells.includes(index) ? 'bg-brand-glow scale-110' : 'bg-brand-mid-purple/70 cursor-pointer'}`}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="flex-shrink-0 pt-4 flex flex-col items-center space-y-4">
          <div className="w-full h-10 bg-brand-deep-purple/50 border border-brand-light-purple/50 rounded-lg flex items-center justify-center">
            <p className="font-mono text-2xl tracking-[0.2em] font-bold text-brand-glow">{boardAnswer}</p>
          </div>
          <button
            onClick={handleCheckAnswer}
            disabled={!boardAnswer}
            className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-90 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-glow focus:ring-opacity-75 disabled:bg-gray-500/50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Submit Answer
          </button>
        </footer>

        <FeedbackModal
          isOpen={showFeedbackModal}
          isCorrect={!!lastAnswerResult?.correct}
          questionText={currentQuestion!.question}
          correctAnswer={currentQuestion!.answer}
          onNext={handleNextQuestionFromModal}
        />
      </div>
    );
  }

  // =====================================================================================
  // == NORMAL & CARD GAME UI
  // Shared logic and content for 'Normal' and 'Card Game' quiz types.
  // =====================================================================================
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isMultipleChoice = currentQuestion!.type === 'multiple-choice';

  const mainContent = (
    <main className="flex-grow flex flex-col justify-start overflow-y-auto hide-scrollbar pt-4">
      {quiz.teamMembers && (
        <div className="text-center mb-3">
          <p className="text-lg font-semibold text-brand-glow animate-pulse">
            {quiz.teamMembers[currentQuestionIndex % quiz.teamMembers.length]}'s Turn!
          </p>
        </div>
      )}

      <div className="bg-brand-mid-purple/80 p-4 rounded-2xl border border-brand-light-purple/50 space-y-4">
        {currentQuestion!.imageUrl && (
          <div className="rounded-lg overflow-hidden bg-black/20 flex items-center justify-center">
            <img src={currentQuestion!.imageUrl} alt="Question visual aid" className="max-h-48 w-full object-contain" />
          </div>
        )}

        {/* Question block grows naturally with content; no fixed height */}
        <p className="text-base font-semibold text-center leading-relaxed">{currentQuestion!.question}</p>

        {isMultipleChoice ? (
          <div className="space-y-2 pt-2">
            {(currentQuestion as MultipleChoiceQuestion).options.map((option, index) => {
              const isSelected = answers.get(currentQuestion!.id) === option;
              return (
                <button
                  key={index}
                  onClick={() => {
                    const newAnswers = new Map(answers);
                    newAnswers.set(currentQuestion!.id, option);
                    setAnswers(newAnswers);
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200
                    ${isSelected ? 'bg-brand-glow/30 border-brand-glow text-white font-bold' : 'bg-brand-deep-purple/50 border-brand-light-purple/50 text-gray-300 hover:bg-brand-light-purple/30'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="w-full">
            <input
              type="text"
              value={answers.get(currentQuestion!.id) || ''}
              onChange={e => {
                const newAnswers = new Map(answers);
                newAnswers.set(currentQuestion!.id, e.target.value);
                setAnswers(newAnswers);
              }}
              placeholder="Type your answer here"
              className="w-full bg-brand-deep-purple/50 border-2 border-brand-light-purple/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-glow focus:border-transparent transition-all duration-300 text-center"
            />
          </div>
        )}
      </div>
    </main>
  );

  // =====================================================================================
  // == CARD GAME UI
  // Renders the specific layout for the 'Card Game' quiz type, including the
  // flippable card functionality.
  // =====================================================================================
  if (quiz.subpart === 'Card Game') {
    return (
      <div className="relative w-full max-w-sm mx-auto h-screen flex flex-col text-white p-4 bg-brand-deep-purple">
        <header className="flex-shrink-0 mb-4">
          <h1 className="text-2xl font-bold font-orbitron truncate">{quiz.topic}</h1>
          <p className="absolute top-4 right-4 text-brand-glow">{quiz.subpart}</p>
          <div className="text-center mt-2">
            <p className="text-lg font-bold font-orbitron text-brand-glow">Time Left: {timeLeft}s</p>
          </div>
        </header>
        <FlippableCard isFlipped={isFlipped} onFlip={() => setIsFlipped(true)}>
          <QuestionContent
            question={currentQuestion!}
            onAnswerSelect={handleAnswerSelect}
            currentAnswer={answers.get(currentQuestion!.id) || ''}
          />
        </FlippableCard>
        <footer className="flex-shrink-0 pt-4 flex justify-center items-center">
          {hasAnsweredLastQuestion ? (
            <button
              onClick={() => void calculateAndFinish()}
              className="px-8 py-3 rounded-lg bg-brand-accent font-bold text-lg hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20"
            >
              Show Results
            </button>
          ) : (
            <button
              onClick={handleCheckAnswer}
              disabled={!answers.get(currentQuestion!.id)}
              className="px-8 py-3 rounded-lg bg-green-500 font-bold text-lg hover:bg-green-600 shadow-lg shadow-green-500/20 disabled:bg-gray-500/50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Submit Answer
            </button>
          )}
        </footer>
        <FeedbackModal
          isOpen={showFeedbackModal}
          isCorrect={!!lastAnswerResult?.correct}
          questionText={currentQuestion!.question}
          correctAnswer={currentQuestion!.answer}
          onNext={handleNextQuestionFromModal}
        />
      </div>
    );
  }

  // =====================================================================================
  // == NORMAL QUIZ UI
  // Renders the specific layout for the 'Normal' quiz type, which is a more
  // straightforward question-and-answer format without the card flip.
  // =====================================================================================
  if (quiz.subpart === 'Normal') {
    return (
      <div className="relative w-full max-w-sm mx-auto h-screen flex flex-col text-white p-4">
        <header className="flex-shrink-0 mb-4">
          <h1 className="text-2xl font-bold font-orbitron truncate">{quiz.topic}</h1>
          <p className="absolute top-4 right-4 text-brand-glow">{quiz.subpart}</p>
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Progress</span>
              <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <div className="w-full bg-brand-mid-purple rounded-full h-2.5">
              <div className="bg-brand-glow h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <div className="flex justify-around items-center mt-2 text-lg font-bold font-orbitron">
            <p className="text-yellow-400 text-glow-yellow">
              {currentQuestion?.xp || 0} XP
            </p>
            <p className="text-brand-glow">Time Left: {timeLeft}s</p>
          </div>
        </header>
        {/* Use mainContent (no FlippableCard for Normal quizzes) */}
        {mainContent}
        <footer className="flex-shrink-0 pt-4 flex justify-center items-center">
          {hasAnsweredLastQuestion ? (
            <button
              onClick={() => void calculateAndFinish()}
              className="px-8 py-3 rounded-lg bg-brand-accent font-bold text-lg hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20"
            >
              Show Results
            </button>
          ) : (
            <button
              onClick={handleCheckAnswer}
              disabled={!answers.get(currentQuestion!.id)}
              className="px-8 py-3 rounded-lg bg-green-500 font-bold text-lg hover:bg-green-600 shadow-lg shadow-green-500/20 disabled:bg-gray-500/50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Submit Answer
            </button>
        )}
      </footer>
        <FeedbackModal
          isOpen={showFeedbackModal}
          isCorrect={!!lastAnswerResult?.correct}
          questionText={currentQuestion!.question}
          correctAnswer={currentQuestion!.answer}
          onNext={handleNextQuestionFromModal}
        />
      </div>
    );
  }

  // This part is now effectively unreachable if quiz.subpart is 'Normal', 'Card Game', or 'Board Game'
  return null;
};

const QuestionContent: React.FC<{
  question: Question;
  onAnswerSelect: (answer: string) => void;
  currentAnswer: string;
}> = ({ question, onAnswerSelect, currentAnswer }) => {
  const hasImage = !!question.imageUrl;

  return (
    <div className="text-center text-black w-full h-full flex flex-col p-4">
      <div className="flex justify-between w-full mb-4">
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="font-bold text-sm">{question.points} Points</p>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="font-bold text-sm">{question.xp || 0} XP</p>
        </div>
      </div>
      
      {hasImage && (
        <div className="mb-2 flex justify-center">
          <img src={question.imageUrl} alt="Question" className="max-h-32 rounded-lg" />
        </div>
      )}
      
      <p className={`font-semibold mb-4 text-white ${hasImage ? 'text-sm' : 'text-base'}`}>{question.question}</p>
      
      <div className="flex-grow flex flex-col justify-center">
        {question.type === 'multiple-choice' ? (
          <div className="grid grid-cols-1 gap-2 w-full">
            {(question as MultipleChoiceQuestion).options.map((option, index) => (
              <button
                key={index}
                onClick={() => onAnswerSelect(option)}
                className={`p-2 rounded-lg transition-colors font-semibold ${hasImage ? 'text-xs' : 'text-sm'} ${
                  currentAnswer === option
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white/80 hover:bg-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full">
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => onAnswerSelect(e.target.value)}
              className="w-full bg-white/80 rounded-lg px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center"
              placeholder="Type your answer..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTakingScreen;