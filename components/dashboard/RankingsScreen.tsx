import React, { useState, useMemo, useEffect } from 'react';
import { FilterIcon } from '../icons';
import { ProfileData } from '../StudentDashboard';
import { useTranslations } from '../../hooks/useTranslations';
import { ClassStudent } from '../../data/classStudentData';
import { TeacherQuiz } from '../../data/teacherQuizzes';
import { rankingsApi } from '../../src/api';
import { resolveAvatar, defaultAvatar } from '../../src/avatarAssets';

import firstRank from '../../Image/RANKING/1st.png';
import secondRank from '../../Image/RANKING/2nd.png';
import thirdRank from '../../Image/RANKING/3rd.png';
import fourthRank from '../../Image/RANKING/4th.png';

interface PodiumItemProps {
    rank: number;
    name: string;
    avatar?: string;
    order: number;
    elevated?: boolean;
}

const getRankingImageForPodium = (rank: number): string => {
    if (rank === 1) return firstRank;
    if (rank === 2) return secondRank;
    if (rank === 3) return thirdRank;
    return ''; // Should not be called for other ranks
};

const PodiumItem: React.FC<PodiumItemProps> = ({ rank, name, avatar, order, elevated }) => {
    const podiumImage = getRankingImageForPodium(rank);
    const avatarSrc = resolveAvatar(avatar || undefined) || defaultAvatar();

    return (
        <div className={`flex flex-col items-center transform transition-transform duration-300 ease-in-out ${elevated ? '-translate-y-8' : ''}`} style={{ order }}>
            <div className="relative w-24 h-24">
                <img src={avatarSrc} alt={name} className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                {podiumImage && (
                    <img 
                        src={podiumImage} 
                        alt={`Rank ${rank}`} 
                        className="absolute inset-0 w-full h-full"
                        style={{
                            transform: 'scale(1.25)',
                            transformOrigin: 'center',
                        }}
                    />
                )}
                <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center text-[40px] font-bold font-orbitron" 
                    style={{ 
                        color: '#FFD700',
                        textShadow: '0 0 9px #FFD700, 0 0 13px #F0E68C' 
                    }}
                >
                    {rank}
                </div>
            </div>
            <span className="font-bold text-white mt-6 text-center text-lg">{name}</span>
        </div>
    );
};

interface LeaderboardItemProps {
    rank: number;
    name: string;
    score: number;
    avatar?: string;
    showPercent: boolean;
    isCurrentUser?: boolean;
}

