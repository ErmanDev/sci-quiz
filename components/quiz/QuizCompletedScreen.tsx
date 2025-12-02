import React, { useMemo, useState, useEffect } from 'react';
import { DoneQuiz } from '../../data/quizzes';
import { Badge } from '../../data/badges';
import { Question } from '../../data/teacherQuizQuestions';
import { ListLaurel, GenericListAvatar } from '../icons';
import { achievementMessages } from '../../data/achievements';

interface QuizScore {
    name: string;
    score: string; // e.g. "90%"
}

interface QuizCompletedScreenProps {
  // The `stats.quiz.questionResults` now contains full question details
  // plus `wasCorrect` and `studentAnswer`.
  stats: {
    quiz: Omit<DoneQuiz, 'questionResults'> & {
      questionResults: (Question & { wasCorrect: boolean; studentAnswer: string; questionId: number })[];
    };
    earnedBadges: Badge[];
    expInfo?: { expGain: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number };
  };
  onDone: () => void;
  profileName: string;
  quizScores: QuizScore[];
  quizMode?: 'Solo' | 'Team' | 'Classroom';
  currentUserTeamName?: string;
}


const QuizCompletedScreen: React.FC<QuizCompletedScreenProps> = ({ stats, onDone, profileName, quizScores, quizMode, currentUserTeamName }) => {
    const { quiz, earnedBadges, expInfo } = stats;
    const [scoreStr, totalPointsStr] = quiz.score.split('/');
    const score = parseInt(scoreStr, 10);
    const totalPoints = parseInt(totalPointsStr, 10);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const [showAchievement, setShowAchievement] = useState(false);
    const [achievement, setAchievement] = useState<{ title: string; message: string } | null>(null);
    
    const levelUp = expInfo && expInfo.newLevel > expInfo.oldLevel;
    const expChange = expInfo ? expInfo.expGain : 0;

    useEffect(() => {
        if (levelUp) {
            const newLevel = expInfo.newLevel;
            const relevantAchievement = Object.keys(achievementMessages).reverse().find(level => newLevel >= parseInt(level));
            if (relevantAchievement) {
                const achievementLevel = parseInt(relevantAchievement);
                if (expInfo.oldLevel < achievementLevel) {
                    setAchievement(achievementMessages[achievementLevel]);
                    setShowAchievement(true);
                }
            }
        }
    }, [levelUp, expInfo]);

    const handleDone = () => {
        if (showAchievement) {
            setShowAchievement(false);
        } else {
            onDone();
        }
    };

    if (showAchievement && achievement) {
        return (
            <div className="w-full max-w-sm mx-auto h-screen flex flex-col items-center justify-center text-white p-4 bg-brand-deep-purple">
                <div className="w-full flex-grow flex flex-col justify-center space-y-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400/80 to-amber-500/80 backdrop-blur-sm border border-yellow-300/50 rounded-2xl p-6 w-full flex flex-col items-center shadow-lg text-center">
                        <h1 className="text-3xl font-bold font-orbitron text-white mb-2">🏆 Achievement Unlocked! 🏆</h1>
                        <h2 className="text-2xl font-semibold text-white mt-2">{achievement.title}</h2>
                        <p className="text-lg text-white/90 mt-4">"{achievement.message}"</p>
                    </div>
                </div>
                <div className="w-full flex-shrink-0 pt-4">
                    <button
                        onClick={handleDone}
                        className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-90 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-glow focus:ring-opacity-75"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto h-screen flex flex-col items-center justify-center text-white p-4 bg-brand-deep-purple">
            <div className="w-full flex-grow flex flex-col justify-center space-y-4 overflow-hidden">
                <h1 className="text-4xl font-bold font-orbitron text-center flex-shrink-0">Quiz Complete!</h1>
                
                {/* EXP/Level Alert */}
                {expInfo && (
                    <div className={`bg-gradient-to-r ${expChange >= 0 ? 'from-green-500/80 to-emerald-500/80' : 'from-red-500/80 to-rose-500/80'} backdrop-blur-sm border ${expChange >= 0 ? 'border-green-400/50' : 'border-red-400/50'} rounded-2xl p-4 w-full flex flex-col items-center shadow-lg animate-pulse`}>
                        {levelUp ? (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-2">🎉 Level Up! 🎉</h2>
                                <p className="text-lg font-semibold">Level {expInfo.oldLevel} → Level {expInfo.newLevel}</p>
                            </>
                        ) : (
                            <h2 className="text-xl font-semibold mb-2">Experience Gained</h2>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-2xl font-bold ${expChange >= 0 ? 'text-white' : 'text-white'}`}>
                                {expChange >= 0 ? '+' : ''}{expChange} EXP
                            </span>
                        </div>
                        <p className="text-base text-white/90 mt-1">
                            Total XP: {expInfo.newExp}
                        </p>
                    </div>
                )}
                
                {/* Score Card */}
                <div className="relative bg-brand-mid-purple/70 backdrop-blur-sm border border-brand-light-purple/50 rounded-2xl p-4 w-full flex flex-col items-center shadow-lg">
                    <h2 className="text-xl font-semibold">Your Score</h2>
                    <p className="text-6xl font-bold font-orbitron text-brand-glow my-1">{score}<span className="text-3xl text-gray-400">/{totalPoints}</span></p>
                    <p className="text-2xl font-bold text-green-400">{percentage}%</p>
                </div>

                {/* Badges Earned */}
                {earnedBadges.length > 0 && (
                    <div className="bg-brand-mid-purple/70 backdrop-blur-sm border border-brand-light-purple/50 rounded-2xl p-4 w-full flex flex-col items-center shadow-lg">
                        <h2 className="text-xl font-semibold mb-3">Badges Unlocked!</h2>
                        <div className="flex justify-center flex-wrap gap-3">
                            {earnedBadges.map(badge => (
                                <div key={badge.id} className="flex flex-col items-center w-20 text-center animate-pulse">
                                    <img src={badge.imgSrc} alt={badge.name} className="w-16 h-16 object-contain mb-1" />
                                    <p className="text-xs text-gray-300 leading-tight">{badge.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full flex-shrink-0 pt-4">
                 <button
                    onClick={handleDone}
                    className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg
                               transition-all duration-300 ease-in-out
                               hover:bg-opacity-90 hover:shadow-glow
                               focus:outline-none focus:ring-2 focus:ring-brand-glow focus:ring-opacity-75"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default QuizCompletedScreen;