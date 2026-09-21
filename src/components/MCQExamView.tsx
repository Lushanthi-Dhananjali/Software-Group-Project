import React, { useState, useEffect } from 'react';
import { MCQExam, MCQQuestion, ExamAttempt, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { BookOpen, Timer, CheckCircle, AlertCircle, RefreshCw, Award, Check, X, ShieldAlert } from 'lucide-react';

interface MCQExamViewProps {
  exams: MCQExam[];
  lang: Language;
  studentId: string;
  onSaveAttempt: (attempt: ExamAttempt) => void;
  pastAttempts: ExamAttempt[];
}

export default function MCQExamView({ exams, lang, studentId, onSaveAttempt, pastAttempts }: MCQExamViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeExam, setActiveExam] = useState<MCQExam | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [viewAttempt, setViewAttempt] = useState<ExamAttempt | null>(null);

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) {
      if (examStarted && timeRemaining === 0) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeRemaining]);

  const handleStartExam = (exam: MCQExam) => {
    setActiveExam(exam);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setTimeRemaining(exam.durationMinutes * 60);
    setExamStarted(true);
    setViewAttempt(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = (exam: MCQExam, studentAnswers: { [qId: string]: number }) => {
    let correctCount = 0;
    exam.questions.forEach((q) => {
      if (studentAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const totalCount = exam.questions.length;
    const score = Math.round((correctCount / totalCount) * 100);

    return {
      score,
      correctCount,
      totalCount
    };
  };

  const handleManualSubmit = () => {
    if (!activeExam) return;
    if (confirm("Are you sure you want to submit your exam paper?")) {
      submitExam();
    }
  };

  const handleAutoSubmit = () => {
    alert("Time limit expired! Your exam paper has been auto-submitted to the grading engine.");
    submitExam();
  };

  const submitExam = () => {
    if (!activeExam) return;

    const { score, correctCount, totalCount } = calculateScore(activeExam, answers);

    const newAttempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId: activeExam.id,
      studentId: studentId,
      score,
      correctCount,
      totalCount,
      answers,
      submittedAt: new Date().toISOString()
    };

    onSaveAttempt(newAttempt);
    setExamStarted(false);
    setViewAttempt(newAttempt);
    setActiveExam(null);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="mcq-exams-container" className="space-y-6">
      {!examStarted && !viewAttempt ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active scheduled exams list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-amber-400" />
              {t.onlineMCQExams}
            </h3>

            {exams.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">{t.noExams}</p>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const hasAttempt = pastAttempts.find(a => a.examId === exam.id);
                  return (
                    <div key={exam.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between md:flex-row md:items-center gap-4 hover:border-slate-700 transition-all">
                      <div className="flex-1">
                        <span className="text-[10px] font-mono tracking-wider text-amber-500 font-bold uppercase block mb-1">
                          {exam.moduleName} • {exam.batch} Batch
                        </span>
                        <h4 className="font-sans font-bold text-white text-sm">
                          {exam.title[lang]}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5 text-slate-500" />
                            {exam.durationMinutes} {t.minutes}
                          </span>
                          <span>•</span>
                          <span>{exam.questions.length} {t.questionCount}</span>
                        </div>
                      </div>

                      <div>
                        {hasAttempt ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              Score: {hasAttempt.score}%
                            </span>
                            <button
                              onClick={() => setViewAttempt(hasAttempt)}
                              className="text-[11px] font-semibold text-amber-400 hover:text-amber-500 underline"
                            >
                              View Scorecard
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartExam(exam)}
                            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider transition-colors uppercase shadow-md shadow-amber-500/15"
                          >
                            {t.startExam}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guidelines and history box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                Exam Honor Code & Instructions
              </h3>
              <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li>Strict timer mechanics apply. Refreshing your browser does not stop the timer.</li>
                <li>Ensure a stable network connection before starting as calculations process live.</li>
                <li>Every answer contains comprehensive, step-by-step teacher explanations unlocked instantly on submit.</li>
                <li>Any external material usage violates the NextGEN LMS protocol.</li>
              </ul>
            </div>

            {pastAttempts.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-4">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block mb-2">
                  Completed Assessments ({pastAttempts.length})
                </span>
                <div className="space-y-2">
                  {pastAttempts.map((att, idx) => {
                    const ex = exams.find(e => e.id === att.examId);
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="font-medium text-slate-300 truncate max-w-[200px]">
                          {ex ? ex.title[lang] : "Physics Assessment"}
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            {att.correctCount}/{att.totalCount} MCQ
                          </span>
                          <button
                            onClick={() => setViewAttempt(att)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/20 transition-all"
                          >
                            Scorecard
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : examStarted && activeExam ? (
        /* ACTIVE EXAM INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question selection sidebar */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between h-fit">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                  Question Sheet
                </span>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                  <Timer className="h-4 w-4 animate-pulse" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>

              {/* Grid map */}
              <div className="grid grid-cols-5 gap-2">
                {activeExam.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isActive = currentQuestionIdx === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center border ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                          : isAnswered
                          ? 'bg-slate-800 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800">
              <button
                onClick={handleManualSubmit}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-xl text-xs tracking-wider uppercase transition-colors"
              >
                {t.submitExamBtn}
              </button>
            </div>
          </div>

          {/* Question core view */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[400px]">
            {(() => {
              const q: MCQQuestion = activeExam.questions[currentQuestionIdx];
              return (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    <span>{activeExam.title[lang]}</span>
                    <span>Question {currentQuestionIdx + 1} of {activeExam.questions.length}</span>
                  </div>

                  {/* Question Prompt */}
                  <div className="rounded-xl bg-slate-950 p-5 border border-slate-800/80">
                    <p className="text-sm font-sans font-semibold text-slate-100 leading-relaxed">
                      {q.question[lang]}
                    </p>
                  </div>

                  {/* Option cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options[lang].map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                          }`}
                        >
                          <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs font-sans leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation footer */}
                  <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-8">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentQuestionIdx === activeExam.questions.length - 1}
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* SCORECARD & RETRO EXPLANATION VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8 max-w-3xl mx-auto">
          {(() => {
            const ex = exams.find(e => e.id === viewAttempt?.examId);
            if (!viewAttempt || !ex) return null;
            return (
              <>
                {/* Score Header */}
                <div className="text-center space-y-3 pb-6 border-b border-slate-800">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="font-display font-extrabold text-white text-2xl tracking-tight">
                    {t.scorecardTitle}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {ex.title[lang]}
                  </p>

                  <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mt-4">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                        Score
                      </span>
                      <span className="font-display text-lg font-bold text-amber-400">
                        {viewAttempt.score}%
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                        Correct
                      </span>
                      <span className="font-display text-lg font-bold text-emerald-400">
                        {viewAttempt.correctCount} / {viewAttempt.totalCount}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                        Accuracy
                      </span>
                      <span className="font-display text-lg font-bold text-blue-400">
                        {Math.round((viewAttempt.correctCount / viewAttempt.totalCount) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scorecard questions detailed list */}
                <div className="space-y-6">
                  {ex.questions.map((q, idx) => {
                    const selectedIdx = viewAttempt.answers[q.id];
                    const isCorrect = selectedIdx === q.correctOptionIndex;
                    return (
                      <div key={q.id} className={`rounded-xl border p-5 ${
                        isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                      }`}>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            Question {idx + 1}
                          </span>
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">
                              <Check className="h-3 w-3" /> CORRECT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/20">
                              <X className="h-3 w-3" /> INCORRECT
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-sans font-medium text-slate-200 mb-4 leading-relaxed">
                          {q.question[lang]}
                        </p>

                        <div className="space-y-2 mb-4">
                          {q.options[lang].map((opt, optIdx) => {
                            const isSelected = selectedIdx === optIdx;
                            const isCorrectOpt = q.correctOptionIndex === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                                  isCorrectOpt
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                                    : isSelected
                                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                    : 'bg-slate-950 border-slate-900 text-slate-400'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  {opt}
                                </span>
                                {isCorrectOpt && <Check className="h-4 w-4 text-emerald-400" />}
                                {!isCorrectOpt && isSelected && <X className="h-4 w-4 text-red-400" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Step-by-step Explanation */}
                        <div className="rounded-lg bg-slate-950 p-4.5 border border-slate-800">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block mb-1">
                            {t.explanationLabel}
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                            {q.explanation[lang]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setViewAttempt(null)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs tracking-wider transition-colors"
                  >
                    Back to Exams Dashboard
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}