import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, ClipboardList, FilePlus2, LoaderCircle, Sparkles } from 'lucide-react';
import { ExamPaper, ExamPaperSubmission, Language, User } from '../types';

type PaperDraft = Omit<ExamPaper, 'id' | 'createdAt' | 'createdBy' | 'isPublished'>;

interface AdminExamPapersProps {
  lang: Language;
  currentUser: User;
  papers: ExamPaper[];
  submissions: ExamPaperSubmission[];
  users: User[];
  onPublishPaper: (paper: Omit<ExamPaper, 'id' | 'createdAt'>) => Promise<void>;
}

export default function AdminExamPapers({ lang, currentUser, papers, submissions, users, onPublishPaper }: AdminExamPapersProps) {
  const isSinhala = lang === 'si';
  const canCreatePapers = currentUser.role === 'admin';
  const [activeView, setActiveView] = useState<'create' | 'papers' | 'submissions'>(canCreatePapers ? 'create' : 'papers');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [batch, setBatch] = useState('All');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [draft, setDraft] = useState<PaperDraft | null>(null);
  const [draftProvider, setDraftProvider] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const generateDraft = async (event: FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setError('');
    setDraft(null);
    try {
      const response = await fetch('/api/exam-papers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, batch, durationMinutes })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not generate the examination paper.');
      setDraft(result.paper);
      setDraftProvider(result.provider);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Could not generate the examination paper.');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishDraft = async () => {
    if (!draft) return;
    setIsPublishing(true);
    setError('');
    try {
      await onPublishPaper({ ...draft, createdBy: currentUser.id, isPublished: true });
      setDraft(null);
      setSubject('');
      setTopic('');
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Could not publish this paper. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedSubmission = submissions.find(submission => submission.id === selectedSubmissionId);
  const selectedPaper = selectedSubmission && papers.find(paper => paper.id === selectedSubmission.paperId);
  const selectedStudent = selectedSubmission && users.find(user => user.id === selectedSubmission.studentId);

  return (
    <section className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-white">{isSinhala ? 'විභාග ප්‍රශ්න පත්‍ර' : 'Examination Papers'}</h2>
          <p className="mt-1 text-xs text-slate-400">{isSinhala ? 'පළ කළ ප්‍රශ්න පත්‍ර සහ සිසුන්ගේ පිළිතුරු බලන්න' : 'View published papers and student submissions'}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
          {canCreatePapers && (
            <button type="button" onClick={() => setActiveView('create')} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${activeView === 'create' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              <FilePlus2 className="h-4 w-4" />{isSinhala ? 'නව පත්‍රය' : 'Create paper'}
            </button>
          )}
          <button type="button" onClick={() => setActiveView('papers')} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${activeView === 'papers' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            {isSinhala ? 'පළ කළ පත්‍ර' : 'Papers'}<span className="font-mono">{papers.length}</span>
          </button>
          <button type="button" onClick={() => setActiveView('submissions')} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${activeView === 'submissions' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            <ClipboardList className="h-4 w-4" />{isSinhala ? 'සිසු පිළිතුරු' : 'Submissions'}<span className="font-mono">{submissions.length}</span>
          </button>
        </div>
      </header>

      {activeView === 'create' ? (
        <div className="space-y-5">
          <form onSubmit={generateDraft} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end rounded-xl border border-slate-800 bg-slate-900 p-4">
            <label className="space-y-1.5 lg:col-span-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{isSinhala ? 'විෂය' : 'Subject'}</span>
              <input required maxLength={100} value={subject} onChange={event => setSubject(event.target.value)} placeholder="e.g. Biology, Chemistry" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" />
            </label>
            <label className="space-y-1.5 lg:col-span-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{isSinhala ? 'පාඩම / ඒකකය' : 'Topic / unit (optional)'}</span>
              <input maxLength={200} value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. Cell biology" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" />
            </label>
            <label className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{isSinhala ? 'කණ්ඩායම' : 'Batch'}</span>
              <select value={batch} onChange={event => setBatch(event.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500">
                <option value="All">All students</option>
                {['2025', '2026', '2027', '2028'].map(year => <option key={year} value={year}>{year} A/L</option>)}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{isSinhala ? 'කාලය (විනාඩි)' : 'Duration (minutes)'}</span>
              <input type="number" required min={15} max={600} step={5} value={durationMinutes} onChange={event => setDurationMinutes(Number(event.target.value))} className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" />
            </label>
            <button type="submit" disabled={isGenerating || !subject.trim()} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
              {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? (isSinhala ? 'සකස් කරමින්...' : 'Generating paper...') : (isSinhala ? 'පත්‍රය සකස් කරන්න' : 'Generate paper')}
            </button>
          </form>

          {error && <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}

          {draft && (
            <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <span>{draft.subject}</span><span>·</span><span>{draft.batch === 'All' ? 'All batches' : `${draft.batch} A/L`}</span><span>·</span><span>{draft.durationMinutes} min</span><span>·</span><span>Draft via {draftProvider}</span>
                  </div>
                  <input aria-label="Paper title" value={draft.title} onChange={event => setDraft(previous => previous ? { ...previous, title: event.target.value } : previous)} className="w-full border-b border-slate-700 bg-transparent pb-1 text-lg font-bold text-white focus:outline-none focus:border-amber-500" />
                  <p className="text-xs text-slate-400">10 MCQs · 3 easy structured questions · {draft.structuredQuestions.reduce((count, question) => count + question.subQuestions.length, 0)} sub-questions</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => setDraft(null)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">Discard</button>
                  <button type="button" onClick={publishDraft} disabled={isPublishing || !draft.title.trim()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-50">
                    {isPublishing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Publish to students
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Part I · Multiple choice</h3>
                {draft.mcqQuestions.map((question, index) => (
                  <article key={question.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm font-semibold text-slate-100">{index + 1}. {question.question}</p>
                    <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 text-xs text-slate-400">
                      {question.options.map((option, optionIndex) => <li key={optionIndex}>{String.fromCharCode(65 + optionIndex)}. {option}</li>)}
                    </ol>
                  </article>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Part II · Structured questions</h3>
                {draft.structuredQuestions.map((question, index) => (
                  <article key={question.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm font-semibold text-slate-100">{index + 1}. {question.prompt}</p>
                    <ol className="mt-3 list-[lower-alpha] space-y-2 pl-5 text-xs leading-relaxed text-slate-400">
                      {question.subQuestions.map(subQuestion => <li key={subQuestion.id}>{subQuestion.prompt}</li>)}
                    </ol>
                  </article>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : activeView === 'papers' ? (
        <div className="space-y-3">
          {papers.length === 0 ? <p className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-center text-xs text-slate-500">No papers published yet.</p> : papers.map(paper => (
            <article key={paper.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{paper.title}</h3>
                  <p className="mt-1 text-[10px] text-slate-400">{paper.subject}{paper.topic ? ` · ${paper.topic}` : ''} · {paper.batch === 'All' ? 'All batches' : `${paper.batch} A/L`} · {paper.durationMinutes} min</p>
                </div>
                <span className="text-xs text-slate-400">{submissions.filter(submission => submission.paperId === paper.id).length} submissions</span>
              </div>
              <details className="mt-4 border-t border-slate-800 pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-amber-300">View paper · {paper.mcqQuestions.length} MCQs · {paper.structuredQuestions.length} structured questions</summary>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-200">Part I · Multiple choice</h4>
                    {paper.mcqQuestions.map((question, index) => <p key={question.id} className="text-xs leading-relaxed text-slate-300">{index + 1}. {question.question}<span className="mt-1 block pl-3 text-slate-500">{question.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join('  ·  ')}</span></p>)}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-200">Part II · Structured questions</h4>
                    {paper.structuredQuestions.map((question, index) => <div key={question.id} className="text-xs leading-relaxed text-slate-300"><p>{index + 1}. {question.prompt}</p><ol className="mt-1 list-[lower-alpha] pl-5 text-slate-500">{question.subQuestions.map(subQuestion => <li key={subQuestion.id}>{subQuestion.prompt}</li>)}</ol></div>)}
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4">
          <div className="space-y-2">
            {submissions.length === 0 ? <p className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-center text-xs text-slate-500">No student submissions yet.</p> : submissions.map(submission => {
              const paper = papers.find(item => item.id === submission.paperId);
              const student = users.find(user => user.id === submission.studentId);
              return (
                <button key={submission.id} type="button" onClick={() => setSelectedSubmissionId(submission.id)} className={`w-full rounded-lg border p-4 text-left ${selectedSubmissionId === submission.id ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                  <span className="block truncate text-sm font-semibold text-white">{student?.name || submission.studentName}</span>
                  <span className="mt-1 block truncate text-xs text-slate-400">{paper?.title || 'Paper'} · {submission.studentIndexNo}</span>
                  <span className="mt-2 block text-[10px] font-mono text-slate-500">{new Date(submission.submittedAt).toLocaleString()}</span>
                </button>
              );
            })}
          </div>

          {selectedSubmission && selectedPaper ? (
            <div className="max-h-[75vh] space-y-5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <header className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white">{selectedPaper.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{selectedStudent?.name || selectedSubmission.studentName} · {selectedSubmission.studentIndexNo} · {selectedSubmission.batch} A/L</p>
                <p className="mt-1 text-[10px] text-slate-500">Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              </header>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">MCQ answers</h4>
                {selectedPaper.mcqQuestions.map((question, index) => {
                  const answer = selectedSubmission.mcqAnswers[question.id];
                  return <article key={question.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-semibold text-slate-200">{index + 1}. {question.question}</p><p className="mt-2 text-xs text-emerald-200">{answer === undefined ? 'No answer' : `${String.fromCharCode(65 + answer)}. ${question.options[answer]}`}</p></article>;
                })}
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Structured answers</h4>
                {selectedPaper.structuredQuestions.map((question, index) => (
                  <article key={question.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-3">
                    <p className="text-xs font-semibold text-slate-200">{index + 1}. {question.prompt}</p>
                    {question.subQuestions.map((subQuestion, subIndex) => <div key={subQuestion.id}><p className="text-[11px] text-slate-400">{String.fromCharCode(97 + subIndex)}. {subQuestion.prompt}</p><p className="mt-1 whitespace-pre-wrap rounded-md bg-slate-900 p-2 text-xs leading-relaxed text-slate-200">{selectedSubmission.structuredAnswers[subQuestion.id] || 'No answer'}</p></div>)}
                  </article>
                ))}
              </div>
            </div>
          ) : <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-500">Select a submission to review.</div>}
        </div>
      )}
    </section>
  );
}