const getRankingImageForLeaderboard = (rank: number): string => {
    if (rank === 1) return firstRank;
    if (rank === 2) return secondRank;
    if (rank === 3) return thirdRank;
    if (rank === 4) return fourthRank;
    return '';
};

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ rank, name, score, avatar, showPercent, isCurrentUser }) => {
    const rankingImage = getRankingImageForLeaderboard(rank);
    const avatarSrc = resolveAvatar(avatar || undefined) || defaultAvatar();

    return (
        <div className="relative flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 ease-in-out">
            <div 
                className={`absolute inset-0 rounded-lg border-2 ${isCurrentUser ? 'border-brand-accent/80' : 'border-transparent'}`}
                style={isCurrentUser ? { 
                    borderImageSlice: 1,
                    borderImageSource: 'linear-gradient(to right, #FFD700, #F5A623)'
                } : {}}
            />
            
            <div 
                className={`absolute inset-0 rounded-lg ${isCurrentUser ? 'bg-brand-accent/10 dark:bg-brand-light-purple/50' : 'bg-white dark:bg-brand-mid-purple/60'}`}
            />
            
            <div className="relative flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-brand-mid-purple dark:bg-brand-light-purple border border-brand-light-purple/50 rounded flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-sm text-white">{rank}</span>
                </div>
                <div className="relative w-9 h-9">
                    <img src={avatarSrc} alt={name} className="w-full h-full rounded-full object-cover" />
                    {rankingImage && (
                        <img
                            src={rankingImage}
                            alt={`Rank ${rank}`}
                            className="absolute inset-0 w-full h-full"
                            style={{
                                border: '2px solid transparent',
                                borderRadius: '50%',
                            }}
                        />
                    )}
                </div>
                <span className={`font-semibold ${isCurrentUser ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{name}</span>
            </div>
            <span className="relative font-bold text-brand-glow ml-2">{showPercent ? `${score.toFixed(2)}%` : Math.round(score)}</span>
        </div>
    );
};

interface FilterMenuProps {
    isOpen: boolean;
    onClose: () => void;
    availableQuizzes: TeacherQuiz[];
    filters: {
        mode: 'SOLO' | 'TEAM' | 'CLASSROOM';
        scope: 'all' | 'per';
        quizId: string;
    };
    onFilterChange: (newFilters: FilterMenuProps['filters']) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ isOpen, onClose, availableQuizzes, filters, onFilterChange }) => {
    const { t } = useTranslations();
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [showQuizSelection, setShowQuizSelection] = useState(filters.scope === 'per');

    const handleApply = () => {
        onFilterChange(currentFilters);
    };

    const filterOptions = [
        {
            title: t('mode'),
            options: [
                { label: t('solo'), value: 'SOLO' },
                { label: t('team'), value: 'TEAM' },
                { label: t('classroom'), value: 'CLASSROOM' },
            ],
            stateKey: 'mode',
        },
        {
            title: t('scope'),
            options: [
                { label: t('allQuizzes'), value: 'all' },
                { label: t('perQuiz'), value: 'per' },
            ],
            stateKey: 'scope',
        },
    ];

    return (
        <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div className={`bg-brand-dark-purple rounded-2xl p-5 w-full max-w-[360px] mx-4 border border-brand-light-purple/50 transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{t('filterRankings')}</h2>
                    <button onClick={handleApply} className="px-4 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors">{t('apply')}</button>
                </div>

                <div className="space-y-6">
                    {filterOptions.map(group => (
                        <div key={group.title}>
                            <h3 className="font-semibold text-gray-300 mb-3">
                                {group.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {group.options.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            const newFilters = { ...currentFilters, [group.stateKey]: option.value };
                                            if (group.stateKey === 'scope') {
                                                setShowQuizSelection(option.value === 'per');
                                                if (option.value === 'all') {
                                                    newFilters.quizId = ''; // Reset quizId when switching to 'all'
                                                }
                                            }
                                            setCurrentFilters(newFilters);
                                        }}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${currentFilters[group.stateKey as keyof typeof currentFilters] === option.value ? 'bg-brand-accent text-white' : 'bg-brand-light-purple/20 text-gray-300 hover:bg-brand-light-purple/40'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                {group.stateKey === 'scope' && showQuizSelection && (
                                    <div className="w-full mt-3">
                                        <h4 className="font-semibold text-gray-300 mb-2">{t('selectQuiz')}</h4>
                                        <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                                            {availableQuizzes.map(quiz => (
                                                <button
                                                    key={quiz.id}
                                                    onClick={() => setCurrentFilters({ ...currentFilters, quizId: String(quiz.id) })}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${String(currentFilters.quizId) === String(quiz.id) ? 'bg-brand-accent/80 text-white' : 'bg-brand-light-purple/20 text-gray-300 hover:bg-brand-light-purple/40'}`}
                                                >
                                                    {quiz.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface RankingsScreenProps {
    profile: Pick<ProfileData, 'name'>;
    reportsData: any;
    classRosters: Record<string, ClassStudent[]>;
    studentJoinedClassIds: string[];
    postedQuizzes: TeacherQuiz[];
    teamsData: any;
}

const RankingsScreen: React.FC<RankingsScreenProps> = ({ profile, reportsData, classRosters, studentJoinedClassIds, postedQuizzes, teamsData }) => {
    const [isFilterMenuRendered, setIsFilterMenuRendered] = useState(false);
    const [isFilterMenuOpen, setFilterMenuOpen] = useState(false);
    const { t } = useTranslations();
    const [serverRankings, setServerRankings] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        mode: 'SOLO' as 'SOLO' | 'TEAM' | 'CLASSROOM',
        scope: 'all' as 'all' | 'per',
        quizId: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const openFilterMenu = () => {
        setIsFilterMenuRendered(true);
        setTimeout(() => setFilterMenuOpen(true), 10);
    };

    const closeFilterMenu = () => {
        setFilterMenuOpen(false);
        setTimeout(() => setIsFilterMenuRendered(false), 300);
    };

    const handleFilterChange = (newFilters: typeof filters) => {
        setIsLoading(true);
        setFilters(newFilters);
        closeFilterMenu();
    };

    useEffect(() => {
        const classId = studentJoinedClassIds[0];
        if (!classId) {
            setServerRankings([]);
            return;
        }
        rankingsApi.byClass(classId)
            .then((res: any) => setServerRankings(Array.isArray(res?.rankings) ? res.rankings : []))
            .catch(() => setServerRankings([]));
    }, [studentJoinedClassIds.join(',')]);

    const modeMap: Record<'SOLO' | 'TEAM' | 'CLASSROOM', 'Solo' | 'Team' | 'Classroom'> = {
        'SOLO': 'Solo',
        'TEAM': 'Team',
        'CLASSROOM': 'Classroom',
    };

    const availableQuizzes = useMemo(() => {
        const classIds = new Set(studentJoinedClassIds);
        const quizMode = modeMap[filters.mode];
        return postedQuizzes.filter(quiz => 
            quiz.postedToClasses?.some(c => classIds.has(c.id)) &&
            quiz.mode === quizMode
        );
    }, [postedQuizzes, studentJoinedClassIds, filters.mode]);

    const rankedData = useMemo(() => {
        const studentDataMap = new Map<string, ClassStudent>();
        Object.values(classRosters).flat().forEach(student => {
            if (student.id) {
                studentDataMap.set(String(student.id), student);
            }
        });

        const quizMode = modeMap[filters.mode];
        const classIds = new Set(studentJoinedClassIds);
        const matchingQuizIds = new Set(
            postedQuizzes
                .filter(quiz => quiz.mode === quizMode && quiz.postedToClasses?.some(c => classIds.has(c.id)))
                .map(quiz => String(quiz.id))
        );

        if (filters.mode === 'TEAM') {
            const currentClassId = studentJoinedClassIds[0];
            const teams = teamsData[currentClassId] || {};
            const teamScores = Object.entries(teams).map(([teamName, teamInfo]: [string, { members: string[], teamId: string }]) => {
                
                let score = 0;
                const teamMembers = teamInfo.members || [];

                if (filters.scope === 'all') {
                    let totalTeamScore = 0;
                    let totalQuizzesPlayedByTeam = 0;

                    teamMembers.forEach(memberId => {
                        const memberScoresOnTeamQuizzes = (reportsData?.singleQuizStudentScores || [])
                            .filter((s: any) => String(s.studentId) === memberId && matchingQuizIds.has(String(s.quizNumber)));
                        
                        if (memberScoresOnTeamQuizzes.length > 0) {
                            const memberTotal = memberScoresOnTeamQuizzes.reduce((sum: number, s: any) => sum + parseFloat(s.score.replace('%', '') || '0'), 0);
                            totalTeamScore += memberTotal;
                            totalQuizzesPlayedByTeam += memberScoresOnTeamQuizzes.length;
                        }
                    });
                    score = totalQuizzesPlayedByTeam > 0 ? totalTeamScore / totalQuizzesPlayedByTeam : 0;

                } else if (filters.scope === 'per' && filters.quizId) {
                    let totalScoreForQuiz = 0;
                    let membersWhoTookQuiz = 0;
                    teamMembers.forEach(memberId => {
                        const scoreData = (reportsData?.singleQuizStudentScores || []).find((s: any) => String(s.studentId) === memberId && String(s.quizNumber) === filters.quizId);
                        if (scoreData) {
                            totalScoreForQuiz += parseFloat(scoreData.score.replace('%', '') || '0');
                            membersWhoTookQuiz++;
                        }
                    });
                    score = membersWhoTookQuiz > 0 ? totalScoreForQuiz / membersWhoTookQuiz : 0;
                }

                const teamAvatar = teamMembers.length > 0 ? studentDataMap.get(teamMembers[0])?.avatar : undefined;
                return { name: teamName, score, avatar: teamAvatar, id: teamInfo.teamId };
            });

            const sorted = teamScores.sort((a, b) => b.score - a.score).map((team, i) => ({ ...team, rank: i + 1 }));
            const top3 = sorted.slice(0, 3);
            const podiumOrder = [top3.find(p => p.rank === 2), top3.find(p => p.rank === 1), top3.find(p => p.rank === 3)].filter(Boolean) as PodiumItemProps[];
            return { top: podiumOrder, list: sorted.slice(3), percent: true };
        }

        let sourceData: any[] = [];
        
        const allStudentsInClass = Array.from(studentDataMap.keys());

        if (filters.scope === 'all') {
            const modeFilteredScores = (reportsData?.singleQuizStudentScores || [])
                .filter((s: any) => matchingQuizIds.has(String(s.quizNumber)));

            const studentScoresMap = new Map<string, number[]>();
            modeFilteredScores.forEach(s => {
                const score = parseFloat(s.score.replace('%', '') || '0');
                const studentId = String(s.studentId);
                if (!studentScoresMap.has(studentId)) {
                    studentScoresMap.set(studentId, []);
                }
                studentScoresMap.get(studentId)!.push(score);
            });

            sourceData = allStudentsInClass
                .map(studentId => {
                    const studentInfo = studentDataMap.get(studentId);
                    const scores = studentScoresMap.get(studentId) || [];
                    const score = scores.reduce((sum, s) => sum + s, 0);

                    return {
                        id: studentId,
                        name: studentInfo?.name || 'Unknown Student',
                        score,
                        avatar: studentInfo?.avatar
                    };
                })
                .sort((a: any, b: any) => b.score - a.score);
        } else if (filters.scope === 'per' && filters.quizId) {
            const selectedQuiz = postedQuizzes.find(q => String(q.id) === filters.quizId);
            if (selectedQuiz && selectedQuiz.mode === quizMode) {
                const studentScoresMap = new Map<string, number>();
                (reportsData?.singleQuizStudentScores || [])
                    .filter((s: any) => String(s.quizNumber) === filters.quizId)
                    .forEach((s: any) => {
                        const score = parseFloat(s.score.replace('%', '') || '0');
                        studentScoresMap.set(String(s.studentId), score);
                    });

                sourceData = allStudentsInClass
                    .map(studentId => {
                        const studentInfo = studentDataMap.get(studentId);
                        const score = studentScoresMap.get(studentId) || 0;

                        return {
                            id: studentId,
                            name: studentInfo?.name || 'Unknown Student',
                            score,
                            avatar: studentInfo?.avatar
                        };
                    })
                    .sort((a: any, b: any) => b.score - a.score);
            }
        }

        const rankedList = sourceData.map((s, i) => ({ ...s, rank: i + 1 }));
        const top3 = rankedList.slice(0, 3);
        const podiumOrder = [top3.find(p => p.rank === 2), top3.find(p => p.rank === 1), top3.find(p => p.rank === 3)].filter(Boolean) as PodiumItemProps[];
        return { top: podiumOrder, list: rankedList.slice(3), percent: true };

    }, [filters, reportsData, classRosters, studentJoinedClassIds, teamsData, serverRankings, postedQuizzes, profile.id, profile.name]);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => setIsLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [rankedData]);


    return (
        <div className="space-y-4">
            <div className={`bg-white dark:bg-brand-mid-purple/80 rounded-2xl p-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : ''}`}>
                <div className="flex justify-end items-center mb-4">
                    <button onClick={openFilterMenu} aria-label={t('filterRankings')}>
                        <FilterIcon />
                    </button>
                </div>
                <div className="flex justify-around items-end h-40">
                    {rankedData.top.map((ranker, index) => (
                        <PodiumItem
                            key={ranker.rank}
                            rank={ranker.rank}
                            name={ranker.name}
                            avatar={ranker.avatar}
                            order={index + 1}
                            elevated={ranker.rank === 1}
                        />
                    ))}
                </div>
            </div>

            <div className={`bg-white dark:bg-brand-mid-purple/80 rounded-2xl p-2 space-y-1 transition-opacity duration-300 ${isLoading ? 'opacity-50' : ''}`}>
                {rankedData.list.map(player => (
                    <LeaderboardItem
                        key={player.name}
                        rank={player.rank}
                        name={player.name}
                        score={player.score}
                        avatar={player.avatar}
                        showPercent={Boolean((rankedData as any).percent)}
                        isCurrentUser={player.name === profile.name}
                    />
                ))}
            </div>
            
            {isFilterMenuRendered && <FilterMenu 
                isOpen={isFilterMenuOpen}
                onClose={closeFilterMenu} 
                availableQuizzes={availableQuizzes}
                filters={filters}
                onFilterChange={handleFilterChange}
            />}
        </div>
    );
};

export default RankingsScreen;