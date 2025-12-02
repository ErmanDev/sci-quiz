import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { ReportsTitleIcon } from '../icons';
import { ClassData } from '../ClassCard';
import { TeacherQuiz } from '../../data/teacherQuizzes';
import { ClassStudent } from '../../data/classStudentData';

declare global {
    interface Window {
        jspdf: any;
    }
}

const CustomSelect: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    placeholder: string;
}> = ({ value, onChange, children, placeholder }) => {
    return (
        <div className="relative w-48">
            <select
                value={value}
                onChange={onChange}
                className="w-full appearance-none bg-brand-mid-purple border border-brand-light-purple/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-glow"
            >
                <option value="" disabled>{placeholder}</option>
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ value: string; label1: string; label2: string }> = ({ value, label1, label2 }) => {
    // Determine font size based on value length to prevent overlap
    const valueLength = value.length;
    const fontSize = valueLength > 5 ? 'text-2xl' : 'text-3xl';
    
    return (
        <div className="bg-brand-mid-purple/80 p-2 rounded-xl text-center flex flex-col justify-center items-center border border-brand-light-purple/30 min-h-[90px]">
            <span className={`font-orbitron font-bold ${fontSize} text-white break-words px-1`}>{value}</span>
            <span className="text-xs text-gray-200 mt-1 leading-tight">{label1}</span>
            <span className="text-xs text-gray-300 leading-tight">{label2}</span>
        </div>
    );
};

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

interface ReportsScreenProps {
    reportsData: {
        singleQuizStudentScores: any[];
        allQuizzesStudentScores: any[];
    };
    classes: ClassData[];
    postedQuizzes: TeacherQuiz[];
    classRosters: Record<string, ClassStudent[]>;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ reportsData, classes, postedQuizzes, classRosters }) => {
    const { t } = useTranslations();
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedReportType, setSelectedReportType] = useState<'all' | 'per' | ''>('');
    const [selectedQuiz, setSelectedQuiz] = useState<string>('');
    const [showReport, setShowReport] = useState<boolean>(false);

    useEffect(() => {
        setShowReport(false);
        setSelectedQuiz('');
    }, [selectedClass]);

    useEffect(() => {
        setShowReport(false);
    }, [selectedReportType]);
    
    const isGenerateDisabled = !selectedClass || !selectedReportType || (selectedReportType === 'per' && !selectedQuiz);

    const handleGenerateReport = () => {
        if (!isGenerateDisabled) {
            setShowReport(true);
        }
    };

    const availableQuizzes = useMemo(() => {
        if (!selectedClass) return [];
        return postedQuizzes.filter(quiz =>
            !quiz.isDeleted && quiz.postedToClasses?.some(c => c.id === selectedClass)
        );
    }, [postedQuizzes, selectedClass]);
    
    const classStudentNames = useMemo(() => {
        if (!selectedClass || !classRosters[selectedClass]) {
            return new Set<string>();
        }
        return new Set(classRosters[selectedClass].map(student => student.name));
    }, [selectedClass, classRosters]);

    const filteredAllQuizzesScores = useMemo(() => {
        if (!showReport || !selectedClass) return [];
        // Filter by classId first (more reliable), then by name as fallback
        return reportsData.allQuizzesStudentScores.filter(score => 
            String(score.classId) === String(selectedClass) || 
            (score.classId === '' && classStudentNames.has(score.name))
        );
    }, [reportsData.allQuizzesStudentScores, selectedClass, classStudentNames, showReport]);

    const filteredSingleQuizScores = useMemo(() => {
        if (!showReport || !selectedClass) return [];
        // Filter by classId first (more reliable), then by name as fallback
        let filtered = reportsData.singleQuizStudentScores.filter(score => 
            String(score.classId) === String(selectedClass) || 
            (score.classId === '' && classStudentNames.has(score.name))
        );
        // This additionally filters by selected quiz for accuracy, assuming quizNumber matches quizId
        if (selectedReportType === 'per' && selectedQuiz) {
            filtered = filtered.filter(score => String(score.quizNumber) === selectedQuiz);
        }
        return filtered;
    }, [reportsData.singleQuizStudentScores, selectedClass, classStudentNames, showReport, selectedReportType, selectedQuiz]);

    const reportQuizName = useMemo(() => selectedReportType === 'per' && selectedQuiz
        ? postedQuizzes.find(q => q.id.toString() === selectedQuiz)?.title
        : 'Quiz #2', [selectedReportType, selectedQuiz, postedQuizzes]);

    const singleQuizPerformance = useMemo(() => {
        if (filteredSingleQuizScores.length === 0) return { name: reportQuizName, number: reportQuizName?.split(' ')[1], average: 0, median: 0, passRate: 0, highest: 0, lowest: 0 };
        // Parse score string (e.g., "85%" or "85") to number
        const scores = filteredSingleQuizScores.map(s => {
            const scoreStr = String(s.score || '0').replace('%', '');
            return parseFloat(scoreStr) || 0;
        });
        const sum = scores.reduce((a, b) => a + b, 0);
        const average = sum / scores.length;
        const sortedScores = [...scores].sort((a,b) => a-b);
        const mid = Math.floor(sortedScores.length / 2);
        const median = sortedScores.length % 2 === 0 ? (sortedScores[mid-1] + sortedScores[mid]) / 2 : sortedScores[mid];
        const passRate = (scores.filter(s => s >= 75).length / scores.length) * 100;
        return {
            name: reportQuizName,
            number: reportQuizName?.split(' ')[1] || '#?',
            average: Math.round(average * 10) / 10, 
            median: Math.round(median * 10) / 10, 
            passRate: Math.round(passRate * 10) / 10, 
            highest: Math.round(Math.max(...scores) * 10) / 10, 
            lowest: Math.round(Math.min(...scores) * 10) / 10,
        };
    }, [filteredSingleQuizScores, reportQuizName]);
    
    
    const allQuizzesPerformance = useMemo(() => {
        if (filteredAllQuizzesScores.length === 0) return { average: 0, median: 0, passRate: 0, highest: 0, lowest: 0 };
        const averages = filteredAllQuizzesScores.map(s => s.average);
        const totalAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
        const sortedAverages = [...averages].sort((a, b) => a - b);
        let median;
        const mid = Math.floor(sortedAverages.length / 2);
        median = sortedAverages.length % 2 === 0 ? (sortedAverages[mid - 1] + sortedAverages[mid]) / 2 : sortedAverages[mid];
        const passRate = (filteredAllQuizzesScores.filter(s => s.average >= 75).length / filteredAllQuizzesScores.length) * 100;
        return { average: totalAverage, median, passRate, highest: Math.max(...averages), lowest: Math.min(...averages) };
    }, [filteredAllQuizzesScores]);

    const chartTitle = selectedReportType === 'per' && selectedQuiz
        ? `Scores for: ${postedQuizzes.find(q => q.id.toString() === selectedQuiz)?.title}`
        : 'Overall Student Performance';

    const chartData = selectedReportType === 'per'
      ? filteredSingleQuizScores.map(s => {
          const scoreStr = String(s.score || '0').replace('%', '');
          return {
            name: s.name.split(' ')[0],
            score: parseFloat(scoreStr) || 0
          };
        })
      : filteredAllQuizzesScores.map(s => ({ name: s.name.split(' ')[0], score: s.average }));
        
    const handleDownloadChart = () => {
        const excellentStudents = chartData.filter(s => s.score >= 90).length;
        const averageStudents = chartData.filter(s => s.score >= 75 && s.score < 90).length;
        const needsImprovementStudents = chartData.filter(s => s.score < 75).length;
        const totalStudents = chartData.length;

        if (totalStudents === 0) {
            alert("No chart data available to download.");
            return;
        }

        const excellentPercentage = (excellentStudents / totalStudents) * 100;
        const averagePercentage = (averageStudents / totalStudents) * 100;
        const needsImprovementPercentage = (needsImprovementStudents / totalStudents) * 100;

        const chartWidth = 500, chartHeight = 350, padding = 20;
        const radius = Math.min(chartWidth, chartHeight) / 2 - padding - 30;
        const centerX = chartWidth / 2;
        const centerY = (chartHeight - 60) / 2;

        const getCoordinatesForAngle = (angle: number) => {
            return [
                centerX + radius * Math.cos((angle - 90) * Math.PI / 180),
                centerY + radius * Math.sin((angle - 90) * Math.PI / 180)
            ];
        };

        const drawSlice = (startAngle: number, endAngle: number, color: string) => {
            if (Math.abs(endAngle - startAngle) < 0.01) return '';
            
            const [startX, startY] = getCoordinatesForAngle(startAngle);
            const [endX, endY] = getCoordinatesForAngle(endAngle);
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

            if (Math.abs(endAngle - startAngle - 360) < 0.01) {
                return `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" />`;
            }

            return `<path d="M${centerX},${centerY} L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z" fill="${color}" />`;
        };

        let svgContent = `<svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Roboto', sans-serif; background-color: #2c1250;">`;
        
        let currentAngle = 0;
        const excellentAngle = (excellentPercentage / 100) * 360;
        const averageAngle = (averagePercentage / 100) * 360;

        svgContent += drawSlice(currentAngle, currentAngle + excellentAngle, '#4ade80');
        currentAngle += excellentAngle;
        svgContent += drawSlice(currentAngle, currentAngle + averageAngle, '#facc15');
        currentAngle += averageAngle;
        svgContent += drawSlice(currentAngle, 360, '#f87171');

        // Legend
        const legendY = chartHeight - 50;
        svgContent += `<rect x="${padding}" y="${legendY}" width="15" height="15" fill="#4ade80" />`;
        svgContent += `<text x="${padding + 20}" y="${legendY + 12}" fill="#ffffff" font-size="12">Excellent (90-100%): ${excellentPercentage.toFixed(1)}%</text>`;
        
        svgContent += `<rect x="${padding}" y="${legendY + 20}" width="15" height="15" fill="#facc15" />`;
        svgContent += `<text x="${padding + 20}" y="${legendY + 32}" fill="#ffffff" font-size="12">Average (75-89%): ${averagePercentage.toFixed(1)}%</text>`;
        
        svgContent += `<rect x="${padding + 250}" y="${legendY}" width="15" height="15" fill="#f87171" />`;
        svgContent += `<text x="${padding + 270}" y="${legendY + 12}" fill="#ffffff" font-size="12">Needs Improvement (<75%): ${needsImprovementPercentage.toFixed(1)}%</text>`;

        svgContent += `</svg>`;
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' }), url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = 'student-performance-pie-chart.svg';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const rankedAllQuizzesScores = useMemo(() => filteredAllQuizzesScores
        .sort((a: any, b: any) => b.average - a.average)
        .map((student: any, index: number) => ({ ...student, ranking: index + 1 })), [filteredAllQuizzesScores]);
        
    const rankedSingleQuizScores = useMemo(() => filteredSingleQuizScores
        .sort((a, b) => {
            const scoreA = parseFloat(String(a.score || '0').replace('%', '')) || 0;
            const scoreB = parseFloat(String(b.score || '0').replace('%', '')) || 0;
            return scoreB - scoreA;
        })
        .map((student, index) => ({ ...student, ranking: index + 1 })),
    [filteredSingleQuizScores]);

    const handleExportCSV = () => {
        let csvContent = "", rows: string[][] = [], headers: string[] = [];
        const selectedClassData = classes.find(c => c.id === selectedClass);
        const selectedClassName = selectedClassData ? `${selectedClassData.name} - ${selectedClassData.section}` : 'N/A';
        const generationDate = new Date().toLocaleDateString();
        let reportTypeString = "";
        if (selectedReportType === 'all') {
            reportTypeString = "All Quizzes";
            headers = ["Name", "Average Score (%)", "Overall Ranking"];
            rows = rankedAllQuizzesScores.map((student: any) => [`"${student.name}"`, student.average.toFixed(2), student.ranking.toString()]);
        } else {
            reportTypeString = reportQuizName || "Per Quiz";
            headers = ["Name", "Raw Score", "Score (%)", "Ranking"];
            const quiz = postedQuizzes.find(q => q.id.toString() === selectedQuiz);
            const totalQuestions = quiz ? quiz.questions.length : 0;
            rows = rankedSingleQuizScores.map((student: any) => {
                const studentScore = parseFloat(String(student.score || '0').replace('%', '')) || 0;
                const rawScore = totalQuestions > 0 ? Math.round((studentScore / 100) * totalQuestions) : 0;
                const rawScoreDisplay = `${rawScore} | ${totalQuestions}`;
                return [`"${student.name}"`, `"${rawScoreDisplay}"`, `"${student.score}"`, student.ranking.toString()];
            });
        }
        csvContent += `"Report for:","${selectedClassName}"\n"Report Type:","${reportTypeString}"\n`;
        if (selectedReportType === 'all') {
            const totalQuizzes = availableQuizzes.length;
            csvContent += `"Total Quizzes in Class:","${totalQuizzes}"\n`;
        }
        csvContent += `"Generated on:","${generationDate}"\n\n`;
        csvContent += headers.join(",") + "\n";
        rows.forEach(rowArray => { csvContent += rowArray.join(",") + "\n"; });
        const classNameForFile = selectedClassName.replace(/ /g, '_').replace(/-/g, '');
        let fileName = selectedReportType === 'all' ? `report_${classNameForFile}_all_quizzes.csv` : `report_${classNameForFile}_${reportQuizName?.replace(/ /g, '_').replace(/#/g, '') || 'quiz'}.csv`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url); link.setAttribute("download", fileName);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const { jsPDF } = window.jspdf; const doc = new jsPDF();
        let head: string[][] = [], body: (string|number)[][] = [];
        const selectedClassData = classes.find(c => c.id === selectedClass);
        const selectedClassName = selectedClassData ? `${selectedClassData.name} - ${selectedClassData.section}` : 'N/A';
        const generationDate = new Date().toLocaleDateString();
        let reportTypeString = "";
        let startY = 40;

        if (selectedReportType === 'all') {
            reportTypeString = "All Quizzes";
            head = [['Name', 'Average Score (%)', 'Overall Ranking']];
            body = rankedAllQuizzesScores.map((student: any) => [student.name, student.average.toFixed(2), student.ranking]);
        } else {
            reportTypeString = reportQuizName || "Per Quiz";
            head = [['Name', 'Raw Score', 'Score (%)', 'Ranking']];
            const quiz = postedQuizzes.find(q => q.id.toString() === selectedQuiz);
            const totalQuestions = quiz ? quiz.questions.length : 0;
            body = rankedSingleQuizScores.map((student: any) => {
                const studentScore = parseFloat(String(student.score || '0').replace('%', '')) || 0;
                const correctAnswers = totalQuestions > 0 ? Math.round((studentScore / 100) * totalQuestions) : 0;
                const rawScoreDisplay = totalQuestions > 0 ? `${correctAnswers}/${totalQuestions}` : 'N/A';
                return [student.name, rawScoreDisplay, student.score, student.ranking];
            });
        }
        doc.setFontSize(16); doc.text(`Report for: ${selectedClassName}`, 14, 20);
        doc.setFontSize(11); doc.setTextColor(100);
        doc.text(`Type: ${reportTypeString}`, 14, 28);

        if (selectedReportType === 'all') {
            const totalQuizzes = availableQuizzes.length;
            doc.text(`Total Quizzes in Class: ${totalQuizzes}`, 14, 34);
            doc.text(`Generated on: ${generationDate}`, 14, 40);
            startY = 46;
        } else {
            doc.text(`Generated on: ${generationDate}`, 14, 34);
            startY = 40;
        }

        (doc as any).autoTable({ startY, head, body, theme: 'plain' });
        const classNameForFile = selectedClassName.replace(/ /g, '_').replace(/-/g, '');
        let fileName = selectedReportType === 'all' ? `report_${classNameForFile}_all_quizzes.pdf` : `report_${classNameForFile}_${reportQuizName?.replace(/ /g, '_').replace(/#/g, '') || 'quiz'}.pdf`;
        doc.save(fileName);
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center mb-2">
                    <ReportsTitleIcon />
                    <h1 className="font-orbitron text-4xl font-bold">{t('reports')}</h1>
                </div>
                <p className="text-gray-300 mb-8 max-w-sm">{t('reportsDescription')}</p>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="font-bold text-lg text-blue-300">{t('classSection')}</label>
                        <CustomSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} placeholder={t('chooseSection')}>
                            {classes.map(cls => <option key={cls.id} value={cls.id}>{`${cls.name} - ${cls.section}`}</option>)}
                        </CustomSelect>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="font-bold text-lg text-blue-300">{t('reportType')}</label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedReportType('all')}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                                    ${selectedReportType === 'all'
                                        ? 'bg-brand-accent text-white border-brand-accent'
                                        : 'bg-brand-mid-purple/60 text-gray-200 border-brand-light-purple/40 hover:bg-brand-mid-purple/80'
                                    }`}
                            >
                                {t('allQuizzes')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedReportType('per')}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                                    ${selectedReportType === 'per'
                                        ? 'bg-brand-accent text-white border-brand-accent'
                                        : 'bg-brand-mid-purple/60 text-gray-200 border-brand-light-purple/40 hover:bg-brand-mid-purple/80'
                                    }`}
                            >
                                {t('perQuiz')}
                            </button>
                        </div>
                    </div>
                    {selectedReportType === 'per' && (
                         <div className="flex items-center justify-between transition-opacity duration-300">
                            <label className="font-bold text-lg text-blue-300">{t('perQuiz')}</label>
                            <CustomSelect value={selectedQuiz} onChange={(e) => setSelectedQuiz(e.target.value)} placeholder={t('selectAQuiz')}>
                                {availableQuizzes.map(quiz => <option key={quiz.id} value={String(quiz.id)}>{quiz.title}</option>)}
                            </CustomSelect>
                        </div>
                    )}
                </div>
                <div className="mt-6">
                    <button onClick={handleGenerateReport} disabled={isGenerateDisabled} className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-90 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-glow focus:ring-opacity-75 disabled:bg-gray-500/50 disabled:cursor-not-allowed disabled:shadow-none">
                        {t('generateReport')}
                    </button>
                </div>
            </div>
            
            {showReport && (
                <div className="space-y-6">
                    {selectedReportType === 'all' ? (
                        <div className="grid grid-cols-3 gap-2">
                            <StatCard value="All" label1="Quizzes" label2="" />
                            <StatCard value={allQuizzesPerformance.average.toFixed(1)} label1="Average" label2="(%)" />
                            <StatCard value={allQuizzesPerformance.median.toFixed(1)} label1="Median" label2="(%)" />
                            <StatCard value={allQuizzesPerformance.passRate.toFixed(1)} label1="Pass Rate" label2="(%)" />
                            <StatCard value={allQuizzesPerformance.highest.toFixed(1)} label1="Highest" label2="(%)" />
                            <StatCard value={allQuizzesPerformance.lowest.toFixed(1)} label1="Lowest" label2="(%)" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            <StatCard value={singleQuizPerformance.number} label1={(singleQuizPerformance.name?.split(' ')[0] || 'Quiz')} label2={''} />
                            <StatCard value={singleQuizPerformance.average.toFixed(1)} label1="Average" label2="(%)" />
                            <StatCard value={singleQuizPerformance.median.toFixed(1)} label1="Median" label2="(%)" />
                            <StatCard value={singleQuizPerformance.passRate.toFixed(1)} label1="Pass Rate" label2="(%)" />
                            <StatCard value={singleQuizPerformance.highest.toFixed(1)} label1="Highest" label2="(%)" />
                            <StatCard value={singleQuizPerformance.lowest.toFixed(1)} label1="Lowest" label2="(%)" />
                        </div>
                    )}

                    <div>
                        <div className="bg-brand-mid-purple/80 rounded-xl p-4 border border-brand-light-purple/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">{t('studentScores')}</h3>
                                <button onClick={handleDownloadChart} aria-label="Download chart"><DownloadIcon /></button>
                            </div>
                            <div className="flex justify-center items-center" style={{ height: '250px' }}>
                                <svg width="200" height="200" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="80" fill="transparent" stroke="#4a5568" strokeWidth="25" />
                                    {(() => {
                                        const excellentStudents = chartData.filter(s => s.score >= 90).length;
                                        const averageStudents = chartData.filter(s => s.score >= 75 && s.score < 90).length;
                                        const totalStudents = chartData.length;

                                        if (totalStudents === 0) return null;

                                        const excellentPercentage = (excellentStudents / totalStudents) * 100;
                                        const averagePercentage = (averageStudents / totalStudents) * 100;

                                        const circumference = 2 * Math.PI * 80;
                                        const excellentCirc = (excellentPercentage / 100) * circumference;
                                        const averageCirc = (averagePercentage / 100) * circumference;

                                        const excellentAngle = (excellentPercentage / 100) * 360;
                                        const averageAngle = (averagePercentage / 100) * 360;

                                        return (
                                            <>
                                                {excellentCirc > 0 && <circle cx="100" cy="100" r="80" fill="transparent" stroke="#4ade80" strokeWidth="25" strokeDasharray={`${excellentCirc} ${circumference}`} transform="rotate(-90 100 100)" />}
                                                {averageCirc > 0 && <circle cx="100" cy="100" r="80" fill="transparent" stroke="#facc15" strokeWidth="25" strokeDasharray={`${averageCirc} ${circumference}`} transform={`rotate(${excellentAngle - 90} 100 100)`} />}
                                                <circle cx="100" cy="100" r="80" fill="transparent" stroke="#f87171" strokeWidth="25" strokeDasharray={`${circumference - excellentCirc - averageCirc} ${circumference}`} transform={`rotate(${excellentAngle + averageAngle - 90} 100 100)`} />
                                            </>
                                        );
                                    })()}
                                </svg>
                            </div>
                             <div className="flex flex-col items-center space-y-2 mt-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-white text-sm">Excellent (90-100%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                                    <span className="text-white text-sm">Average (75-89%)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-white text-sm">Needs Improvement (&lt;75%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-bold text-xl text-white mb-4">Student Scores</h2>
                        {selectedReportType === 'all' ? (
                            <div className="bg-brand-mid-purple/80 rounded-xl p-4 border border-brand-light-purple/50 max-h-96 overflow-y-auto hide-scrollbar">
                                <table className="w-full text-sm text-left text-white">
                                    <thead className="sticky top-0 bg-brand-mid-purple z-10">
                                        <tr className="border-b-2 border-brand-light-purple/50 text-gray-300">
                                            <th className="py-2 pr-2 font-semibold">Name</th>
                                            <th className="py-2 px-2 font-semibold text-center">Average Score</th>
                                            <th className="py-2 pl-2 font-semibold text-center">Overall Ranking</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankedAllQuizzesScores.map((student: any, index: number) => (
                                            <tr key={index} className="border-b border-brand-light-purple/30 last:border-b-0">
                                                <td className="py-3 pr-2 font-semibold">{student.name}</td>
                                                <td className="py-3 px-2 text-center">{student.average.toFixed(2)}%</td>
                                                <td className="py-3 pl-2 text-center">{student.ranking}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-brand-mid-purple/80 rounded-xl p-4 border border-brand-light-purple/50 max-h-96 overflow-y-auto hide-scrollbar">
                                <table className="w-full text-sm text-left text-white">
                                    <thead className="sticky top-0 bg-brand-mid-purple z-10">
                                        <tr className="border-b-2 border-brand-light-purple/50 text-gray-300">
                                            <th className="py-2 pr-2 font-semibold w-1/3">Name</th>
                                            <th className="py-2 px-2 font-semibold text-center w-1/3">Raw Score</th>
                                            <th className="py-2 px-2 font-semibold text-center w-1/3">Score (%)</th>
                                            <th className="py-2 pl-2 font-semibold text-center">Rank</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankedSingleQuizScores.map((student: any, index: number) => {
                                            const quiz = postedQuizzes.find(q => q.id.toString() === selectedQuiz);
                                            const totalQuestions = quiz ? quiz.questions.length : 0;
                                            const studentScorePercent = parseFloat(String(student.score || '0').replace('%', '')) || 0;
                                            const correctAnswers = totalQuestions > 0 ? Math.round((studentScorePercent / 100) * totalQuestions) : 0;
                                            const rawScoreDisplay = totalQuestions > 0 ? `${correctAnswers}/${totalQuestions}` : 'N/A';
                                            return (
                                            <tr key={index} className="border-b border-brand-light-purple/30 last:border-b-0">
                                                <td className="py-3 pr-2 font-semibold">{student.name}</td>
                                                <td className="py-3 px-2 text-center">{rawScoreDisplay}</td>
                                                <td className="py-3 px-2 text-center">{student.score}</td>
                                                <td className="py-3 pl-2 text-center">{student.ranking}</td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={handleExportCSV} className="bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg transition-colors hover:bg-blue-500">
                                Export CSV
                            </button>
                            <button onClick={handleExportPDF} className="bg-brand-light-purple text-white font-semibold py-2 px-8 rounded-lg transition-colors hover:bg-brand-mid-purple">
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsScreen;