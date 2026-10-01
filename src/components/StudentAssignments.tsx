import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Eye,
  Award,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  HelpCircle,
  Camera,
  Check,
  RotateCcw,
  Download,
  Lock,
  Send,
  ShieldAlert
} from 'lucide-react';
import { Assignment, AssignmentSubmission, Language, User } from '../types';
import StandardAnswerSheetModal from './StandardAnswerSheetModal';

interface StudentAssignmentsProps {
  lang: Language;
  currentUser: User;
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onSubmitSubmission: (submission: AssignmentSubmission) => void;
}

export default function StudentAssignments({
  lang,
  currentUser,
  assignments,
  submissions,
  onSubmitSubmission
}: StudentAssignmentsProps) {
  const isSinhala = lang === 'si';

  // Filter assignments matching student's batch or 'All' and visible for 1 month (30 days)
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const studentAssignments = assignments.filter((a) => {
    if (a.isPublished === false) return false;
    if (a.batch && a.batch !== 'All' && a.batch !== currentUser.batch) return false;

    // Both created and done assignments remain visible for 1 month
    if (a.visibleUntil) {
      if (new Date(a.visibleUntil).getTime() < Date.now()) return false;
    } else if (a.createdAt) {
      const ageMs = Date.now() - new Date(a.createdAt).getTime();
      if (ageMs > ONE_MONTH_MS) return false;
    }
    return true;
  });

  // Selected assignment for viewing / solving / submitting
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    studentAssignments[0]?.id || assignments[0]?.id || ''
  );
  const [activeSubTab, setActiveSubTab] = useState<'questions' | 'submit' | 'result'>('questions');

  // Automatically keep selected assignment updated when assignments change
  useEffect(() => {
    if (!selectedAssignmentId && studentAssignments.length > 0) {
      setSelectedAssignmentId(studentAssignments[0].id);
    } else if (selectedAssignmentId && !studentAssignments.some(a => a.id === selectedAssignmentId) && studentAssignments.length > 0) {
      setSelectedAssignmentId(studentAssignments[0].id);
    }
  }, [studentAssignments, selectedAssignmentId]);

  // Submission Form States
  const [handwrittenImage, setHandwrittenImage] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [zoomImageModalUrl, setZoomImageModalUrl] = useState<string | null>(null);

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) || studentAssignments[0] || assignments[0];
  const existingSubmission = submissions.find(
    (s) => s.assignmentId === selectedAssignmentId && s.studentId === currentUser.id
  );

  // Helper: Format date
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  // Helper: Check if deadline has passed
  const isExpired = (deadlineIso: string) => {
    return new Date(deadlineIso).getTime() < Date.now();
  };

  // Helper: Calculate remaining time (supporting 1-day, 1-month, or any duration)
  const getTimeRemaining = (deadlineIso: string) => {
    const diff = new Date(deadlineIso).getTime() - Date.now();
    if (diff <= 0) return { expired: true, text: 'Expired (Submission Closed)' };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h left` };
    }
    if (hours > 0) {
      return { expired: false, text: `${hours}h ${mins}m left` };
    }
    return { expired: false, text: `${mins}m left` };
  };

  // Handle Image File Upload (Student Handwritten Sheet)
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setHandwrittenImage(base64Url);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Submission & Optical Evaluation (Single attempt only, no re-submission)
  const handleSubmitAndEvaluate = async () => {
    if (!selectedAssignment) return;
    if (!handwrittenImage) {
      setErrorMessage('Please upload a clear photo of your handwritten answer sheet first.');
      return;
    }

    if (existingSubmission) {
      setErrorMessage('You have already submitted this assignment. Each student can submit only once. Re-submission is not allowed.');
      return;
    }

    if (isExpired(selectedAssignment.deadline)) {
      setErrorMessage('This assignment deadline has expired. Submissions are now closed.');
      return;
    }

    setIsEvaluating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/assignments/evaluate-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          studentId: currentUser.id,
          studentName: currentUser.name,
          studentIndexNo: currentUser.indexNo,
          batch: currentUser.batch,
          answerSheetImageUrl: handwrittenImage,
          markingScheme: selectedAssignment.markingScheme,
          markingSchemeImageUrl: selectedAssignment.markingSchemeImageUrl,
          deadline: selectedAssignment.deadline,
          totalQuestions: selectedAssignment.totalQuestions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate answer sheet.');
      }

      const updatedSubmission: AssignmentSubmission = {
        ...data.submission
      };

      onSubmitSubmission(updatedSubmission);
      setSuccessMessage(`Evaluation complete! Score: ${updatedSubmission.score}/${updatedSubmission.totalMarks} (${updatedSubmission.percentage}%).`);
      setHandwrittenImage('');
      setActiveSubTab('result');
    } catch (err: any) {
      setErrorMessage(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              STUDENT ASSIGNMENT PORTAL
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              Hand-Drawn Answer Sheet Evaluator
            </span>
          </div>
          <h2 className="font-display font-black text-white text-2xl tracking-tight">
            {isSinhala ? 'භෞතික විද්‍යා පැවරුම් (A/L Physics Assignments)' : 'Physics Assignments'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isSinhala
              ? 'උසස් පෙළ බහුවරණ පැවරුම් විසඳා, ඔබේ අත්අකුරින් පිළිතුරු පත්‍රයේ ලියූ පිළිතුරු ඡායාරූපගත කර ඉදිරිපත් කරන්න. පද්ධතිය ගුරු ලකුණු ක්‍රමය (Admin Marking Scheme) සමඟ සංසන්දනය කර ක්ෂණිකව ලකුණු ලබාදෙයි.'
              : 'Solve syllabus MCQs. Write question numbers on paper, deeply draw your answers, and upload a clear photo of your handwritten sheet for automated marking scheme evaluation.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedAssignment && (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Answer Sheet Template</span>
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span>Batch: <strong className="text-white">{currentUser.batch}</strong></span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-slate-400 hover:text-white">✕</button>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {studentAssignments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <FileText className="h-10 w-10 text-slate-600 mx-auto" />
          <h4 className="font-bold text-white text-base">No Assignments Available</h4>
          <p className="text-xs text-slate-400">
            There are no active assignments published for your batch ({currentUser.batch}) right now. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: ASSIGNMENTS SELECTOR LIST                                */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 px-1">
              Active Assignments ({studentAssignments.length})
            </h3>

            <div className="space-y-3">
              {studentAssignments.map((assignment) => {
                const isSelected = assignment.id === selectedAssignmentId;
                const submission = submissions.find(
                  (s) => s.assignmentId === assignment.id && s.studentId === currentUser.id
                );
                const expired = isExpired(assignment.deadline);

                return (
                  <div
                    key={assignment.id}
                    onClick={() => {
                      setSelectedAssignmentId(assignment.id);
                      if (submission) {
                        setActiveSubTab('result');
                      } else {
                        setActiveSubTab('questions');
                      }
                    }}
                    className={`p-4.5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
                        {assignment.totalQuestions || 30} MCQs
                      </span>

                      {submission ? (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Graded: {submission.score}/{submission.totalMarks || 30}
                        </span>
                      ) : expired ? (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Expired
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {getTimeRemaining(assignment.deadline).text}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-white text-sm leading-snug">
                        {assignment.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                      <span>Deadline: {formatDate(assignment.deadline)}</span>
                      <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                        Open <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: ASSIGNMENT WORKSPACE (QUESTIONS / SUBMIT / RESULT)     */}
          {/* ===================================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {selectedAssignment && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Header Info Banner */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {selectedAssignment.batch} Batch
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selectedAssignment.totalQuestions} Questions • 1 Mark Each
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-white text-xl">
                        {selectedAssignment.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        Submit: 1 Day (24h) • Visible: 1 Month
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {isExpired(selectedAssignment.deadline)
                          ? 'Closed (Deadline Expired)'
                          : getTimeRemaining(selectedAssignment.deadline).text}
                      </span>
                    </div>
                  </div>

                  {/* Sub Tabs Bar */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setActiveSubTab('questions')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                        activeSubTab === 'questions'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>1. Questions ({selectedAssignment.totalQuestions || 30} MCQs)</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('submit')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                        activeSubTab === 'submit'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>
                        2. {!existingSubmission ? 'Submit Answer Sheet' : 'Submission Completed'}
                      </span>
                    </button>

                    {existingSubmission && (
                      <button
                        onClick={() => setActiveSubTab('result')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                          activeSubTab === 'result'
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-900 text-emerald-400 border border-emerald-500/30 hover:text-emerald-300'
                        }`}
                      >
                        <Award className="h-4 w-4" />
                        <span>3. Evaluated Marks ({existingSubmission.score}/{selectedAssignment.totalQuestions || 30})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* =============================================================== */}
                {/* SUB TAB 1: MCQ QUESTIONS DISPLAY                                */}
                {/* =============================================================== */}
                {activeSubTab === 'questions' && (
                  <div className="p-6 space-y-6">
                    {/* Mandatory Instructions Box */}
                    <div className="bg-amber-500/10 border border-amber-500/25 p-4.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <HelpCircle className="h-4 w-4" />
                        <span>Instructions for Handwritten Answer Sheet Submission</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>
                          Solve all <strong>{selectedAssignment.totalQuestions || 30} questions</strong> independently on your own paper.
                        </li>
                        <li>
                          Clearly write question numbers <strong>1 through {selectedAssignment.totalQuestions || 30}</strong> down the page.
                        </li>
                        <li>
                          Next to each question number, draw or shade your chosen option (<strong>A, B, C, D</strong> or <strong>1, 2, 3, 4</strong>) with <strong>deep, dark ink</strong> (chosen answer dip draw).
                        </li>
                      </ul>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-xs text-amber-300">Need the official answer sheet layout?</span>
                        <div className="flex items-center gap-2">
                          <a
                            href="/templete_marking.png"
                            download={`Physics_${selectedAssignment.totalQuestions || 30}MCQ_Answer_Sheet_Template.png`}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700"
                          >
                            <Download className="h-3.5 w-3.5 text-amber-400" />
                            <span>Download Template (.png)</span>
                          </a>
                          <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-400"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Answer Sheet</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Questions Grid */}
                    <div className="space-y-4">
                      {selectedAssignment.mcqQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 space-y-3 hover:border-slate-800 transition-all text-xs"
                        >
                          <div className="flex items-start gap-3">
                            <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2.5 py-1 rounded-md shrink-0">
                              Q{q.questionNumber}
                            </span>
                            <p className="font-bold text-white text-sm leading-relaxed">
                              {q.question}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-9">
                            {q.options.map((opt, optIndex) => (
                              <div
                                key={optIndex}
                                className="p-3 rounded-lg border border-slate-850 bg-slate-900/60 text-slate-300 flex items-start gap-2.5 hover:border-slate-700 transition-colors"
                              >
                                <span className="font-mono font-bold text-amber-400 shrink-0">
                                  {optionLabels[optIndex]}.
                                </span>
                                <span className="leading-snug">{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        {existingSubmission
                          ? 'You have already submitted this assignment. Submission completed.'
                          : 'Finished answering on your handwritten sheet?'}
                      </span>
                      {existingSubmission ? (
                        <button
                          onClick={() => setActiveSubTab('result')}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
                        >
                          View Graded Result & Marks ({existingSubmission.score}/{existingSubmission.totalMarks}) →
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSubTab('submit')}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                          Proceed to Upload Answer Sheet →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* =============================================================== */}
                {/* SUB TAB 2: UPLOAD & EVALUATE HANDWRITTEN ANSWER SHEET           */}
                {/* =============================================================== */}
                {activeSubTab === 'submit' && (
                  <div className="p-6 space-y-6">
                    {/* CASE 1: Student has an existing submission - Single submission policy */}
                    {existingSubmission ? (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-2 max-w-lg mx-auto">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Submission Completed
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                              Single Submission Only
                            </span>
                          </div>
                          <h4 className="font-display font-black text-white text-xl">
                            Answer Sheet Submitted & Evaluated
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            You have submitted your answer sheet for this assignment. Each student is allowed to submit only one time. Re-submission is not permitted.
                          </p>
                        </div>

                        {/* Final Score Summary Box */}
                        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl max-w-md mx-auto grid grid-cols-2 gap-4 text-center">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Marks</span>
                            <span className="font-display font-bold text-2xl text-amber-400 mt-1 block">
                              {existingSubmission.score} / {existingSubmission.totalMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-400 block">Percentage</span>
                            <span className="font-display font-bold text-2xl text-emerald-400 mt-1 block">
                              {existingSubmission.percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveSubTab('result')}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                          >
                            <Award className="h-4 w-4" />
                            <span>View Evaluated Marks & Answer Breakdown →</span>
                          </button>
                        </div>
                      </div>
                    ) : isExpired(selectedAssignment.deadline) ? (
                      /* CASE 2: No submission and deadline expired */
                      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-2 text-red-200">
                        <Clock className="h-10 w-10 text-red-400 mx-auto" />
                        <h4 className="font-bold text-base">Assignment Window Has Closed</h4>
                        <p className="text-xs text-slate-400">
                          The submission period for this assignment concluded on {formatDate(selectedAssignment.deadline)}.
                          New submissions are no longer accepted after the deadline has expired.
                        </p>
                      </div>
                    ) : (
                      /* CASE 3: First-time submission within active deadline */
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="font-bold text-white text-base">
                            Upload Clear Handwritten Answer Sheet
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Take a bright, non-blurry photograph of your paper answer sheet. Make sure all {selectedAssignment.totalQuestions || 30} chosen answers are deeply drawn/written.
                          </p>
                        </div>

                        {/* Upload Dropzone */}
                        <div className="space-y-4">
                          <label className="border-2 border-dashed border-slate-800 hover:border-amber-500/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-slate-950/70">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                              <Camera className="h-7 w-7" />
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-sm text-white block">
                                {handwrittenImage ? 'Change Selected Photo' : 'Upload or Drag Photo Here'}
                              </span>
                              <span className="text-xs text-slate-500 mt-1 block">
                                JPG, PNG, or WEBP (Max 15MB)
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                              }}
                            />
                          </label>

                          {/* Image Preview */}
                          {handwrittenImage && (
                            <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                                  Preview of Handwritten Answer Sheet
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setZoomImageModalUrl(handwrittenImage)}
                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" /> Zoom
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setHandwrittenImage('')}
                                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2 text-center">
                                <img
                                  src={handwrittenImage}
                                  alt="Student Sheet"
                                  className="max-h-72 w-full object-contain rounded-lg mx-auto"
                                />
                              </div>
                            </div>
                          )}

                          {/* Submission Action */}
                          <div className="pt-2">
                            <button
                              onClick={handleSubmitAndEvaluate}
                              disabled={!handwrittenImage || isEvaluating}
                              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/25 disabled:opacity-40"
                            >
                              {isEvaluating ? (
                                <>
                                  <LoaderCircle className="h-5 w-5 animate-spin" />
                                  <span>Scanning Sheet & Comparing with Admin Marking Scheme...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-5 w-5" />
                                  <span>Submit Sheet & Get Optical Marks Now</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =============================================================== */}
                {/* SUB TAB 3: EVALUATION RESULT & QUESTION BREAKDOWN               */}
                {/* =============================================================== */}
                {activeSubTab === 'result' && existingSubmission && (
                  <div className="p-6 space-y-6">
                    {/* Official Evaluation Status Banner */}
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Assignment submitted and officially evaluated. Single-submission policy applies.</span>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold uppercase shrink-0">
                        1/1 Submission Complete
                      </span>
                    </div>

                    {/* Score Summary Board */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
                        Official Result Calculation Metrics
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold tracking-wider">Max Marks</span>
                          <span className="font-display font-black text-2xl text-slate-200 mt-1 block">
                            {existingSubmission.calculation?.maximumPossibleMarks ?? existingSubmission.totalMarks ?? (selectedAssignment.totalQuestions || 30)}
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-amber-500/40 bg-amber-500/5 p-4 rounded-xl text-center shadow-sm">
                          <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold tracking-wider">Total Marks</span>
                          <span className="font-display font-black text-2xl text-amber-300 mt-1 block">
                            {existingSubmission.calculation?.totalMarksObtained ?? existingSubmission.score}
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-emerald-500/40 bg-emerald-500/5 p-4 rounded-xl text-center shadow-sm">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold tracking-wider">Percentage</span>
                          <span className="font-display font-black text-2xl text-emerald-300 mt-1 block">
                            {existingSubmission.calculation?.percentage ?? existingSubmission.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Feedback & Clarity Remarks */}
                    {existingSubmission.aiFeedback && (
                      <div className="p-4.5 bg-slate-950 rounded-2xl border border-slate-850 text-xs leading-relaxed space-y-1.5">
                        <span className="font-mono font-bold text-amber-400 uppercase text-[10px] block">
                          System Optical Recognition & Examiner Feedback:
                        </span>
                        <p className="text-slate-200">{existingSubmission.aiFeedback}</p>
                      </div>
                    )}

                    {/* Submitted Sheet Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-amber-400" />
                          Your Submitted Answer Sheet Image
                        </h4>
                        <button
                          type="button"
                          onClick={() => setZoomImageModalUrl(existingSubmission.answerSheetImageUrl)}
                          className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                        >
                          <Eye className="h-3 w-3" /> Zoom Sheet
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950 p-2 text-center">
                        <img
                          src={existingSubmission.answerSheetImageUrl}
                          alt="Submitted Sheet"
                          className="max-h-64 w-full object-contain rounded-lg mx-auto"
                        />
                      </div>
                    </div>

                    {/* Question Comparison Grid - Filtered to assignment total questions (e.g. 20 MCQs max 20) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                          {selectedAssignment.totalQuestions || existingSubmission.totalMarks || 30}-Question Mark Verification (Your Choice vs Official Scheme)
                        </h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Graded
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                        {existingSubmission.questionResults
                          ?.filter((res) => !selectedAssignment.totalQuestions || res.questionNumber <= selectedAssignment.totalQuestions)
                          .map((res) => {
                            const status = res.status || (res.isCorrect ? 'correct' : (res.detectedAnswer === null ? 'unanswered' : 'wrong'));
                            const isCorrect = status === 'correct';
                            const isUnclear = status === 'unclear';
                            const isUnanswered = status === 'unanswered';

                            let badgeBorder = 'border-red-500/30 bg-red-500/10 text-red-200';
                            let statusLabel = 'Wrong (0 Marks)';

                            if (isCorrect) {
                              badgeBorder = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
                              statusLabel = 'Correct (+1 Mark)';
                            } else if (isUnclear) {
                              badgeBorder = 'border-purple-500/30 bg-purple-500/10 text-purple-200';
                              statusLabel = 'Unclear (0 Marks)';
                            } else if (isUnanswered) {
                              badgeBorder = 'border-amber-500/30 bg-amber-500/10 text-amber-200';
                              statusLabel = 'Blank (0 Marks)';
                            }

                            return (
                              <div
                                key={res.questionNumber}
                                className={`p-3 rounded-xl border flex flex-col justify-between ${badgeBorder}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-xs">Q{res.questionNumber}</span>
                                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/40">
                                    {statusLabel}
                                  </span>
                                </div>
                                <div className="mt-2 text-[11px] font-mono space-y-0.5">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">You:</span>
                                    <span className="font-bold text-white">{res.detectedAnswerLabel || '-'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Correct:</span>
                                    <span className="font-bold text-amber-400">{res.correctAnswerLabel || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMAGE ZOOM MODAL                                                          */}
      {/* ========================================================================= */}
      {zoomImageModalUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomImageModalUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImageModalUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 font-bold text-sm bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700"
            >
              ✕ Close Zoom
            </button>
            <img
              src={zoomImageModalUrl}
              alt="Zoomed View"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Standard Answer Sheet Template Modal */}
      {showTemplateModal && selectedAssignment && (
        <StandardAnswerSheetModal
          assignment={selectedAssignment}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}
