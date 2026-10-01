import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Eye,
  Trash2,
  LoaderCircle,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Filter,
  Check,
  ShieldCheck,
  Download,
  Lock
} from 'lucide-react';
import { Assignment, AssignmentMCQ, AssignmentSubmission, Batch, Language, User } from '../types';
import StandardAnswerSheetModal from './StandardAnswerSheetModal';

interface AdminAssignmentsProps {
  lang: Language;
  currentUser: User;
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  users: User[];
  onSaveAssignment: (assignment: Assignment) => Promise<void>;
  onDeleteAssignment: (assignmentId: string) => Promise<void>;
  onDeleteSubmission?: (submissionId: string) => Promise<void> | void;
  onUpdateSubmission?: (submission: AssignmentSubmission) => Promise<void> | void;
}

export default function AdminAssignments({
  lang,
  currentUser,
  assignments,
  submissions,
  users,
  onSaveAssignment,
  onDeleteAssignment,
  onDeleteSubmission,
  onUpdateSubmission
}: AdminAssignmentsProps) {
  const isSinhala = lang === 'si';
  const canCreate = currentUser.role === 'admin'; // Only admin can create assignments
  const isSuperAdmin = currentUser.role === 'super-admin';
  const canDeleteMarkSheet = currentUser.role === 'admin' || currentUser.role === 'super-admin'; // Admin or Super Admin can delete student mark sheets

  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'submissions'>(canCreate ? 'create' : 'list');

  // Generator & Form States
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Mechanics & Modern Physics');
  const [batch, setBatch] = useState<Batch>('All');
  const [mcqCount, setMcqCount] = useState<20 | 30>(30); // 20 or 30 MCQs
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Draft Assignment State
  const [draft, setDraft] = useState<Assignment | null>(null);
  const [markingImagePreview, setMarkingImagePreview] = useState<string>('');

  // Modals
  const [viewQuestionsAssignment, setViewQuestionsAssignment] = useState<Assignment | null>(null);
  const [viewMarkingSchemeAssignment, setViewMarkingSchemeAssignment] = useState<Assignment | null>(null);
  const [viewSubmissionDetail, setViewSubmissionDetail] = useState<AssignmentSubmission | null>(null);
  const [viewTemplateAssignment, setViewTemplateAssignment] = useState<Assignment | null>(null);
  const [zoomImageModalUrl, setZoomImageModalUrl] = useState<string | null>(null);

  // Filters
  const [filterAssignmentId, setFilterAssignmentId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  // Helper: Calculate remaining days
  const getDaysLeft = (deadlineIso: string) => {
    const diff = new Date(deadlineIso).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // 1. Generate Challenging MCQs via Backend (Submit within 1 day, visible for 1 month)
  const handleGenerateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      setErrorMsg('Only Admin staff can create or generate assignments.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/assignments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          topic: topic.trim(),
          batch,
          count: mcqCount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate assignment questions.');
      }

      const deadlineDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1-day submission deadline
      const visibleUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1-month visibility window

      const publishedAssignment: Assignment = {
        ...data.assignment,
        totalQuestions: mcqCount,
        durationDays: 1,
        durationHours: 24,
        deadline: deadlineDate.toISOString(),
        visibleUntil: visibleUntilDate.toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        isPublished: true
      };

      // Automatically publish and save to database so Admin, Super-Admin, and Students can immediately see it!
      await onSaveAssignment(publishedAssignment);

      setSuccessMsg(`Successfully generated & published "${publishedAssignment.title}" (${publishedAssignment.totalQuestions} MCQs)! Submission deadline: 1 Day (24 Hours) • Visible for 1 Month.`);
      setDraft(null);
      setMarkingImagePreview('');
      setActiveTab('list');
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete student mark sheet (submission) handler: Admin or Super Admin can delete
  const handleDeleteSubmission = async (submission: AssignmentSubmission) => {
    if (!canDeleteMarkSheet) {
      setErrorMsg('Permission denied: Only Admin and Super Admin can delete student mark sheets.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the mark sheet for "${submission.studentName}" (${submission.studentIndexNo})?\n\nScore: ${submission.score}/${submission.totalMarks || 30} (${submission.percentage}%)\n\nThis will permanently delete this student's submission. This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      if (onDeleteSubmission) {
        await onDeleteSubmission(submission.id);
      }
      if (viewSubmissionDetail && viewSubmissionDetail.id === submission.id) {
        setViewSubmissionDetail(null);
      }
      setSuccessMsg(`Mark sheet deleted successfully for ${submission.studentName}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete mark sheet.');
    }
  };

  // 2. Marking Scheme Image File Upload
  const handleMarkingImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      setMarkingImagePreview(base64Url);
      if (draft) {
        setDraft({ ...draft, markingSchemeImageUrl: base64Url });
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Update Individual Marking Scheme Question
  const handleUpdateMarkingAnswer = (qNumber: number, optionIndex: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      markingScheme: {
        ...draft.markingScheme,
        [qNumber]: optionIndex
      }
    });
  };

  // 4. Publish Assignment
  const handlePublish = async () => {
    if (!draft) return;
    setIsPublishing(true);
    setErrorMsg('');

    try {
      const assignmentToSave: Assignment = {
        ...draft,
        markingSchemeImageUrl: markingImagePreview || draft.markingSchemeImageUrl || '',
        createdBy: currentUser.id,
        isPublished: true
      };

      await onSaveAssignment(assignmentToSave);
      setSuccessMsg('Assignment with 30 MCQs & Marking Scheme published successfully!');
      setDraft(null);
      setMarkingImagePreview('');
      setActiveTab('list');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish assignment.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterAssignmentId !== 'all' && sub.assignmentId !== filterAssignmentId) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        sub.studentName.toLowerCase().includes(s) ||
        sub.studentIndexNo.toLowerCase().includes(s) ||
        sub.batch.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Banner / Role Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {currentUser.role === 'admin' ? 'ADMIN ASSIGNMENT COMMAND' : 'SUPER ADMIN OVERSIGHT'}
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              MCQ Hand-Drawn Answer Sheet Evaluator
            </span>
          </div>
          <h2 className="font-display font-black text-white text-2xl tracking-tight">
            {isSinhala ? 'පැවරුම් කළමනාකරණය (Assignments)' : 'A/L Physics Assignments & Marking Schemes'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isSinhala
              ? 'පැවරුම් 1 දිනක කාලසීමාවක් තුළ සිසුන් විසින් පිළිතුරු ඉදිරිපත් කළ යුතු අතර, නිර්මාණය කළ සහ අවසන් කළ පැවරුම් මාස 1ක් (දින 30ක්) පද්ධතිය තුළ දැකගත හැක. නැවත ඉදිරිපත් කිරීමේ අවසර දිය හැක්කේ Admin හට පමණි (Super Admin සීමා කර ඇත).'
              : 'Students must submit assignments within 1 day (24 hours). Created and completed assignments remain visible for 1 month (30 days). Re-submission access can only be granted by Admin (Super Admin restricted).'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSinhala ? 'පැවරුමක් සාදන්න' : 'Create Assignment'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{isSinhala ? 'සියලු පැවරුම්' : 'All Assignments'} ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>{isSinhala ? 'ලකුණු සහ පිළිතුරු පත්‍ර' : 'Student Marks & Sheets'} ({submissions.length})</span>
          </button>
        </div>
      </div>

      {/* Super Admin Notice if not admin */}
      {isSuperAdmin && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 text-xs text-blue-200">
          <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
          <div>
            <span className="font-bold text-blue-300 uppercase">Super Admin Inspection & Moderation Clearance</span>
            <p className="mt-0.5 text-slate-300">
              Only Admin staff can author new assignments. Both Admin and Super Admin have full access to inspect assignments, review optical mark evaluations, and delete student mark sheets when necessary.
            </p>
          </div>
        </div>
      )}

      {/* Global Alerts */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="ml-auto text-slate-400 hover:text-white">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CREATE / GENERATE 30-MCQ ASSIGNMENT (ADMIN ONLY)                   */}
      {/* ========================================================================= */}
      {activeTab === 'create' && canCreate && (
        <div className="space-y-6">
          {/* Generation Setup Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    {isSinhala ? 'නව MCQ පැවරුමක් ජනනය කරන්න' : 'Generate New Physics Assignment'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Creates 20 or 30 challenging Sri Lankan A/L Physics questions. Submit within 1 day • Visible for 1 month.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-bold uppercase">
                Submit: 1 Day • Visible: 1 Month
              </span>
            </div>

            <form onSubmit={handleGenerateAssignment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    Topic / Syllabus Coverage
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Circular Motion, Waves & Heat"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    Target Batch
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value as Batch)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="All">All Batches</option>
                    <option value="2025">2025 A/L</option>
                    <option value="2026">2026 A/L</option>
                    <option value="2027">2027 A/L</option>
                    <option value="2028">2028 A/L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    Question Count
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setMcqCount(20)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        mcqCount === 20
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      20 MCQs
                    </button>
                    <button
                      type="button"
                      onClick={() => setMcqCount(30)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        mcqCount === 30
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      30 MCQs
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    Submission & Visibility Schedule
                  </label>
                  <div className="py-2.5 px-3 rounded-xl border border-amber-500/30 bg-slate-950 text-xs font-mono flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Submit: 1 Day</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Visible: 1 Month</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Submission Period Notice */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">
                      Submission Deadline: 1 Day (24 Hours) • Visible for 1 Month
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Students must complete and upload their handwritten answer sheets within 24 hours. Created assignments and completed student submissions remain visible in the portal for 1 month (30 days).
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-bold shrink-0 self-start sm:self-auto">
                  1-Day Submit • 1-Month Visible
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Generating {mcqCount} Rigorous MCQs (Ollama / Gemini)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate {mcqCount} MCQs & Scheme (1-Day Submit)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Draft Assignment Editor */}
          {draft && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Draft Ready for Review & Publishing
                  </span>
                  <h3 className="font-display font-bold text-white text-lg mt-1">{draft.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {draft.totalQuestions} Challenging MCQs • Batch: {draft.batch} • {draft.durationDays === 30 || draft.durationHours > 48 ? '1-Month Submission Period' : '1-Day Submission Period'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="/templete_marking.png"
                    download="Physics_MCQ_Answer_Sheet_Template.png"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    title="Download template image"
                  >
                    <Download className="h-3.5 w-3.5 text-amber-400" />
                    <span>Download Template</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setViewTemplateAssignment(draft)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    <span>View Template</span>
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                  {isPublishing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Publish Assignment to Students</span>
                    </>
                  )}
                </button>
              </div>
            </div>

              {/* SECTION: ADMIN MARKING SCHEME IMAGE UPLOADER */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-850 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-amber-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                      Admin Marking Scheme Image Upload
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Upload official handwritten / printed marking key sheet
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-900/50">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-xs font-bold text-slate-300">
                        {markingImagePreview ? 'Change Marking Scheme Image' : 'Upload Marking Scheme Image'}
                      </span>
                      <span className="text-[10px] text-slate-500">PNG, JPG, or WEBP (Clear snapshot)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMarkingImageUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  {markingImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
                      <img
                        src={markingImagePreview}
                        alt="Marking Scheme"
                        className="w-full h-36 object-contain p-2"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setZoomImageModalUrl(markingImagePreview)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Full View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMarkingImagePreview('');
                            if (draft) setDraft({ ...draft, markingSchemeImageUrl: '' });
                          }}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-36 rounded-xl border border-slate-850 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                      <ImageIcon className="h-6 w-6 mb-1 opacity-40" />
                      <span>No marking scheme image uploaded yet.</span>
                      <span className="text-[10px] text-slate-600 mt-0.5">
                        (Optional: You can provide the image for optical cross-referencing and verification.)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: MARKING SCHEME ANSWER KEY GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                    Official Answer Key (Questions 1 to {draft.totalQuestions || 30})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(draft.totalQuestions || 30) === 20
                      ? 'Questions 21 to 30 are not part of this 20-MCQ assignment (-)'
                      : 'Click an option to adjust the correct answer for that question'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((qNum) => {
                    const isOutOfRange = qNum > (draft.totalQuestions || 30);
                    const currentAnswer = draft.markingScheme[qNum];

                    if (isOutOfRange) {
                      return (
                        <div
                          key={qNum}
                          className="bg-slate-950/40 border border-slate-900 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 opacity-40 select-none"
                        >
                          <span className="text-[10px] font-mono text-slate-600 font-bold">Q{qNum}</span>
                          <span className="text-slate-600 font-mono font-bold text-sm leading-6">-</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={qNum}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 flex flex-col items-center gap-1.5"
                      >
                        <span className="text-[10px] font-mono text-slate-400 font-bold">Q{qNum}</span>
                        <div className="grid grid-cols-4 gap-1 w-full">
                          {[0, 1, 2, 3].map((optIdx) => {
                            const isSelected = currentAnswer === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleUpdateMarkingAnswer(qNum, optIdx)}
                                className={`h-6 text-[10px] font-bold rounded cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                {optionLabels[optIdx]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: MCQS ACCORDION / PREVIEW */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Inspect All {draft.totalQuestions || 30} Generated Questions
                </h4>
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
                  {draft.mcqQuestions.map((q) => (
                    <div key={q.id} className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="bg-slate-900 text-amber-400 font-mono font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
                          Q{q.questionNumber}
                        </span>
                        <p className="font-medium text-slate-200 leading-relaxed">{q.question}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                        {q.options.map((opt, optIndex) => {
                          const isCorrect = draft.markingScheme[q.questionNumber] === optIndex;
                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                                isCorrect
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold'
                                  : 'border-slate-850 bg-slate-900/60 text-slate-400'
                              }`}
                            >
                              <span className="font-mono">{optionLabels[optIndex]}.</span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL ASSIGNMENTS (ADMIN & SUPER ADMIN CAN VIEW)                     */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {assignments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-base">No Assignments Created Yet</h4>
              <p className="text-xs text-slate-400">
                {canCreate
                  ? 'Switch to the "Create Assignment" tab above to generate your first 30-MCQ physics assignment.'
                  : 'No active assignments are currently available in the system.'}
              </p>
              {canCreate && (
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer"
                >
                  Create Assignment Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => {
                const expired = isExpired(assignment.deadline);
                const daysRemaining = getDaysLeft(assignment.deadline);
                const subCount = submissions.filter((s) => s.assignmentId === assignment.id).length;

                return (
                  <div
                    key={assignment.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          {assignment.batch} Batch
                        </span>
                        {expired ? (
                          <span className="text-[10px] font-mono font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Expired
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {daysRemaining} Days Left
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-white text-base leading-snug">
                          {assignment.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {assignment.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                        <div>
                          <span className="text-slate-500 block">MCQs:</span>
                          <span className="text-white font-bold">{assignment.totalQuestions} Questions</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Submissions:</span>
                          <span className="text-amber-400 font-bold">{subCount} Students</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Created:</span>
                          <span className="text-slate-300">{formatDate(assignment.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Deadline:</span>
                          <span className="text-slate-300">{formatDate(assignment.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setViewQuestionsAssignment(assignment)}
                          className="py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Questions
                        </button>
                        <button
                          onClick={() => setViewMarkingSchemeAssignment(assignment)}
                          className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="h-3.5 w-3.5" /> Scheme & Key
                        </button>
                      </div>

                      {canCreate && (
                        <button
                          onClick={() => {
                            setDraft(assignment);
                            setMarkingImagePreview(assignment.markingSchemeImageUrl || '');
                            setActiveTab('create');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full py-1.5 bg-slate-950 hover:bg-slate-850 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Edit / Customize Marking Scheme
                        </button>
                      )}

                      <button
                        onClick={() => setViewTemplateAssignment(assignment)}
                        className="w-full py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-amber-400" /> View Answer Sheet Template
                      </button>

                      {canCreate && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete assignment "${assignment.title}" and its ${subCount} submissions?`)) {
                              await onDeleteAssignment(assignment.id);
                            }
                          }}
                          className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Assignment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDENT SUBMISSIONS & MARKS (ADMIN & SUPER ADMIN CAN VIEW)        */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search student or index..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <select
                value={filterAssignmentId}
                onChange={(e) => setFilterAssignmentId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">All Assignments</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Evaluated Sheets: <span className="text-amber-400 font-bold">{filteredSubmissions.length}</span>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <Award className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-base">No Submissions Found</h4>
              <p className="text-xs text-slate-400">
                Students have not yet submitted handwritten answer sheets for this selection.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Index No</th>
                      <th className="p-4">Batch</th>
                      <th className="p-4">Assignment</th>
                      <th className="p-4 text-center">Marks</th>
                      <th className="p-4 text-center">Percentage</th>
                      <th className="p-4">Submitted At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredSubmissions.map((sub) => {
                      const assignment = assignments.find((a) => a.id === sub.assignmentId);
                      const isHigh = sub.score >= Math.round((sub.totalMarks || 30) * 0.8);
                      const isMedium = sub.score >= Math.round((sub.totalMarks || 30) * 0.6) && !isHigh;

                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-850/40 transition-colors"
                        >
                          <td className="p-4 font-bold text-white">{sub.studentName}</td>
                          <td className="p-4 font-mono text-amber-500">{sub.studentIndexNo}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                              {sub.batch}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-300">
                            {assignment?.title || 'Physics Assignment'}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`font-mono font-black text-sm px-2.5 py-1 rounded-lg border ${
                                isHigh
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : isMedium
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}
                            >
                              {sub.score} / {sub.totalMarks || 30}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-slate-200">
                            {sub.percentage}%
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {formatDate(sub.submittedAt)}
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setViewSubmissionDetail(sub)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Inspect Student Mark Sheet"
                            >
                              <Eye className="h-3.5 w-3.5" /> Inspect
                            </button>

                            {canDeleteMarkSheet && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSubmission(sub)}
                                className="px-2.5 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all inline-flex items-center gap-1 cursor-pointer"
                                title="Delete Student Mark Sheet"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW 30 MCQS                                                     */}
      {/* ========================================================================= */}
      {viewQuestionsAssignment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  30 Multiple-Choice Questions
                </span>
                <h3 className="font-display font-bold text-white text-lg">
                  {viewQuestionsAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setViewQuestionsAssignment(null)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {viewQuestionsAssignment.mcqQuestions.map((q) => (
                <div key={q.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold px-2 py-0.5 rounded text-xs shrink-0">
                      Q{q.questionNumber}
                    </span>
                    <p className="font-bold text-slate-100 leading-relaxed">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/60 text-slate-300 flex items-center gap-2"
                      >
                        <span className="font-mono text-slate-500 font-bold">{optionLabels[optIdx]}.</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewQuestionsAssignment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW MARKING SCHEME & SCHEME IMAGE (ADMIN & SUPER ADMIN)         */}
      {/* ========================================================================= */}
      {viewMarkingSchemeAssignment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  Official Marking Scheme & Answer Key
                </span>
                <h3 className="font-display font-bold text-white text-lg">
                  {viewMarkingSchemeAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setViewMarkingSchemeAssignment(null)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 text-xs">
              {/* Marking Scheme Image */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-400" />
                  Admin Marking Scheme Image
                </h4>
                {viewMarkingSchemeAssignment.markingSchemeImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 text-center group">
                    <img
                      src={viewMarkingSchemeAssignment.markingSchemeImageUrl}
                      alt="Official Scheme"
                      className="max-h-72 w-full object-contain rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setZoomImageModalUrl(viewMarkingSchemeAssignment.markingSchemeImageUrl!)}
                      className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Click to Zoom High-Res
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-slate-850 bg-slate-950 text-center text-slate-500">
                    No physical marking scheme image was uploaded for this assignment. Key is configured below.
                  </div>
                )}
              </div>

              {/* 20 or 30-Question Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Questions 1 to {viewMarkingSchemeAssignment.totalQuestions || 30} Answer Key Matrix
                  </h4>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {viewMarkingSchemeAssignment.totalQuestions || 30} Total Questions
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((qNum) => {
                    const total = viewMarkingSchemeAssignment.totalQuestions || 30;
                    const isOutOfRange = qNum > total;
                    const ansIdx = viewMarkingSchemeAssignment.markingScheme[qNum];

                    if (isOutOfRange || ansIdx === undefined) {
                      return (
                        <div
                          key={qNum}
                          className="bg-slate-950/40 border border-slate-900 p-2 rounded-xl text-center opacity-40 select-none"
                        >
                          <span className="text-[10px] font-mono text-slate-600 block font-bold">Q{qNum}</span>
                          <span className="font-display font-bold text-slate-600 text-base mt-0.5 block">
                            -
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={qNum}
                        className="bg-slate-950 border border-slate-850 p-2 rounded-xl text-center"
                      >
                        <span className="text-[10px] font-mono text-slate-400 block font-bold">Q{qNum}</span>
                        <span className="font-display font-black text-amber-400 text-base mt-0.5 block">
                          {optionLabels[ansIdx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {viewMarkingSchemeAssignment.markingSchemeNotes && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-slate-400 text-[11px]">
                  <strong className="text-slate-200">Notes: </strong>
                  {viewMarkingSchemeAssignment.markingSchemeNotes}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewMarkingSchemeAssignment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW STUDENT SUBMISSION DETAIL, HANDWRITTEN SHEET & BREAKDOWN   */}
      {/* ========================================================================= */}
      {viewSubmissionDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  Student Handwritten Sheet Audit & Optical Mark Analysis
                </span>
                <h3 className="font-display font-bold text-white text-lg">
                  {viewSubmissionDetail.studentName} ({viewSubmissionDetail.studentIndexNo})
                </h3>
              </div>
              <button
                onClick={() => setViewSubmissionDetail(null)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 text-xs">
              {/* Submission Status & Action Control Panel */}
              <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950 border-slate-800">
                <div>
                  <span className="font-bold text-white block">
                    Submission Status: <span className="text-emerald-400 font-bold uppercase tracking-wider">Submitted & Evaluated</span>
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Submitted on {formatDate(viewSubmissionDetail.submittedAt)} • Single Attempt
                  </p>
                </div>

                {canDeleteMarkSheet && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmission(viewSubmissionDetail)}
                      className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                      title="Delete Student Mark Sheet"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Mark Sheet</span>
                    </button>
                  </div>
                )}
              </div>
              {/* Official Result Calculation Metrics: Max Marks, Total Marks, Percentage */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
                  Official Result Calculation Metrics
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold tracking-wider">Max Marks</span>
                    <span className="font-display font-black text-2xl text-slate-200 mt-1 block">
                      {viewSubmissionDetail.calculation?.maximumPossibleMarks ?? viewSubmissionDetail.totalMarks ?? 30}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-amber-500/40 bg-amber-500/5 p-4 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold tracking-wider">Total Marks</span>
                    <span className="font-display font-black text-2xl text-amber-300 mt-1 block">
                      {viewSubmissionDetail.calculation?.totalMarksObtained ?? viewSubmissionDetail.score}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-emerald-500/40 bg-emerald-500/5 p-4 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold tracking-wider">Percentage</span>
                    <span className="font-display font-black text-2xl text-emerald-300 mt-1 block">
                      {viewSubmissionDetail.calculation?.percentage ?? viewSubmissionDetail.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Note */}
              {viewSubmissionDetail.aiFeedback && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-slate-300 text-xs leading-relaxed">
                  <span className="font-mono font-bold text-amber-400 uppercase text-[10px] block mb-1">
                    System Optical Handwriting & Grading Remarks:
                  </span>
                  {viewSubmissionDetail.aiFeedback}
                </div>
              )}

              {/* Student's Uploaded Handwritten Answer Sheet Image */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-amber-400" />
                    Student's Submitted Handwritten Answer Sheet Image
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomImageModalUrl(viewSubmissionDetail.answerSheetImageUrl)}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Eye className="h-3 w-3" /> Zoom Full Image
                  </button>
                </h4>
                <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950 p-2 text-center">
                  <img
                    src={viewSubmissionDetail.answerSheetImageUrl}
                    alt="Student Handwritten Answer Sheet"
                    className="max-h-80 w-full object-contain rounded-lg mx-auto"
                  />
                </div>
              </div>

              {/* Cross-Comparison Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  {viewSubmissionDetail.totalMarks || 30}-Question Mark Verification (Student Mark vs Teacher Marking Scheme)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                  {viewSubmissionDetail.questionResults?.map((res) => {
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
                            <span className="text-slate-400">Student:</span>
                            <span className="font-bold text-white">{res.detectedAnswerLabel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Scheme:</span>
                            <span className="font-bold text-amber-400">{res.correctAnswerLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewSubmissionDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: IMAGE ZOOM MODAL                                                 */}
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

      {/* ========================================================================= */}
      {/* MODAL 5: STANDARD ANSWER SHEET TEMPLATE MODAL (PRINTABLE)                 */}
      {/* ========================================================================= */}
      {viewTemplateAssignment && (
        <StandardAnswerSheetModal
          assignment={viewTemplateAssignment}
          onClose={() => setViewTemplateAssignment(null)}
        />
      )}
    </div>
  );
}
