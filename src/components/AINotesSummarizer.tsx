import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Key,
  FileText,
  Copy,
  Check,
  Download,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  HelpCircle,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  FileCode,
  ListOrdered,
  Eye,
  Layers,
  Atom,
  ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Language, StudyMaterial, SummarizerMode, SummarizerLevel, NotesSummaryResult, FormulaOrDefinition } from '../types';

interface AINotesSummarizerProps {
  lang: Language;
  studyMaterials?: StudyMaterial[];
}

const PRESET_TOPICS = [
  {
    titleEn: 'Newtonian Mechanics & Circular Motion',
    titleSi: 'නිව්ටෝනියානු යාන්ත්‍ර විද්‍යාව සහ වෘත්ත චලිතය',
    content: `Newton's Laws of Motion:
1. First Law (Inertia): An object continues in its state of rest or uniform motion in a straight line unless acted upon by a resultant external force.
2. Second Law (Momentum): The rate of change of momentum is directly proportional to the applied resultant force and takes place in the direction of the force. F = dp/dt = ma (when mass m is constant). SI unit of force is Newton (N = kg m s^-2).
3. Third Law (Action-Reaction): To every action, there is an equal and opposite reaction acting on different bodies simultaneously.

Circular Motion:
- Angular velocity: omega = d(theta)/dt = 2*pi*f = v/r (rad s^-1).
- Centripetal Acceleration: a_c = v^2/r = omega^2 * r (directed towards the center).
- Centripetal Force: F_c = m*v^2/r = m*omega^2*r.
- Conical Pendulum: Tension T cos(theta) = mg, T sin(theta) = m*omega^2*r, tan(theta) = v^2 / (r*g).
- Banking of Roads: For no lateral friction required, tan(theta) = v^2 / (r*g).

Work, Energy & Power:
- Work done: W = F . s * cos(theta) (Joules, J).
- Work-Energy Theorem: Total work done on a particle equals the change in its kinetic energy: W_net = Delta(K) = 0.5*m*(v^2 - u^2).
- Gravitational Potential Energy: U = m*g*h (near Earth's surface).
- Conservation of Mechanical Energy: E_total = K + U = constant (in conservative force fields).
- Power: P = dW/dt = F * v (Watts, W = J s^-1).`
  },
  {
    titleEn: 'Wave Optics, Doppler Effect & Resonance Columns',
    titleSi: 'තරංග ප්‍රකාශ විද්‍යාව, ඩොප්ලර් ආචරණය සහ අනුනාදය',
    content: `Sound Waves & Doppler Effect:
- Doppler Effect: The observed change in frequency of a wave when the source and observer are in relative motion.
- General formula: f' = f_0 * (v +/- v_o) / (v -/+ v_s)
  where v = speed of sound in medium, v_s = velocity of source, v_o = velocity of observer.
- Frequency increases as source/observer approach; frequency decreases as they recede.

Stationary Waves & Resonance in Air Columns:
- Closed Organ Pipe (one end closed):
  - Fundamental (1st harmonic): L = lambda / 4 => f_1 = v / (4L)
  - Next overtone (3rd harmonic): f_3 = 3v / (4L) = 3*f_1
  - Only ODD harmonics exist: f_1, 3f_1, 5f_1...
  - End correction (e = 0.6*r): L_eff = L + e.
- Open Organ Pipe (both ends open):
  - Fundamental: L = lambda / 2 => f_1 = v / (2L)
  - 2nd harmonic (1st overtone): f_2 = 2v / (2L) = 2*f_1
  - ALL harmonics exist (integer multiples): f_1, 2f_1, 3f_1...
  - End correction: L_eff = L + 2e.

Wave Optics & Interference:
- Superposition Principle: Resultant displacement y = y_1 + y_2.
- Constructive Interference (Maxima): Path difference Delta = n * lambda (n = 0, 1, 2...). Phase difference Phi = 2*n*pi.
- Destructive Interference (Minima): Path difference Delta = (2n + 1) * lambda / 2. Phase difference Phi = (2n + 1)*pi.
- Young's Double Slit Experiment: Fringe width beta = (lambda * D) / d, where D = screen distance, d = slit separation.`
  },
  {
    titleEn: 'Thermodynamics & Kinetic Theory of Gases',
    titleSi: 'තාප ගති විද්‍යාව සහ වායු පිළිබඳ චාලක වාදය',
    content: `Ideal Gas Equations:
- Equation of State: P*V = n*R*T = N*k_B*T
  where R = 8.314 J mol^-1 K^-1, k_B = 1.38 x 10^-23 J K^-1 (Boltzmann constant).
- Kinetic Theory Assumptions: Point particles, continuous random motion, perfectly elastic collisions, negligible intermolecular forces except during collisions.
- Kinetic Pressure Formula: P = (1/3) * rho * (c_rms)^2 = (1/3) * (M/V) * (c_rms)^2.
- Mean Kinetic Energy of a molecule: E_k = (3/2) * k_B * T.
- Mean Kinetic Energy per mole: E_m = (3/2) * R * T.

First Law of Thermodynamics:
- Delta(Q) = Delta(U) + Delta(W)
  where Delta(Q) = Heat supplied to the system (+ve when absorbed).
  Delta(U) = Change in internal energy (for ideal gas Delta(U) = n * C_v * Delta(T)).
  Delta(W) = Work done BY the system = Integral(P dV).
- Thermodynamic Processes:
  1. Isochoric (constant Volume): dV = 0 => W = 0 => Delta(Q) = Delta(U).
  2. Isobaric (constant Pressure): W = P * (V_2 - V_1) => Delta(Q) = Delta(U) + P*Delta(V).
  3. Isothermal (constant Temperature): Delta(T) = 0 => Delta(U) = 0 => Delta(Q) = W = n*R*T * ln(V_2/V_1).
  4. Adiabatic (no heat exchange): Delta(Q) = 0 => W = -Delta(U). Governed by P * V^gamma = constant (gamma = C_p / C_v).`
  },
  {
    titleEn: 'Electromagnetic Induction & Alternating Current',
    titleSi: 'විද්‍යුත් චුම්භක ප්‍රේරණය සහ ප්‍රත්‍යාවර්ත ධාරාව',
    content: `Electromagnetic Induction:
- Magnetic Flux: Phi = B . A = B * A * cos(theta) (Webers, Wb = T m^2).
- Faraday's Law of Induction: Induced EMF epsilon = - d(Phi) / dt.
- Lenz's Law: The direction of induced current is such that it opposes the change in magnetic flux that produces it (Conservation of Energy).
- Motional EMF: epsilon = B * L * v (for conductor of length L moving perpendicular to field B at speed v).
- Self-Induction: Phi_total = L * I => epsilon_L = -L * (dI/dt). Self inductance L (Henrys, H).
- Energy stored in an Inductor: U_B = 0.5 * L * I^2.

Alternating Current (AC) Circuits:
- Sinusoidal AC voltage: V = V_0 * sin(omega * t).
- RMS Values: V_rms = V_0 / sqrt(2) approx 0.707 * V_0, I_rms = I_0 / sqrt(2).
- Inductive Reactance: X_L = omega * L = 2 * pi * f * L (Ohms). Voltage leads current by 90 deg (pi/2).
- Capacitive Reactance: X_C = 1 / (omega * C) = 1 / (2 * pi * f * C) (Ohms). Current leads voltage by 90 deg.
- Series LCR Circuit Impedance: Z = sqrt( R^2 + (X_L - X_C)^2 ).
- Resonance Condition: X_L = X_C => f_0 = 1 / ( 2 * pi * sqrt(L * C) ). At resonance, Z = R (minimum), Current I is maximum.`
  }
];

