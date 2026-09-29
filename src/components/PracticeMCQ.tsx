import { useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, LoaderCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { Language } from '../types';

interface PracticeQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
  explanation: string;
  provider: 'Gemini' | 'Ollama';
}

interface PracticeMCQProps {
  lang: Language;
  topics: string[];
}

const DEFAULT_TOPICS = [
  'Mechanics',
  'Waves and Vibrations',
  'Thermal Physics',
  'Fields',
  'Electricity and Magnetism',
  'Electronics',
  'Modern Physics'
];

export default function PracticeMCQ({ lang, topics }: PracticeMCQProps) {
  const isSinhala = lang === 'si';
  const topicOptions = [...new Set([...DEFAULT_TOPICS, ...topics.filter(Boolean)])];
  const [topic, setTopic] = useState(topicOptions[0]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const requestQuestions = async () => {
      const response = await fetch('/api/practice-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: questionCount })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not generate practice questions.');
      if (!Array.isArray(result.questions) || result.questions.length !== questionCount) {
        throw new Error(`The question generator did not return all ${questionCount} questions. Please try again.`);
      }
      return result.questions as PracticeQuestion[];
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    setError('');
    setQuestions([]);
    setAnswers({});
    setQuestionIndex(0);

    try {
      setQuestions(await requestQuestions());
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Could not generate practice questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[questionIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(question => answers[question.id] === question.correctOptionIndex).length;

  return (
    <section className="space-y-5" aria-label={isSinhala ? 'පුහුණු MCQ' : 'Practice MCQ'}>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white">
              {isSinhala ? 'AI MCQ පුහුණුව' : 'AI MCQ Practice'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSinhala ? 'අභියෝගාත්මක ඉංග්‍රීසි මාධ්‍ය උසස් පෙළ භෞතික විද්‍යා ප්‍රශ්න' : 'Challenging English-medium A/L Physics practice'}
            </p>
          </div>
        </div>
        {questions.length > 0 && (
          <div className="text-xs font-mono text-slate-300" aria-live="polite">
            {isSinhala ? 'නිවැරදි' : 'Correct'} <span className="text-emerald-300 font-bold">{correctCount}</span> / {answeredCount}
          </div>
        )}
      </header>

      {questions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">{isSinhala ? 'විෂය' : 'Subject'}</span>
              <input value={isSinhala ? 'භෞතික විද්‍යාව' : 'A/L Physics'} readOnly className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300" />
            </label>
            <label className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">{isSinhala ? 'විෂය කොටස' : 'Topic'}</span>
              <select value={topic} onChange={event => setTopic(event.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500">
                {topicOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
              <span>{isSinhala ? 'මාධ්‍යය' : 'Language'}: <strong className="text-slate-200">English</strong></span>
              <span>{isSinhala ? 'මට්ටම' : 'Difficulty'}: <strong className="text-slate-200">{isSinhala ? 'අභියෝගාත්මක' : 'Challenging'}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-slate-800 pt-4">
            <label className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">{isSinhala ? 'එක් කට්ටලයක ප්‍රශ්න ගණන' : 'Questions per set'}</span>
              <select value={questionCount} onChange={event => setQuestionCount(Number(event.target.value))} className="w-full sm:w-40 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500">
                <option value={5}>5 MCQs</option>
                <option value={10}>10 MCQs</option>
              </select>
            </label>
            <button type="button" onClick={generateQuestions} disabled={isGenerating} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-wait px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors">
              {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? (isSinhala ? 'ප්‍රශ්න සකස් කරමින්...' : 'Generating questions...') : (isSinhala ? 'පුහුණුව ආරම්භ කරන්න' : 'Generate practice set')}
            </button>
          </div>
          {error && (
            <div role="alert" className="flex gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">{topic} · English · Challenging</span>
              <p className="text-xs text-slate-400 mt-1">{isSinhala ? 'ප්‍රශ්නය' : 'Question'} {questionIndex + 1} / {questions.length}</p>
            </div>
            <button type="button" onClick={() => { setQuestions([]); setAnswers({}); setError(''); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-2 rounded-lg hover:bg-slate-800" title={isSinhala ? 'නව ප්‍රශ්න කට්ටලයක්' : 'Create another set'}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isSinhala ? 'නව කට්ටලයක්' : 'New set'}</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {error && (
              <div role="alert" className="flex gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <h3 className="text-base sm:text-lg leading-relaxed font-semibold text-white">{currentQuestion.question}</h3>
            {currentQuestion.provider === 'Ollama' && (
              <div role="note" className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                {isSinhala
                  ? 'මෙය Ollama මඟින් සකස් කරන ලදී. පිළිතුර පන්ති සටහන් සමඟ පරීක්ෂා කරන්න.'
                  : 'Generated by Ollama fallback. Please double-check the answer with your class notes.'}
              </div>
            )}
            <div className="grid gap-2.5">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = currentQuestion.correctOptionIndex === index;
                const hasAnswered = selectedOption !== undefined;
                const stateClass = !hasAnswered
                  ? isSelected ? 'border-emerald-400 bg-emerald-400/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-600'
                  : isCorrect ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100' : isSelected ? 'border-rose-500/60 bg-rose-500/10 text-rose-100' : 'border-slate-800 bg-slate-950 text-slate-400';
                return (
                  <button key={index} type="button" disabled={hasAnswered} onClick={() => setAnswers(previous => ({ ...previous, [currentQuestion.id]: index }))} className={`flex items-start gap-3 text-left rounded-lg border px-4 py-3 text-sm transition-colors ${stateClass}`}>
                    <span className="h-6 w-6 shrink-0 rounded-full border border-current/30 flex items-center justify-center text-[10px] font-mono font-bold">{String.fromCharCode(65 + index)}</span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                    {hasAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />}
                    {hasAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-rose-300" />}
                  </button>
                );
              })}
            </div>
            {selectedOption !== undefined && (
              <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4" aria-live="polite">
                <p className={`text-xs font-bold mb-1.5 ${selectedOption === currentQuestion.correctOptionIndex ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {selectedOption === currentQuestion.correctOptionIndex ? (isSinhala ? 'නිවැරදියි' : 'Correct answer') : (isSinhala ? 'නිවැරදි පිළිතුර' : 'Review the correct answer')}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex(index => index - 1)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40">
                <ArrowLeft className="h-4 w-4" />{isSinhala ? 'පෙර' : 'Previous'}
              </button>
              <span className="text-[10px] font-mono text-slate-500">{answeredCount} / {questions.length} {isSinhala ? 'පිළිතුරු දී ඇත' : 'answered'}</span>
              <button type="button" disabled={questionIndex === questions.length - 1} onClick={() => setQuestionIndex(index => index + 1)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40">
                {isSinhala ? 'ඊළඟ' : 'Next'}<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}