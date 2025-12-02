import React, { useState } from 'react';
import QuizzesScreen from './QuizzesScreen';
import QuizTakingScreen from '../quiz/QuizTakingScreen';
import QuizCompletedScreen from '../quiz/QuizCompletedScreen';

interface QuizScore {
  score: number;
  total: number;
  percent: number;
  results: { questionId: number; wasCorrect: boolean }[];
}

const StudentDashboard = (props) => {
  const { onQuizComplete } = props;

  const [selectedQuizId, setSelectedQuizId] = useState<string | number | null>(null);
  const [completedQuizData, setCompletedQuizData] = useState<{
    quizId: string | number;
    score: QuizScore;
    teamMembers?: string[];
    expInfo?: any;
  } | null>(null);

  const handleTakeQuiz = (quizId: string | number) => {
    console.log('[StudentDashboard] handleTakeQuiz received id:', quizId);
    setSelectedQuizId(quizId);
    setCompletedQuizData(null);
  };

  const handleFinish = (
    quizId: string | number,
    results: { questionId: number; wasCorrect: boolean }[],
    teamMembers?: string[],
    expInfo?: any,
    score?: QuizScore,
    resultScreenAlreadyShown?: boolean
  ) => {
    console.log('[StudentDashboard] onQuizComplete:', { quizId, results, teamMembers, expInfo, score });
    onQuizComplete?.(quizId, results, teamMembers, expInfo, score);
    if (score && !resultScreenAlreadyShown) {
      setCompletedQuizData({ quizId, score, teamMembers, expInfo });
    }
    setSelectedQuizId(null);
  };

  const handleCloseCompletionScreen = () => {
    setCompletedQuizData(null);
  };

  return (
    <div className="h-full">
      {completedQuizData ? (
        <QuizCompletedScreen
          quizId={String(completedQuizData.quizId)}
          score={completedQuizData.score}
          teamMembers={completedQuizData.teamMembers}
          expInfo={completedQuizData.expInfo}
          onClose={handleCloseCompletionScreen}
        />
      ) : !selectedQuizId ? (
        <QuizzesScreen
          onTakeQuiz={handleTakeQuiz}
          onViewDetails={(doneQuiz) => console.log('[StudentDashboard] view details', doneQuiz)}
        />
      ) : (
        <QuizTakingScreen
          quizId={selectedQuizId}
          onQuizComplete={handleFinish}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