export default function AINotesSummarizer({ lang, studyMaterials = [] }: AINotesSummarizerProps) {
  const isSinhala = lang === 'si';

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ap_student_gemini_key') || '';
  });
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyVerificationMsg, setKeyVerificationMsg] = useState<{ status: 'success' | 'error' | null; text: string }>({ status: null, text: '' });

  // Summarizer Input State
  const [inputText, setInputText] = useState<string>('');
  const [topicLabel, setTopicLabel] = useState<string>('');
  const [mode, setMode] = useState<SummarizerMode>('key_points');
  const [level, setLevel] = useState<SummarizerLevel>('standard');
  const [targetLang, setTargetLang] = useState<Language>(lang);

  // Summarizer Execution State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<NotesSummaryResult | null>(null);
  const [error, setError] = useState<string>('');

  // Active Output Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'formulas' | 'tips' | 'quiz' | 'markdown'>('overview');

  // Interactive Quiz State
  const [revealedQuizItems, setRevealedQuizItems] = useState<Record<number, boolean>>({});

  // Saved Library State
  const [savedSummaries, setSavedSummaries] = useState<NotesSummaryResult[]>(() => {
    try {
      const stored = localStorage.getItem('ap_saved_summaries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [viewingSavedTab, setViewingSavedTab] = useState<boolean>(false);
  const [searchSavedQuery, setSearchSavedQuery] = useState<string>('');

  // UI Toast & Read Aloud State
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync API Key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('ap_student_gemini_key', apiKey);
    } else {
      localStorage.removeItem('ap_student_gemini_key');
    }
  }, [apiKey]);

  // Sync Saved Summaries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ap_saved_summaries', JSON.stringify(savedSummaries));
    } catch (e) {
      console.warn('Could not persist saved summaries:', e);
    }
  }, [savedSummaries]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update target language when prop changes
  useEffect(() => {
    setTargetLang(lang);
  }, [lang]);

  // Handle Verify API Key
  const handleVerifyApiKey = async () => {
    if (!tempApiKey.trim()) {
      setKeyVerificationMsg({ status: 'error', text: isSinhala ? 'කරුණාකර API යතුරක් ඇතුළත් කරන්න.' : 'Please enter a Gemini API key.' });
      return;
    }
    setIsVerifyingKey(true);
    setKeyVerificationMsg({ status: null, text: '' });
    try {
      const res = await fetch('/api/verify-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: tempApiKey.trim() })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setApiKey(tempApiKey.trim());
        setKeyVerificationMsg({
          status: 'success',
          text: isSinhala ? '✓ API යතුර සාර්ථකව තහවුරු විය!' : '✓ Gemini API key is verified & ready to use!'
        });
      } else {
        setKeyVerificationMsg({
          status: 'error',
          text: data.error || (isSinhala ? 'වලංගු නොවන API යතුරකි.' : 'Invalid Gemini API key.')
        });
      }
    } catch (err: any) {
      setKeyVerificationMsg({
        status: 'error',
        text: err?.message || (isSinhala ? 'සම්බන්ධතා දෝෂයකි.' : 'Network error verifying key.')
      });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Handle Clear API Key
  const handleClearApiKey = () => {
    setApiKey('');
    setTempApiKey('');
    localStorage.removeItem('ap_student_gemini_key');
    setKeyVerificationMsg({
      status: null,
      text: isSinhala ? 'LMS පෙරනිමි AI යතුර භාවිතයට සකස් විය.' : 'Switched to LMS server default AI engine.'
    });
  };

  // Handle Generate Summary
  const handleGenerateSummary = async () => {
    if (!inputText.trim() || inputText.trim().length < 10) {
      setError(isSinhala ? 'කරුණාකර සාරාංශ කිරීමට අවම වශයෙන් වචන කිහිපයක සටහනක් ඇතුළත් කරන්න.' : 'Please enter at least a few lines of physics notes or text to summarize.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setRevealedQuizItems({});

    try {
      const response = await fetch('/api/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode,
          level,
          language: targetLang,
          customApiKey: apiKey.trim() || undefined,
          topic: topicLabel.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (isSinhala ? 'සාරාංශය සැකසීමට නොහැකි විය.' : 'Failed to generate study summary.'));
      }

      setSummaryResult(data.summary);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err?.message || (isSinhala ? 'දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.' : 'An error occurred during summarization. Please try again.'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopySummary = () => {
    if (!summaryResult) return;
    const textToCopy = summaryResult.rawMarkdown || `${summaryResult.title}\n\n${summaryResult.overview}\n\nKey Points:\n${summaryResult.keyPoints.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Text-To-Speech (Read Aloud)
  const handleToggleSpeech = () => {
    if (!window.speechSynthesis || !summaryResult) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${summaryResult.title}. ${summaryResult.overview}. Key points: ${summaryResult.keyPoints.slice(0, 4).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = summaryResult.language === 'si' ? 'si-LK' : 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Save to Library
  const handleSaveToLibrary = () => {
    if (!summaryResult) return;
    const isAlreadySaved = savedSummaries.some(s => s.id === summaryResult.id);
    if (isAlreadySaved) {
      setSavedSummaries(prev => prev.filter(s => s.id !== summaryResult.id));
    } else {
      setSavedSummaries(prev => [summaryResult, ...prev]);
    }
  };

  const isCurrentSaved = summaryResult && savedSummaries.some(s => s.id === summaryResult.id);

  // PDF Export
  const handleExportPDF = () => {
    if (!summaryResult) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(245, 158, 11); // amber-500
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('NEXTGEN A/L PHYSICS - AI STUDY GUIDE', 14, 14);

      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date(summaryResult.createdAt).toLocaleDateString()} | Engine: ${summaryResult.provider}`, 14, 22);
      doc.text(`Topic: ${summaryResult.title}`, 14, 27);

      let yPos = 42;

      // Title & Overview
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(summaryResult.title, 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      const overviewLines = doc.splitTextToSize(summaryResult.overview, 182);
      doc.text(overviewLines, 14, yPos);
      yPos += overviewLines.length * 5 + 6;

      // Key Takeaways Section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. CORE KEY POINTS & TAKEAWAYS', 14, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      summaryResult.keyPoints.forEach((point, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const bulletText = doc.splitTextToSize(`• ${point}`, 180);
        doc.text(bulletText, 14, yPos);
        yPos += bulletText.length * 4.5 + 2;
      });
      yPos += 4;

      // Formulas & Definitions
      if (summaryResult.formulasAndDefinitions && summaryResult.formulasAndDefinitions.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('2. ESSENTIAL FORMULAS & LAWS', 14, yPos);
        yPos += 6;

        doc.setFontSize(9);
        summaryResult.formulasAndDefinitions.forEach((item, index) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(180, 83, 9); // amber-700
          doc.text(`[${item.termOrLaw}]`, 14, yPos);
          yPos += 4.5;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          const formulaLines = doc.splitTextToSize(`Formula / Def: ${item.formulaOrDefinition}`, 180);
          doc.text(formulaLines, 14, yPos);
          yPos += formulaLines.length * 4.5;

          if (item.siUnitsOrNotes) {
            doc.setTextColor(100, 116, 139);
            const notesLines = doc.splitTextToSize(`Units & Notes: ${item.siUnitsOrNotes}`, 180);
            doc.text(notesLines, 14, yPos);
            yPos += notesLines.length * 4.5;
          }
          yPos += 2;
        });
        yPos += 4;
      }

      // Exam Pitfalls & High-Yield Tips
      if (summaryResult.examTips && summaryResult.examTips.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('3. A/L EXAM TIPS & PITFALLS', 14, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        summaryResult.examTips.forEach((tip) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const tipLines = doc.splitTextToSize(`⚠️ ${tip}`, 180);
          doc.text(tipLines, 14, yPos);
          yPos += tipLines.length * 4.5 + 2;
        });
        yPos += 4;
      }

      // Quick Quiz Flashcards
      if (summaryResult.quickQuiz && summaryResult.quickQuiz.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('4. ACTIVE RECALL PRACTICE QUESTIONS', 14, yPos);
        yPos += 6;

        summaryResult.quickQuiz.forEach((qa, index) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          const qLines = doc.splitTextToSize(`Q${index + 1}: ${qa.question}`, 180);
          doc.text(qLines, 14, yPos);
          yPos += qLines.length * 4.5 + 1;

          doc.setFont('helvetica', 'italic');
          doc.setTextColor(16, 185, 129); // emerald-500
          const aLines = doc.splitTextToSize(`Ans: ${qa.answer}`, 180);
          doc.text(aLines, 14, yPos);
          yPos += aLines.length * 4.5 + 3;
        });
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Channel A+ Physics LMS | Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
      }

      doc.save(`${(summaryResult.title || 'physics_summary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (pdfErr) {
      console.error('Error generating PDF:', pdfErr);
      alert('Could not export PDF. Please try copying markdown instead.');
    }
  };

  // Filtered Saved Summaries
  const filteredSavedSummaries = savedSummaries.filter(s => {
    if (!searchSavedQuery.trim()) return true;
    const query = searchSavedQuery.toLowerCase();
    return s.title.toLowerCase().includes(query) || (s.overview && s.overview.toLowerCase().includes(query));
  });

  return (
    <div className="space-y-6">
      {/* ================= TOP HEADER BANNER ================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                  {isSinhala ? 'AI සටහන් සාරාංශකාරකය' : 'AI Study Notes Summarizer'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <Sparkles className="h-3 w-3" />
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {isSinhala
                  ? 'ඔබගේ භෞතික විද්‍යා සටහන්, දේශන උපුටා ගැනීම් සහ පොත් පිටු ඇතුළත් කර ක්ෂණිකව ප්‍රධාන සූත්‍ර, නියම සහ විභාග ඉඟි සාරාංශ කරගන්න.'
                  : 'Transform lengthy Physics theory, lecture notes, and textbook extracts into high-yield revision summaries, formula sheets, and active recall quizzes.'}
              </p>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
            {/* Toggle Saved Library View */}
            <button
              type="button"
              onClick={() => setViewingSavedTab(!viewingSavedTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                viewingSavedTab
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 border-slate-700 hover:text-white'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>{isSinhala ? 'සුරකින ලද සාරාංශ' : 'Saved Summaries'} ({savedSummaries.length})</span>
            </button>

            {/* API Key Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                setTempApiKey(apiKey);
                setKeyVerificationMsg({ status: null, text: '' });
                setShowKeyModal(true);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                apiKey
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-amber-300 border-amber-500/30 hover:border-amber-400'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>{apiKey ? (isSinhala ? 'Custom API යතුර සක්‍රීයයි' : 'Custom API Key Connected') : (isSinhala ? 'API යතුර සම්බන්ධ කරන්න' : 'Connect Gemini API Key')}</span>
              {apiKey && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: API KEY SETTINGS ================= */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    {isSinhala ? 'Google Gemini API යතුර සම්බන්ධ කිරීම' : 'Connect Google Gemini API Key'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isSinhala ? 'ඔබගේම Gemini API Key එක භාවිතයෙන් වේගවත් සාරාංශ ලබාගන්න' : 'Use your personal Gemini key for unlimited high-speed summaries'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-300 mb-1.5">
                  {isSinhala ? 'Gemini API Key එක ඇතුළත් කරන්න (AI Studio)' : 'Enter Gemini API Key (from Google AI Studio)'}
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {keyVerificationMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    keyVerificationMsg.status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {keyVerificationMsg.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{keyVerificationMsg.text}</span>
                </div>
              )}

              {/* Instructions on how to get free API key */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2 text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <HelpCircle className="h-4 w-4" />
                  <span>{isSinhala ? 'නොමිලේ API Key එකක් ලබා ගන්නේ කෙසේද?' : 'How to get a FREE Gemini API Key:'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 text-[11px]">
                  <li>
                    {isSinhala ? 'Google AI Studio වෙත පිවිසෙන්න:' : 'Go to Google AI Studio:'}{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline hover:text-amber-300 font-mono inline-flex items-center gap-0.5"
                    >
                      aistudio.google.com <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </li>
                  <li>{isSinhala ? '"Create API Key" මත ක්ලික් කර නව යතුරක් ලබාගන්න.' : 'Click "Create API Key" with your Google Account.'}</li>
                  <li>{isSinhala ? 'එම Key එක මෙහි Paste කර "Save & Test Key" ඔබන්න.' : 'Copy and paste the key above, then click "Verify & Save".'}</li>
                </ol>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/50 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{isSinhala ? 'ඔබගේ යතුර ආරක්ෂිතව බ්‍රවුසරයේ පමණක් සුරැකේ.' : 'Your API key stays encrypted in your local browser session.'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleClearApiKey}
                className="text-xs text-slate-400 hover:text-rose-400 font-semibold transition-colors"
              >
                {isSinhala ? 'පෙරනිමි AI වෙත මාරු වන්න' : 'Reset to Default AI'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  {isSinhala ? 'වසන්න' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyApiKey}
                  disabled={isVerifyingKey}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-60"
                >
                  {isVerifyingKey ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                      <span>{isSinhala ? 'තහවුරු කරමින්...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{isSinhala ? 'තහවුරු කර සුරකින්න' : 'Verify & Save Key'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SAVED SUMMARIES LIBRARY VIEW ================= */}
      {viewingSavedTab ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <BookmarkCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white">
                  {isSinhala ? 'මගේ සුරකින ලද සාරාංශ එකතුව' : 'My Saved Study Summaries'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isSinhala ? 'ඔබ පෙරදී සුරකින ලද සියලුම සාරාංශ මෙහි ඇත' : 'Browse, re-read, and export your saved study guides'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchSavedQuery}
                  onChange={(e) => setSearchSavedQuery(e.target.value)}
                  placeholder={isSinhala ? 'සාරාංශ සොයන්න...' : 'Search summaries...'}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setViewingSavedTab(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200"
              >
                {isSinhala ? 'නව සාරාංශයක් සාදන්න' : 'Back to Summarizer'}
              </button>
            </div>
          </div>

          {filteredSavedSummaries.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-500">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {isSinhala ? 'තවමත් සුරකින ලද සාරාංශ නොමැත.' : 'No saved summaries found.'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isSinhala ? 'සටහනක් සාරාංශ කළ පසු "Bookmark" බොත්තම ක්ලික් කර මෙහි සුරකින්න.' : 'Summarize your physics notes and click the bookmark button to save them here for offline access.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSavedSummaries.map((saved) => (
                <div
                  key={saved.id}
                  className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4.5 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-bold text-white text-sm leading-snug">{saved.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        {saved.mode.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{saved.overview}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                      <span>{new Date(saved.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{saved.keyPoints?.length || 0} Key Points</span>
                      <span>•</span>
                      <span>{saved.formulasAndDefinitions?.length || 0} Formulas</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setSummaryResult(saved);
                        setViewingSavedTab(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{isSinhala ? 'විවෘත කර බලන්න' : 'Open Summary'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSavedSummaries(prev => prev.filter(s => s.id !== saved.id))}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      title={isSinhala ? 'ඉවත් කරන්න' : 'Delete'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= SUMMARIZER ENGINE INTERFACE ================= */
        <div className="space-y-6">
          {/* Main Input Control Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Quick Presets & Material Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                  <Atom className="h-3.5 w-3.5 text-amber-400" />
                  {isSinhala ? 'ක්ෂණික විෂය කොටස් තෝරන්න (Quick Sample Presets):' : 'Quick A/L Physics Sample Presets:'}
                </span>

                {/* Upload text file */}
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{isSinhala ? 'සටහන් ගොනුවක් උඩුගත කරන්න (.txt / .md)' : 'Upload text/notes file'}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          if (content) {
                            setInputText(content);
                            setTopicLabel(file.name.replace(/\.[^/.]+$/, ''));
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {PRESET_TOPICS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(preset.content);
                      setTopicLabel(isSinhala ? preset.titleSi : preset.titleEn);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300 hover:text-amber-300 transition-all text-left"
                  >
                    {isSinhala ? preset.titleSi : preset.titleEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Topic Label input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  {isSinhala ? 'විෂය මාතෘකාව (විකල්ප)' : 'Topic / Chapter Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={topicLabel}
                  onChange={(e) => setTopicLabel(e.target.value)}
                  placeholder={isSinhala ? 'උදා: චාලක විද්‍යාව, තරංග සහ කම්පන...' : 'e.g. Mechanics, Doppler Effect, Quantum Physics...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Study Materials auto-loader from LMS */}
              {studyMaterials && studyMaterials.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    {isSinhala ? 'පන්ති නිබන්ධනයකින්' : 'From Class Material'}
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = studyMaterials.find(m => m.id === e.target.value);
                      if (selected) {
                        setTopicLabel(isSinhala ? selected.title.si : selected.title.en);
                        setInputText(`Module: ${selected.moduleName}\nTitle: ${selected.title.en}\nType: ${selected.type || 'Theory Material'}\nNotes regarding ${selected.moduleName} covering all fundamental laws and applications.`);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">{isSinhala ? '-- තෝරන්න --' : '-- Choose material --'}</option>
                    {studyMaterials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {isSinhala ? mat.title.si : mat.title.en} ({mat.moduleName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Large Text Area for Notes */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  {isSinhala ? 'සාරාංශ කිරීමට අවශ්‍ය සටහන් පෙළ (Lecture / Book Text):' : 'Paste Study Notes / Textbook Text to Summarize:'}
                </label>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span>{inputText.length} chars</span>
                  <span>•</span>
                  <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => { setInputText(''); setTopicLabel(''); }}
                      className="text-slate-400 hover:text-rose-400 font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isSinhala
                    ? 'ඔබගේ පාඩම් සටහන, දේශන උපුටනය හෝ සූත්‍ර මෙහි Paste කරන්න...'
                    : 'Paste physics formulas, lecture notes, textbook paragraphs, or problem statements here...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Customization Options Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              {/* Summary Mode */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  {isSinhala ? 'සාරාංශ ආකෘතිය (Mode)' : 'Summary Mode / Focus'}
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as SummarizerMode)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="key_points">📌 Key Points & Takeaways</option>
                  <option value="formula_sheet">🧪 Formulas & SI Units Sheet</option>
                  <option value="executive_summary">📖 Executive Study Guide</option>
                  <option value="qa_quiz">❓ Self-Test Q&A Flashcards</option>
                  <option value="mindmap_outline">🗺️ Hierarchical Topic Outline</option>
                </select>
              </div>

              {/* Target Language */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  {isSinhala ? 'ප්‍රතිදාන භාෂාව (Language)' : 'Output Language'}
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as Language)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="en">English (A/L Standard)</option>
                  <option value="si">සිංහල (Sinhala Medium)</option>
                </select>
              </div>

              {/* Depth / Level */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                  {isSinhala ? 'ගැඹුර / මට්ටම (Level)' : 'Syllabus Depth / Level'}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SummarizerLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="standard">Standard A/L Syllabus Level</option>
                  <option value="advanced">Advanced Distinction (A-Grade) Speed</option>
                  <option value="simplified">Quick Intuitive Revision</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{isSinhala ? 'සාරාංශකරණ දෝෂයකි:' : 'Summarizer Error:'}</p>
                  <p className="text-slate-300">{error}</p>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {apiKey
                    ? (isSinhala ? 'ඔබගේ පෞද්ගලික Gemini API යතුර භාවිත වේ.' : 'Running on your connected personal Gemini API key.')
                    : (isSinhala ? 'LMS සේවාදායක පෙරනිමි AI භාවිත වේ.' : 'Running on LMS server default AI engine.')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGenerating || !inputText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>{isSinhala ? 'AI සාරාංශය සකසමින් පවතී...' : 'Generating AI Summary...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{isSinhala ? 'සාරාංශය සාදන්න (Summarize Now)' : 'Generate AI Summary'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ================= RESULTS VIEW CONTAINER ================= */}
          {summaryResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-fade-in">
              {/* Result Top Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {summaryResult.provider}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {summaryResult.mode.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {summaryResult.wordCount} source words
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-extrabold text-white">
                    {summaryResult.title}
                  </h2>
                </div>

                {/* Toolbar: Bookmark, Copy, PDF, Speech, Re-generate */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isCurrentSaved
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                    }`}
                    title={isCurrentSaved ? 'Saved in library' : 'Save to library'}
                  >
                    {isCurrentSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" /> : <Bookmark className="h-3.5 w-3.5" />}
                    <span>{isCurrentSaved ? (isSinhala ? 'සුරකින ලදි' : 'Saved') : (isSinhala ? 'සුරකින්න' : 'Bookmark')}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all"
                  >
                    {copiedToast ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedToast ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'පිටපත් කරන්න' : 'Copy')}</span>
                  </button>

                  {/* Read Aloud */}
                  {window.speechSynthesis && (
                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSpeaking
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="h-3.5 w-3.5 text-emerald-400" /> : <Volume2 className="h-3.5 w-3.5" />}
                      <span>{isSpeaking ? (isSinhala ? 'නවතන්න' : 'Stop Audio') : (isSinhala ? 'ශ්‍රවණය' : 'Read Aloud')}</span>
                    </button>
                  )}

                  {/* Export PDF */}
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isSinhala ? 'PDF බාගන්න' : 'Export PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                {[
                  { id: 'overview', label: isSinhala ? 'සාරාංශය සහ ප්‍රධාන කරුණු' : 'Overview & Key Points', icon: FileText },
                  { id: 'formulas', label: isSinhala ? 'සූත්‍ර සහ නියම' : 'Formulas & Definitions', count: summaryResult.formulasAndDefinitions?.length, icon: Atom },
                  { id: 'tips', label: isSinhala ? 'විභාග ඉඟි සහ වැරදි' : 'A/L Exam Pitfalls & Tips', count: summaryResult.examTips?.length, icon: AlertCircle },
                  { id: 'quiz', label: isSinhala ? 'ස්වයං පරීක්ෂණ Flashcards' : 'Active Recall Q&A', count: summaryResult.quickQuiz?.length, icon: HelpCircle },
                  { id: 'markdown', label: isSinhala ? 'සම්පූර්ණ Markdown' : 'Full Markdown', icon: FileCode }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ================= TAB 1: OVERVIEW & KEY POINTS ================= */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Executive Overview Box */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4.5 space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400">
                      {isSinhala ? 'විධායක සාරාංශය (Executive Synopsis)' : 'Executive Synopsis'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      {summaryResult.overview}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{isSinhala ? 'ප්‍රධාන කරුණු සහ නිගමන (Core Takeaways)' : 'Core Key Points & Takeaways'}</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5">
                      {summaryResult.keyPoints.map((point, index) => (
                        <div
                          key={index}
                          className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 flex items-start gap-3 hover:border-slate-700 transition-colors"
                        >
                          <span className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400 shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: FORMULAS & DEFINITIONS ================= */}
              {activeTab === 'formulas' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                      <Atom className="h-4 w-4 text-amber-400" />
                      <span>{isSinhala ? 'භෞතික නියම, සමීකරණ සහ ඒකක' : 'Physical Laws, Equations & SI Units'}</span>
                    </h3>
                  </div>

                  {!summaryResult.formulasAndDefinitions || summaryResult.formulasAndDefinitions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      {isSinhala ? 'මෙම කොටසේ සූත්‍ර හමු නොවීය.' : 'No formulas were detected in this specific extract.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {summaryResult.formulasAndDefinitions.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-amber-500/40 transition-colors flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-display font-bold text-amber-400 text-xs sm:text-sm">
                                {item.termOrLaw}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-850 text-slate-400 border border-slate-800">
                                LAW / EQUATION
                              </span>
                            </div>

                            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-emerald-300 font-semibold leading-relaxed">
                              {item.formulaOrDefinition}
                            </div>
                          </div>

                          {item.siUnitsOrNotes && (
                            <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                              <strong className="text-slate-300">Units & Notes:</strong> {item.siUnitsOrNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: EXAM TIPS & PITFALLS ================= */}
              {activeTab === 'tips' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span>{isSinhala ? 'විභාග උපදෙස් සහ පොදු වැරදි (Exam Pitfalls & Examiner Tips)' : 'Crucial A/L Exam Pitfalls & High-Yield Tips'}</span>
                  </h3>

                  {!summaryResult.examTips || summaryResult.examTips.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      {isSinhala ? 'විභාග ඉඟි නොමැත.' : 'No specific exam tips generated for this topic.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {summaryResult.examTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs sm:text-sm text-slate-200 flex items-start gap-3"
                        >
                          <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-xs">
                            !
                          </div>
                          <div className="leading-relaxed">
                            <span className="font-bold text-amber-300 block mb-0.5">
                              {isSinhala ? `විභාග ඉඟිය #${idx + 1}` : `Exam Tip #${idx + 1}`}
                            </span>
                            <span>{tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 4: ACTIVE RECALL FLASHCARDS ================= */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-emerald-400" />
                      <span>{isSinhala ? 'ස්වයං ඇගයීම් ප්‍රශ්න සහ පිළිතුරු (Active Recall)' : 'Active Recall Self-Assessment Q&A'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const allRevealed = Object.keys(revealedQuizItems).length === summaryResult.quickQuiz.length;
                        if (allRevealed) {
                          setRevealedQuizItems({});
                        } else {
                          const all: Record<number, boolean> = {};
                          summaryResult.quickQuiz.forEach((_, i) => (all[i] = true));
                          setRevealedQuizItems(all);
                        }
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      {Object.keys(revealedQuizItems).length === summaryResult.quickQuiz.length
                        ? (isSinhala ? 'සියලු පිළිතුරු සඟවන්න' : 'Hide All Answers')
                        : (isSinhala ? 'සියලු පිළිතුරු පෙන්වන්න' : 'Reveal All Answers')}
                    </button>
                  </div>

                  {!summaryResult.quickQuiz || summaryResult.quickQuiz.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      {isSinhala ? 'ප්‍රශ්න හමු නොවීය.' : 'No flashcard questions generated for this section.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5">
                      {summaryResult.quickQuiz.map((qa, idx) => {
                        const isRevealed = Boolean(revealedQuizItems[idx]);
                        return (
                          <div
                            key={idx}
                            className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                                  Q{idx + 1}
                                </span>
                                <h4 className="font-semibold text-white text-xs sm:text-sm leading-relaxed">
                                  {qa.question}
                                </h4>
                              </div>

                              <button
                                type="button"
                                onClick={() => setRevealedQuizItems(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-amber-400 shrink-0 transition-colors"
                              >
                                {isRevealed ? (isSinhala ? 'සඟවන්න' : 'Hide') : (isSinhala ? 'පිළිතුර බලන්න' : 'Reveal Answer')}
                              </button>
                            </div>

                            {isRevealed && (
                              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-3 text-xs sm:text-sm text-emerald-200 leading-relaxed animate-fade-in flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-emerald-300 block text-[11px] uppercase font-mono mb-0.5">
                                    {isSinhala ? 'නිවැරදි පිළිතුර / විවරණය:' : 'Model Answer:'}
                                  </strong>
                                  <span>{qa.answer}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 5: FULL MARKDOWN VIEW ================= */}
              {activeTab === 'markdown' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                      GitHub Markdown Preview
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedToast ? 'Copied!' : 'Copy Markdown'}</span>
                    </button>
                  </div>

                  <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                    {summaryResult.rawMarkdown}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
