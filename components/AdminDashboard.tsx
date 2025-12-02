import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SciQuestLogo from './SciQuestLogo';
import { API_URL } from '../server/src/config';

interface AdminDashboardProps {
  onBackToLanding: () => void;
  onLogout: () => void;
}

interface AdminUser {
  id: string;
  role: 'teacher' | 'student' | 'admin';
  email: string;
  name: string;
  level?: number;
  xp?: number;
  accuracy?: number;
  createdAt?: string;
}

interface ClassSummary {
  id: string;
  name?: string;
  section?: string;
  teacherId?: string;
  code?: string;
  studentCount?: number;
}

interface PostedQuiz {
  id: string;
  quizId: string;
  classId: string;
  dueDate: string;
}

type TabKey = 'teachers' | 'students' | 'quiz-vault';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToLanding, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('teachers');
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [quizVaultQuestions, setQuizVaultQuestions] = useState<any[]>([]);
  const [postedQuizzes, setPostedQuizzes] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [selectedQuizScores, setSelectedQuizScores] = useState<{ [studentId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [showAllRecordsModal, setShowAllRecordsModal] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    type: 'multiple-choice',
    category: 'Earth and Space',
    question: '',
    options: ['', '', '', ''],
    answer: '',
    points: 1,
    timeLimit: undefined as number | undefined,
    imageUrl: '',
  });

  const currentAdmin = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = authHeaders();
      const commonOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include',
      };

      const [teacherRes, studentRes, classesRes, vaultRes, quizzesRes, classStudentsRes] = await Promise.all([
        fetch(`${API_URL}/api/users?role=teacher`, commonOptions),
        fetch(`${API_URL}/api/users?role=student`, commonOptions),
        fetch(`${API_URL}/api/classes`, {
          method: 'GET',
          credentials: 'include',
        }),
        fetch(`${API_URL}/api/quiz-bank`, commonOptions),
        fetch(`${API_URL}/api/quizzes?status=posted`, commonOptions),
        fetch(`${API_URL}/api/class-students`, commonOptions), // Add this line
      ]);

      if ([teacherRes, studentRes, quizzesRes, classStudentsRes].some(res => res.status === 401)) {
        setError('Your session expired. Please log in again.');
        onLogout();
        return;
      }
      if (!teacherRes.ok) throw new Error(await teacherRes.text() || 'Failed to load teachers');
      if (!studentRes.ok) throw new Error(await studentRes.text() || 'Failed to load students');
      if (!classesRes.ok) throw new Error(await classesRes.text() || 'Failed to load classes');
      if (!vaultRes.ok) throw new Error(await vaultRes.text() || 'Failed to load vault questions');
      if (!quizzesRes.ok) throw new Error(await quizzesRes.text() || 'Failed to load posted quizzes');
      if (!classStudentsRes.ok) throw new Error(await classStudentsRes.text() || 'Failed to load class students');

      const [teacherData, studentData, classesData, vaultData, quizzesData, classStudentsData] = await Promise.all([
        teacherRes.json(),
        studentRes.json(),
        classesRes.json(),
        vaultRes.json(),
        quizzesRes.json(),
        classStudentsRes.json(), // Add this line
      ]);

      setTeachers(Array.isArray(teacherData) ? teacherData : []);
      setStudents(Array.isArray(studentData) ? studentData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setQuizVaultQuestions(Array.isArray(vaultData) ? vaultData : []);
      setPostedQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      setClassStudents(Array.isArray(classStudentsData) ? classStudentsData : []); // Add this line
    } catch (err: any) {
      console.error('[AdminDashboard] loadData failed', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, onLogout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = activeTab === 'teachers' ? teachers : students;
    if (!term) return list;
    return list.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .map((field) => String(field).toLowerCase())
        .some((field) => field.includes(term)),
    );
  }, [activeTab, searchTerm, students, teachers]);

  const filteredQuestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return quizVaultQuestions;
    return quizVaultQuestions.filter((q) =>
      [q.question, q.category]
        .filter(Boolean)
        .map((field) => String(field).toLowerCase())
        .some((field) => field.includes(term)),
    );
  }, [searchTerm, quizVaultQuestions]);

  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  const classSummaryByTeacher = useMemo(() => {
    const map = new Map<string, number>();
    for (const cls of classes) {
      if (cls.teacherId) {
        const key = String(cls.teacherId);
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [classes]);

  const totalClasses = classes.length;

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Remove ${user.name} (${user.role}) permanently? This cannot be undone.`)) {
      return;
    }

    setBusyUserId(user.id);
    setFeedback(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders(),
      };
      const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        setFeedback({ type: 'error', message: 'Session expired. Please log in again.' });
        onLogout();
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to remove user');
      }

      setFeedback({ type: 'success', message: `${user.name} has been removed.` });
      await loadData();
    } catch (err: any) {
      console.error('[AdminDashboard] delete user failed', err);
      setFeedback({ type: 'error', message: err?.message || 'Unable to remove user' });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherFormData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!teacherFormData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!teacherFormData.employeeId.trim()) {
      setError('Employee ID is required');
      return;
    }
    if (!teacherFormData.password) {
      setError('Password is required');
      return;
    }
    if (teacherFormData.password !== teacherFormData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (teacherFormData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setCreatingTeacher(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/create-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: teacherFormData.name.trim(),
          email: teacherFormData.email.trim().toLowerCase(),
          employeeId: teacherFormData.employeeId.trim(),
          password: teacherFormData.password,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setError(data.message || 'Email or Employee ID already exists');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create teacher');
      }

      const createdTeacher = await res.json();
      setFeedback({
        type: 'success',
        message: `Teacher ${createdTeacher.name} created successfully`,
      });

      setTeacherFormData({
        name: '',
        email: '',
        employeeId: '',
        password: '',
        confirmPassword: '',
      });
      setShowCreateTeacherModal(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create teacher account');
    } finally {
      setCreatingTeacher(false);
    }
  };

  const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacherFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      type: 'multiple-choice',
      category: 'Earth and Space',
      question: '',
      options: ['', '', '', ''],
      answer: '',
      points: 1,
      timeLimit: undefined,
      imageUrl: '',
    });
    setEditingQuestionId(null);
    setError(null);
  };

  const handleOpenQuestionModal = (question?: any) => {
    if (question) {
      setQuestionFormData({
        type: question.type,
        category: question.category,
        question: question.question,
        options: question.options || ['', '', '', ''],
        answer: question.answer,
        points: question.points || 1,
        timeLimit: question.timeLimit,
        imageUrl: question.imageUrl || '',
      });
      setEditingQuestionId(question.id);
    } else {
      resetQuestionForm();
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionFormData.question.trim()) {
      setError('Question text is required');
      return;
    }
    if (!questionFormData.category) {
      setError('Category is required');
      return;
    }
    if (!questionFormData.answer.trim()) {
      setError('Answer is required');
      return;
    }

    if (questionFormData.type === 'multiple-choice') {
      const filledOptions = questionFormData.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setError('Multiple choice requires at least 2 options');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        type: questionFormData.type,
        category: questionFormData.category,
        question: questionFormData.question.trim(),
        options: questionFormData.type === 'multiple-choice'
          ? questionFormData.options.filter((o) => o.trim())
          : undefined,
        answer: questionFormData.answer.trim(),
        points: questionFormData.points,
        timeLimit: questionFormData.timeLimit || undefined,
        imageUrl: questionFormData.imageUrl.trim() || undefined,
        teacherId: '', // Global questions
      };

      if (editingQuestionId) {
        // Update existing question
        const res = await fetch(`${API_URL}/api/quiz-bank/${editingQuestionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to update question');
        }

        setFeedback({ type: 'success', message: 'Question updated successfully' });
      } else {
        // Create new question
        const res = await fetch(`${API_URL}/api/quiz-bank`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to create question');
        }

        setFeedback({ type: 'success', message: 'Question added successfully' });
      }

      setShowQuestionModal(false);
      resetQuestionForm();
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Delete this question permanently? This cannot be undone.')) return;

    setBusyUserId(questionId);
    try {
      const res = await fetch(`${API_URL}/api/quiz-bank/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete question');
      }

      setFeedback({ type: 'success', message: 'Question deleted successfully' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete question' });
    } finally {
      setBusyUserId(null);
    }
  };

  const fetchQuizScores = async (quizId: string, studentId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/submissions?quizId=${quizId}&studentId=${studentId}`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch quiz scores');
      const submissions = await res.json();
      const submission = submissions[0];
      return submission ? `${submission.score}/${submission.totalPoints}` : 'Not taken';
    } catch (err) {
      console.error('Error fetching quiz scores:', err);
      return 'Error';
    }
  };

  const handleExportStudentRecords = async (student: AdminUser) => {
    setBusyUserId(student.id);
    try {
      // 1. Fetch all submissions for the student
      const res = await fetch(`${API_URL}/api/submissions?studentId=${student.id}`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch student submissions');
      const submissions = await res.json();

      if (!submissions || submissions.length === 0) {
        alert('This student has no quiz records to export.');
        return;
      }

      // Find student's class section
      const classStudent = classStudents.find((cs) => cs.studentId === student.id);
      const cls = classStudent ? classes.find((c) => c.id === classStudent.classId) : null;
      const classSectionInfo = cls ? `${cls.name}${cls.section ? ` - ${cls.section}` : ''}` : 'No Class Assigned';

      // 2. Prepare CSV content
      const headers = ['Quiz Title', 'Score', 'Total Points'];
      const rows = submissions.map((sub: any) => {
        const quiz = postedQuizzes.find((q) => q.id === sub.quizId);
        return [quiz?.title || sub.quizId, sub.score, sub.totalPoints];
      });

      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Class Section,"${classSectionInfo}"\r\n\r\n`; // Add class section info
      csvContent += headers.join(',') + '\r\n';
      rows.forEach((rowArray) => {
        const row = rowArray.join(',');
        csvContent += row + '\r\n';
      });

      // 3. Trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${student.name}_quiz_records.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Failed to export student records:', err);
      setFeedback({ type: 'error', message: err.message || 'Could not export records.' });
    } finally {
      setBusyUserId(null);
    }
  };


  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-brand-deep-purple text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10">
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between mb-6 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <SciQuestLogo />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">Admin Control Center</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Signed in as {currentAdmin?.name ?? currentAdmin?.email ?? 'Administrator'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToLanding}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-brand-accent text-brand-accent font-semibold hover:bg-brand-accent/10 transition"
            >
              Back to Landing
            </button>
            <button
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-brand-accent text-white font-semibold shadow hover:bg-brand-accent/90 transition"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-10">
          <div className="bg-white/90 dark:bg-brand-mid-purple/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-brand-light-purple/30">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teachers</p>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{totalTeachers}</p>
            <p className="text-xs text-gray-400 mt-1">
              {classSummaryByTeacher.size} with active classes
            </p>
          </div>
          <div className="bg-white/90 dark:bg-brand-mid-purple/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-brand-light-purple/30">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students</p>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{totalStudents}</p>
            <p className="text-xs text-gray-400 mt-1">
              {students.filter(s => (s?.xp ?? 0) > 0).length} actively earning XP
            </p>
          </div>
          <div className="bg-white/90 dark:bg-brand-mid-purple/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-brand-light-purple/30">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider">Classes</p>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{totalClasses}</p>
            <p className="text-xs text-gray-400 mt-1">
              {classes.reduce((sum, cls) => sum + (cls.studentCount ?? 0), 0)} total seats
            </p>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-brand-mid-purple/70 rounded-2xl sm:rounded-3xl shadow-xl border border-brand-light-purple/40 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/30 dark:border-brand-light-purple/30">
            <div className="flex gap-2 sm:gap-3">
              {(['teachers', 'students', 'quiz-vault'] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-brand-accent text-white shadow-md'
                      : 'bg-transparent border border-brand-light-purple/30 text-gray-600 dark:text-gray-200'
                  }`}
                >
                  {tab === 'teachers' ? 'Teachers' : tab === 'students' ? 'Students' : 'Quiz Vault'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-3 items-center">
              {activeTab === 'teachers' && (
                <button
                  onClick={() => setShowCreateTeacherModal(true)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-brand-accent text-white hover:bg-brand-accent/90 transition shadow-md"
                >
                  + Create Teacher
                </button>
              )}
              {activeTab === 'quiz-vault' && (
                <button
                  onClick={() => handleOpenQuestionModal()}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-brand-accent text-white hover:bg-brand-accent/90 transition shadow-md"
                >
                  + Add Question
                </button>
              )}
              {activeTab === 'students' && (
                <button
                  onClick={() => setShowAllRecordsModal(true)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
                >
                  All Records
                </button>
              )}
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email…"
                className="flex-1 sm:flex-none sm:w-64 px-3 sm:px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="max-h-[60vh] sm:max-h-[480px] overflow-auto">
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-200 text-sm">
                Loading {activeTab}…
              </div>
            ) : error ? (
              <div className="p-6 sm:p-8 text-center text-red-500 text-sm">{error}</div>
            ) : activeTab === 'quiz-vault' ? (
              filteredQuestions.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-200 text-sm">
                  No questions found in Quiz Vault.
                </div>
              ) : (
                <div className="divide-y divide-gray-200/60 dark:divide-brand-light-purple/20">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 hover:bg-gray-50/80 dark:hover:bg-brand-mid-purple/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{q.question}</div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-brand-accent/10 text-brand-accent">
                              {q.category}
                            </span>
                            <span className="px-2 py-1 rounded bg-blue-100/60 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                              {q.type === 'multiple-choice' ? 'Multiple Choice' : 'Identification'}
                            </span>
                            <span className="px-2 py-1 rounded bg-green-100/60 text-green-700 dark:bg-green-900/40 dark:text-green-200">
                              {q.points} pt
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleOpenQuestionModal(q)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            disabled={busyUserId === q.id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-200 text-sm">
                No {activeTab} found.
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden divide-y divide-gray-200/60 dark:divide-brand-light-purple/20">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-50/80 dark:hover:bg-brand-mid-purple/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{user.name || '—'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                          <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">ID: {user.id}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={busyUserId === user.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                      {activeTab === 'teachers' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold">
                            Classes: {classSummaryByTeacher.get(user.id) ?? 0}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 text-xs font-semibold">
                            Active
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold">
                            Lv {user.level ?? 1}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">Accuracy: {Math.round(Number.isFinite(user.accuracy) ? (user.accuracy as number) : 0)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="hidden md:table min-w-full text-sm">
                  <thead className="bg-gray-100/80 dark:bg-brand-deep-purple/80 text-gray-600 dark:text-gray-200 uppercase tracking-wide text-xs">
                    {activeTab === 'teachers' ? (
                      <tr>
                        <th className="text-left px-6 py-3">ID</th>
                        <th className="text-left px-6 py-3">Name</th>
                        <th className="text-left px-6 py-3">Email</th>
                        <th className="text-left px-6 py-3">Classes</th>
                        <th className="text-right px-6 py-3">Actions</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="text-left px-6 py-3">ID</th>
                        <th className="text-left px-6 py-3">Name</th>
                        <th className="text-left px-6 py-3">Email</th>
                        <th className="text-left px-6 py-3">Status</th>
                        <th className="text-left px-6 py-3">Level</th>
                        <th className="text-left px-6 py-3">Accuracy</th>
                        <th className="text-right px-6 py-3">Actions</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-200/60 dark:border-brand-light-purple/20 hover:bg-gray-50/80 dark:hover:bg-brand-mid-purple/40 transition-colors"
                      >
                        {activeTab === 'teachers' ? (
                          <>
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{user.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium">{user.name || '—'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600 dark:text-gray-200">{user.email}</span>
                            </td>
                            <td className="px-6 py-4">{classSummaryByTeacher.get(user.id) ?? 0}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{user.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium">{user.name || '—'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600 dark:text-gray-200">{user.email}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 text-xs font-semibold">Active</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold">Lv {user.level ?? 1}</span>
                            </td>
                            <td className="px-6 py-4">{Math.round(Number.isFinite(user.accuracy) ? (user.accuracy as number) : 0)}%</td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={busyUserId === user.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {showCreateTeacherModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-brand-mid-purple rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-brand-light-purple/30">
                <h3 className="text-lg sm:text-xl font-semibold">Create New Teacher Account</h3>
                <button
                  onClick={() => {
                    setShowCreateTeacherModal(false);
                    setError(null);
                    setTeacherFormData({
                      name: '',
                      email: '',
                      employeeId: '',
                      password: '',
                      confirmPassword: '',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={teacherFormData.name}
                    onChange={handleTeacherFormChange}
                    placeholder="e.g., John Smith"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={teacherFormData.email}
                    onChange={handleTeacherFormChange}
                    placeholder="e.g., john@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={teacherFormData.employeeId}
                    onChange={handleTeacherFormChange}
                    placeholder="e.g., EMP-12345"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={teacherFormData.password}
                    onChange={handleTeacherFormChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={teacherFormData.confirmPassword}
                    onChange={handleTeacherFormChange}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTeacherModal(false);
                      setError(null);
                      setTeacherFormData({
                        name: '',
                        email: '',
                        employeeId: '',
                        password: '',
                        confirmPassword: '',
                      });
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-brand-light-purple/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTeacher}
                    className="flex-1 px-4 py-2 rounded-lg bg-brand-accent text-white font-semibold hover:bg-brand-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingTeacher ? 'Creating...' : 'Create Teacher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAllRecordsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-brand-mid-purple rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-brand-light-purple/30">
                <h3 className="text-lg sm:text-xl font-semibold">All Student Records ({students.length})</h3>
                <button
                  onClick={() => setShowAllRecordsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-grow overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100/80 dark:bg-brand-deep-purple/80 backdrop-blur-sm text-gray-600 dark:text-gray-200 uppercase tracking-wide text-xs">
                    <tr>
                      <th className="text-left px-6 py-3">ID</th>
                      <th className="text-left px-6 py-3">Name</th>
                      <th className="text-left px-6 py-3">Email</th>
                      <th className="text-left px-6 py-3">Class Joined</th>
                      <th className="text-left px-6 py-3">Quiz Selection</th>
                      <th className="text-left px-6 py-3">Export CSV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 dark:divide-brand-light-purple/20">
                    {students.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-brand-mid-purple/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{user.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{user.name || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 dark:text-gray-200">{user.email}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {(() => {
                            const classStudent = classStudents.find(cs => cs.studentId === user.id);
                            if (!classStudent) return '—';
                            const cls = classes.find(c => c.id === classStudent.classId);
                            if (!cls) return '—';
                            return `${cls.name}${cls.section ? ` - ${cls.section}` : ''}`;
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const classStudent = classStudents.find(cs => cs.studentId === user.id);
                            if (!classStudent) {
                              return (
                                <select 
                                  className="w-full max-w-[200px] px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-brand-light-purple/40 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed" 
                                  disabled
                                >
                                  <option>No class joined</option>
                                </select>
                              );
                            }
                            return (
                              <div className="flex items-center gap-2">
                                <select 
                                  className="w-full max-w-[200px] px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                                  onChange={async (e) => {
                                    const quizId = e.target.value;
                                    if (quizId) {
                                      const score = await fetchQuizScores(quizId, user.id);
                                      setSelectedQuizScores(prev => ({
                                        ...prev,
                                        [user.id]: score
                                      }));
                                    }
                                  }}
                                >
                                  <option value="">Select a quiz...</option>
                                  {postedQuizzes.map((quiz) => (
                                    <option key={quiz.id} value={quiz.id}>
                                      {quiz.title.length > 40
                                        ? `${quiz.title.substring(0, 40)}...`
                                        : quiz.title}
                                    </option>
                                  ))}
                                </select>
                                {selectedQuizScores[user.id] && (
                                  <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {selectedQuizScores[user.id]}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleExportStudentRecords(user)}
                            disabled={busyUserId === user.id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-green-500 text-green-500 hover:bg-green-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {busyUserId === user.id
                              ? 'Exporting...'
                              : 'Export Records'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-brand-light-purple/30 flex justify-end">
                 <button
                    type="button"
                    onClick={() => setShowAllRecordsModal(false)}
                    className="px-4 py-2 rounded-lg bg-brand-accent text-white font-semibold hover:bg-brand-accent/90 transition"
                  >
                    Close
                  </button>
              </div>
            </div>
          </div>
        )}

        {showQuestionModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-brand-mid-purple rounded-2xl shadow-2xl max-w-2xl w-full my-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-brand-light-purple/30">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button
                  onClick={() => {
                    setShowQuestionModal(false);
                    resetQuestionForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                      Question Type
                    </label>
                    <select
                      value={questionFormData.type}
                      onChange={(e) =>
                        setQuestionFormData((prev) => ({
                          ...prev,
                          type: e.target.value,
                          options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined,
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="identification">Identification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                      Category
                    </label>
                    <select
                      value={questionFormData.category}
                      onChange={(e) =>
                        setQuestionFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="Earth and Space">Earth and Space</option>
                      <option value="Living Things and Their Environment">Living Things & Environment</option>
                      <option value="Matter">Matter</option>
                      <option value="Force, Motion, and Energy">Force, Motion & Energy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    value={questionFormData.question}
                    onChange={(e) =>
                      setQuestionFormData((prev) => ({ ...prev, question: e.target.value }))
                    }
                    placeholder="Enter the question..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                {questionFormData.type === 'multiple-choice' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-2">
                      {questionFormData.options.map((option, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 min-w-6">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...questionFormData.options];
                              newOptions[idx] = e.target.value;
                              setQuestionFormData((prev) => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 px-3 py-2 rounded text-sm border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Correct Answer *
                  </label>
                  {questionFormData.type === 'multiple-choice' ? (
                    <select
                      value={questionFormData.answer}
                      onChange={(e) =>
                        setQuestionFormData((prev) => ({ ...prev, answer: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="">Select correct answer</option>
                      {questionFormData.options
                        .filter((o) => o.trim())
                        .map((option, idx) => (
                          <option key={idx} value={option}>
                            {String.fromCharCode(65 + idx)}. {option}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={questionFormData.answer}
                      onChange={(e) =>
                        setQuestionFormData((prev) => ({ ...prev, answer: e.target.value }))
                      }
                      placeholder="Enter the correct answer"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      value={questionFormData.points}
                      onChange={(e) =>
                        setQuestionFormData((prev) => ({ ...prev, points: Number(e.target.value) }))
                      }
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      value={questionFormData.timeLimit || ''}
                      onChange={(e) =>
                        setQuestionFormData((prev) => ({
                          ...prev,
                          timeLimit: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      min="0"
                      placeholder="Optional"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={questionFormData.imageUrl}
                    onChange={(e) =>
                      setQuestionFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="https://example.com/image.png"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 bg-white/80 dark:bg-brand-deep-purple/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-brand-light-purple/30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionModal(false);
                      resetQuestionForm();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-brand-light-purple/40 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-brand-light-purple/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg bg-brand-accent text-white font-semibold hover:bg-brand-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {feedback && (
          <div
            className={`mt-4 sm:mt-6 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${
              feedback.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
