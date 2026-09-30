import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, FileQuestion, LoaderCircle, Send, Trash2 } from 'lucide-react';
import { ExamPaper, ExamPaperSubmission, Language, User } from '../types';

interface StudentExamPapersProps {
  lang: Language;
  currentUser: User;
  papers: ExamPaper[];
  submissions: ExamPaperSubmission[];
  onSubmitPaper: (submission: ExamPaperSubmission) => Promise<void>;
  onDeleteSubmission: (submission: ExamPaperSubmission) => Promise<void>;
}

export default function StudentExamPapers({ lang, currentUser, papers, submissions, onSubmitPaper, onDeleteSubmission }: StudentExamPapersProps) {
  const isSinhala = lang === 'si';
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [structuredAnswers, setStructuredAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availablePapers = papers.filter(paper => paper.isPublished && !currentUser.hiddenExamPaperIds?.includes(paper.id) && (paper.batch === 'All' || paper.batch === currentUser.batch));
  const activePaper = availablePapers.find(paper => paper.id === activePaperId);
  const activeSubmission = activePaper && submissions.find(submission => submission.paperId === activePaper.id);

  const openPaper = (paper: ExamPaper) => {
    setActivePaperId(paper.id);
    setMcqAnswers({});
    setStructuredAnswers({});
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activePaper || activeSubmission) return;
    if (!window.confirm(isSinhala ? 'පිළිතුරු පත්‍රය ඉදිරිපත් කරන්නද?' : 'Submit this paper now? You cannot change answers afterwards.')) return;

    setIsSubmitting(true);
    setError('');
    try {
      const submission: ExamPaperSubmission = {
        id: `paper-submission-${activePaper.id}-${currentUser.id}-${Date.now()}`,
        paperId: activePaper.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentIndexNo: currentUser.indexNo,
        batch: currentUser.batch,
        mcqAnswers,
        structuredAnswers,
        submittedAt: new Date().toISOString()
      };
      await onSubmitPaper(submission);
      setSuccess(true);
    } catch {
      setError('Could not submit your paper. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (submission: ExamPaperSubmission) => {
    if (!window.confirm(isSinhala ? 'ඔබගේ ඉදිරිපත් කළ පිළිතුරු මකා දමන්නද? මෙම පත්‍රය ඔබගේ ලැයිස්තුවෙන්ද ඉවත් වේ.' : 'Delete your submission? The paper will also be removed from your paper list.')) return;
    setDeletingSubmissionId(submission.id);
    setError('');
    try {
      await onDeleteSubmission(submission);
      setActivePaperId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete your submission. Please try again.');
    } finally {
      setDeletingSubmissionId('');
    }
  };

  if (activePaper) {
    const isSubmitted = Boolean(activeSubmission || success);
    const savedMcqAnswers = activeSubmission?.mcqAnswers || mcqAnswers;
    const savedStructuredAnswers = activeSubmission?.structuredAnswers || structuredAnswers;

    return (
      <section className="space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="min-w-0">
            <button type="button" onClick={() => setActivePaperId(null)} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />{isSinhala ? 'පත්‍ර වෙත ආපසු' : 'Back to papers'}</button>
            <h2 className="truncate text-lg font-display font-bold text-white">{activePaper.title}</h2>
            <p className="mt-1 text-xs text-slate-400">{activePaper.subject}{activePaper.topic ? ` · ${activePaper.topic}` : ''} · {activePaper.durationMinutes} min</p>
          </div>
          <span className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isSubmitted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
            {isSubmitted ? (isSinhala ? 'ඉදිරිපත් කළා' : 'Submitted') : (isSinhala ? 'කෙටුම්පත' : 'In progress')}
          </span>
        </header>

        {success && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-200"><CheckCircle2 className="h-4 w-4" />{isSinhala ? 'ඔබගේ පිළිතුරු සාර්ථකව ඉදිරිපත් කළා.' : 'Your answers have been submitted successfully.'}</div>}
        {error && <div role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Part I · Multiple choice</h3>
              <span className="text-[10px] font-mono text-slate-500">{activePaper.mcqQuestions.length} questions</span>
            </div>
            {activePaper.mcqQuestions.map((question, index) => (
              <fieldset key={question.id} className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
                <legend className="sr-only">Question {index + 1}</legend>
                <p className="text-sm font-semibold leading-relaxed text-slate-100">{index + 1}. {question.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = savedMcqAnswers[question.id] === optionIndex;
                    return (
                      <label key={optionIndex} className={`flex cursor-pointer items-start gap-2.5 rounded-md border p-3 text-xs leading-relaxed ${isSelected ? 'border-amber-500/60 bg-amber-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'} ${isSubmitted ? 'cursor-default' : ''}`}>
                        <input type="radio" name={`paper-mcq-${question.id}`} disabled={isSubmitted} checked={isSelected} onChange={() => setMcqAnswers(previous => ({ ...previous, [question.id]: optionIndex }))} className="mt-0.5 accent-amber-500" />
                        <span><strong className="mr-1.5 font-mono">{String.fromCharCode(65 + optionIndex)}.</strong>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Part II · Structured questions</h3>
              <span className="text-[10px] font-mono text-slate-500">{activePaper.structuredQuestions.length} questions</span>
            </div>
            {activePaper.structuredQuestions.map((question, index) => (
              <article key={question.id} className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
                <h4 className="text-sm font-semibold leading-relaxed text-slate-100">{index + 1}. {question.prompt}</h4>
                {question.subQuestions.map((subQuestion, subIndex) => (
                  <label key={subQuestion.id} className="block space-y-2 border-t border-slate-800 pt-3">
                    <span className="block text-xs leading-relaxed text-slate-300">{String.fromCharCode(97 + subIndex)}. {subQuestion.prompt}</span>
                    <textarea readOnly={isSubmitted} rows={3} value={savedStructuredAnswers[subQuestion.id] || ''} onChange={event => setStructuredAnswers(previous => ({ ...previous, [subQuestion.id]: event.target.value }))} className="w-full resize-y rounded-md border border-slate-800 bg-slate-950 p-3 text-sm leading-relaxed text-white focus:outline-none focus:border-amber-500 read-only:text-slate-300" placeholder={isSinhala ? 'ඔබගේ පිළිතුර ලියන්න...' : 'Write your answer...'} />
                  </label>
                ))}
              </article>
            ))}
          </section>

          {!isSubmitted ? (
            <div className="sticky bottom-3 flex justify-end rounded-lg border border-slate-800 bg-slate-950/95 p-3 backdrop-blur">
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60">
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? (isSinhala ? 'ඉදිරිපත් කරමින්...' : 'Submitting...') : (isSinhala ? 'පිළිතුරු ඉදිරිපත් කරන්න' : 'Submit paper')}
              </button>
            </div>
          ) : null}
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300"><BookOpenCheck className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-display font-bold text-white">{isSinhala ? 'විභාග ප්‍රශ්න පත්‍ර' : 'Exam Papers'}</h2><p className="mt-0.5 text-xs text-slate-400">{isSinhala ? 'ඔබගේ කණ්ඩායම සඳහා ඇති පත්‍ර තෝරා පිළිතුරු ඉදිරිපත් කරන්න' : 'Open an assigned paper, answer every section, and submit it for review'}</p></div>
      </header>
      {error && <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}
      {availablePapers.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-12 text-center">
          <FileQuestion className="mx-auto h-9 w-9 text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-300">{isSinhala ? 'දැනට ප්‍රශ්න පත්‍ර නොමැත' : 'No exam papers available'}</p>
          <p className="mt-1 text-xs text-slate-500">{isSinhala ? 'ඔබගේ කණ්ඩායමට පත්‍රයක් පළ කළ විට එය මෙහි දිස්වනු ඇත.' : 'Papers published for your batch will appear here.'}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {availablePapers.map(paper => {
            const submission = submissions.find(item => item.paperId === paper.id);
            return (
              <article key={paper.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">{paper.subject}{paper.topic ? ` · ${paper.topic}` : ''}</span>
                  <h3 className="mt-1 text-sm font-bold text-white">{paper.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{paper.durationMinutes} min · {paper.mcqQuestions.length} MCQs · {paper.structuredQuestions.length} structured questions</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => openPaper(paper)} className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-bold ${submission ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500 text-slate-950 hover:bg-amber-400'}`}>
                    {submission ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    {submission ? (isSinhala ? 'මගේ පිළිතුරු බලන්න' : 'View my answers') : (isSinhala ? 'පත්‍රය අරඹන්න' : 'Start paper')}
                  </button>
                  {submission && (
                    <button type="button" title="Delete my submission and hide this paper" aria-label="Delete my submission" disabled={deletingSubmissionId === submission.id} onClick={() => handleDeleteSubmission(submission)} className="rounded-lg border border-rose-500/25 p-2.5 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">
                      {deletingSubmissionId === submission.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}