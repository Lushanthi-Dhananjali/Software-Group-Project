import React, { useState } from 'react';
import { StudyMaterial, MCQExam, MCQQuestion, Language, Batch, ClassType, PhysicsClass } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { FileText, HelpCircle, Plus, Trash, BookOpen, Layers, CheckSquare, Calendar, Upload, Image, X, Edit, Eye, EyeOff } from 'lucide-react';

interface AdminContentPublisherProps {
  lang: Language;
  onPublishMaterial: (material: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadsCount'>) => void;
  onPublishExam: (exam: Omit<MCQExam, 'id' | 'createdAt'>) => void;
  onPublishClass?: (newClass: PhysicsClass, materials?: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadsCount'>[]) => void;
  classes?: PhysicsClass[];
  materials?: StudyMaterial[];
  onDeleteClass?: (classId: string) => void;
  onUpdateClass?: (updatedClass: PhysicsClass, materials?: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadsCount'>[]) => void;
}

export default function AdminContentPublisher({ 
  lang, 
  onPublishMaterial, 
  onPublishExam, 
  onPublishClass,
  classes = [],
  materials = [],
  onDeleteClass,
  onUpdateClass
}: AdminContentPublisherProps) {
  const t = TRANSLATIONS[lang];
  const [activeSubTab, setActiveSubTab] = useState<'material' | 'exam' | 'class'>('material');

  // Editing class state
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const startEditClass = (cls: PhysicsClass) => {
    setEditingClassId(cls.id);
    setClassTitleEn(cls.name.en);
    setClassTitleSi(cls.name.si);
    setClassBatch(cls.batch);
    setClassType(cls.type);
    setClassFee(cls.fee);
    setClassScheduleEn(cls.weeklySchedule.en);
    setClassScheduleSi(cls.weeklySchedule.si);
    setClassStreamUrl(cls.streamUrl);
    setClassThumbnail(cls.thumbnailUrl);
    setClassWhatsapp(cls.whatsappLink);
    setClassTelegram(cls.telegramLink || '');
    setClassMonth(cls.month || 'June');
    setClassDescEn(cls.description.en);
    setClassDescSi(cls.description.si);

    // Load existing class-specific study materials
    const matched = materials.filter(m => m.classId === cls.id);
    setClassMaterials(matched.map(m => ({
      id: m.id,
      titleEn: m.title.en,
      titleSi: m.title.si,
      moduleName: m.moduleName,
      pdfUrl: m.pdfUrl,
      type: m.type || 'Theory Note',
      isFree: m.isFree || false
    })));

    // Load existing class-specific videos
    if (cls.videoLinks) {
      setClassVideos(cls.videoLinks.map(v => ({
        id: v.id,
        titleEn: v.title.en,
        titleSi: v.title.si,
        url: v.url
      })));
    } else {
      setClassVideos([]);
    }
  };

  const cancelEditClass = () => {
    setEditingClassId(null);
    setClassTitleEn('');
    setClassTitleSi('');
    setClassBatch('2027');
    setClassType('Theory');
    setClassFee(3200);
    setClassScheduleEn('Every Sunday 8:00 AM - 1:30 PM');
    setClassScheduleSi('සෑම ඉරිදා දිනකම පෙ.ව 8:00 - ප.ව 1:30');
    setClassStreamUrl('');
    setClassThumbnail('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80');
    setClassWhatsapp('https://chat.whatsapp.com/ExampleWhatsAppLink');
    setClassTelegram('');
    setClassMonth('June');
    setClassDescEn('');
    setClassDescSi('');
    setClassMaterials([]);
    setClassVideos([]);
    setNewVideoTitleEn('');
    setNewVideoTitleSi('');
    setNewVideoUrl('');
    setNewMatTitleEn('');
    setNewMatTitleSi('');
    setNewMatPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setNewMatIsFree(false);
  };

  // New Class Track Fields
  const [classTitleEn, setClassTitleEn] = useState('');
  const [classTitleSi, setClassTitleSi] = useState('');
  const [classBatch, setClassBatch] = useState<Batch>('2027');
  const [classType, setClassType] = useState<ClassType>('Theory');
  const [classFee, setClassFee] = useState<number>(3200);
  const [classScheduleEn, setClassScheduleEn] = useState('Every Sunday 8:00 AM - 1:30 PM');
  const [classScheduleSi, setClassScheduleSi] = useState('සෑම ඉරිදා දිනකම පෙ.ව 8:00 - ප.ව 1:30');
  const [classStreamUrl, setClassStreamUrl] = useState('');
  const [classThumbnail, setClassThumbnail] = useState('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80');
  const [classWhatsapp, setClassWhatsapp] = useState('https://chat.whatsapp.com/ExampleWhatsAppLink');
  const [classTelegram, setClassTelegram] = useState('');
  const [classMonth, setClassMonth] = useState('June');
  const [classVideos, setClassVideos] = useState<Array<{ id?: string; titleEn: string; titleSi: string; url: string }>>([]);
  const [newVideoTitleEn, setNewVideoTitleEn] = useState('');
  const [newVideoTitleSi, setNewVideoTitleSi] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [classDescEn, setClassDescEn] = useState('');
  const [classDescSi, setClassDescSi] = useState('');

  // Study Materials state for class
  const [classMaterials, setClassMaterials] = useState<Array<{ id?: string; titleEn: string; titleSi: string; moduleName: string; pdfUrl: string; type: string; isFree?: boolean }>>([]);
  const [newMatTitleEn, setNewMatTitleEn] = useState('');
  const [newMatTitleSi, setNewMatTitleSi] = useState('');
  const [newMatType, setNewMatType] = useState('Theory Note');
  const [newMatModule, setNewMatModule] = useState('Mechanics');
  const [newMatPdfUrl, setNewMatPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [newMatIsFree, setNewMatIsFree] = useState(false);

  // Drag and drop states for Class Banner
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setClassThumbnail(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitleEn.trim() || !classTitleSi.trim()) {
      alert("Please fill in both English and Sinhala Class Titles.");
      return;
    }
    
    const generatedId = editingClassId || `class-${classBatch}-${classType.toLowerCase().replace(' ', '-')}-${Date.now()}`;
    const classData: PhysicsClass = {
      id: generatedId,
      name: { en: classTitleEn, si: classTitleSi },
      batch: classBatch,
      type: classType,
      fee: Number(classFee) || 0,
      weeklySchedule: { en: classScheduleEn, si: classScheduleSi },
      streamUrl: classStreamUrl,
      thumbnailUrl: classThumbnail,
      whatsappLink: classWhatsapp,
      telegramLink: classTelegram,
      month: classMonth,
      videoLinks: classVideos.map(v => ({
        id: v.id || `vid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: { en: v.titleEn, si: v.titleSi },
        url: v.url
      })),
      description: { en: classDescEn, si: classDescSi },
      isHidden: editingClassId ? (classes.find(c => c.id === editingClassId)?.isHidden || false) : false
    };

    if (editingClassId) {
      if (onUpdateClass) {
        onUpdateClass(classData, classMaterials);
        alert(`Class Track "${classTitleEn}" successfully updated and saved permanently!`);
      }
    } else {
      if (onPublishClass) {
        onPublishClass(classData, classMaterials);
        alert(`Class Track "${classTitleEn}" successfully created and saved permanently!`);
      }
    }
    cancelEditClass();
  };

  // Material fields
  const [materialTitleEn, setMaterialTitleEn] = useState('');
  const [materialTitleSi, setMaterialTitleSi] = useState('');
  const [materialModule, setMaterialModule] = useState('Mechanics');
  const [materialBatch, setMaterialBatch] = useState<Batch>('2027');
  const [materialPdfUrl, setMaterialPdfUrl] = useState('');
  const [materialIsFree, setMaterialIsFree] = useState(false);

  // Exam Builder fields
  const [examTitleEn, setExamTitleEn] = useState('');
  const [examTitleSi, setExamTitleSi] = useState('');
  const [examBatch, setExamBatch] = useState<Batch>('2027');
  const [examModule, setExamModule] = useState('Mechanics');
  const [examDuration, setExamDuration] = useState<number>(20);
  const [questionsList, setQuestionsList] = useState<MCQQuestion[]>([]);

  // Current Question Builder fields
  const [qEn, setQEn] = useState('');
  const [qSi, setQSi] = useState('');
  const [optionsEn, setOptionsEn] = useState<[string, string, string, string]>([
    'Option A', 'Option B', 'Option C', 'Option D'
  ]);
  const [optionsSi, setOptionsSi] = useState<[string, string, string, string]>([
    'විකල්පය A', 'විකල්පය B', 'විකල්පය C', 'විකල්පය D'
  ]);
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [expEn, setExpEn] = useState('');
  const [expSi, setExpSi] = useState('');

  const handlePublishMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitleEn.trim() || !materialTitleSi.trim() || !materialPdfUrl.trim()) {
      alert("Please fill in both English and Sinhala material titles and paste a PDF download link.");
      return;
    }

    onPublishMaterial({
      title: { en: materialTitleEn, si: materialTitleSi },
      moduleName: materialModule,
      batch: materialBatch,
      classId: materialBatch === '2026' ? 'class-2026-theory' : 'class-2027-theory',
      pdfUrl: materialPdfUrl,
      isFree: materialIsFree
    });

    alert("Physics study material successfully published to Designated LMS Folder!");
    setMaterialTitleEn('');
    setMaterialTitleSi('');
    setMaterialPdfUrl('');
    setMaterialIsFree(false);
  };

  const handleAddQuestionToDraft = () => {
    if (!qEn.trim() || !qSi.trim()) {
      alert("Question prompt must have both English and Sinhala content.");
      return;
    }

    const newQ: MCQQuestion = {
      id: `q-${Date.now()}`,
      question: { en: qEn, si: qSi },
      options: { en: optionsEn, si: optionsSi },
      correctOptionIndex: correctIdx,
      explanation: { en: expEn.trim() ? expEn : "Use Newtonian equations to resolve vector forces.", si: expSi.trim() ? expSi : "බල සමතුලිත සමීකරණ යොදා පිළිතුර ලබාගන්න." }
    };

    setQuestionsList(prev => [...prev, newQ]);
    // reset question inputs
    setQEn('');
    setQSi('');
    setExpEn('');
    setExpSi('');
    setOptionsEn(['Option A', 'Option B', 'Option C', 'Option D']);
    setOptionsSi(['විකල්පය A', 'විකල්පය B', 'විකල්පය C', 'විකල්පය D']);
  };

  const handlePublishExam = () => {
    if (!examTitleEn.trim() || !examTitleSi.trim()) {
      alert("Please fill in both English and Sinhala Exam Titles.");
      return;
    }
    if (questionsList.length === 0) {
      alert("Please add at least 1 MCQ question to build this exam.");
      return;
    }

    onPublishExam({
      title: { en: examTitleEn, si: examTitleSi },
      batch: examBatch,
      moduleName: examModule,
      durationMinutes: examDuration,
      questions: questionsList
    });

    alert(`Successfully generated and published exam: [${examTitleEn}] with ${questionsList.length} questions!`);
    setExamTitleEn('');
    setExamTitleSi('');
    setQuestionsList([]);
  };

  const prefillSampleMaterial = () => {
    setMaterialTitleEn("Mechanics Homework Booklet 02 - Projectile & Gravity");
    setMaterialTitleSi("යාන්ත්‍ර විද්‍යාව ගෙදර වැඩ පොත 02 - ප්‍රක්ෂේපණය සහ ගුරුත්වාකර්ෂණය");
    setMaterialModule("Mechanics");
    setMaterialBatch("2027");
    setMaterialPdfUrl("https://arxiv.org/pdf/physics/0401140.pdf");
  };

  const prefillSampleExam = () => {
    setExamTitleEn("Thermal Physics & Heat Transfer Mini Quiz");
    setExamTitleSi("තාප භෞතික විද්‍යාව සහ තාප සම්ප්‍රේෂණය කුඩා ප්‍රශ්න පත්‍රය");
    setExamBatch("2027");
    setExamModule("Thermal Physics");
    setExamDuration(15);
    setQuestionsList([
      {
        id: "sample-q-1",
        question: {
          en: "Which mode of heat transfer does not require any material medium for propagation?",
          si: "තාපය සම්ප්‍රේෂණය වීම සඳහා කිසිදු ද්‍රව්‍යමය මාධ්‍යයක් අවශ්‍ය නොවන ක්‍රමය කුමක්ද?"
        },
        options: {
          en: ["Conduction", "Convection", "Radiation", "Evaporation"],
          si: ["සන්නයනය", "සංවහනය", "විකිරණය", "වාෂ්පීකරණය"]
        },
        correctOptionIndex: 2, // Radiation
        explanation: {
          en: "Radiation is heat transfer via electromagnetic waves (infrared photons) which propagates through vacuum space, whereas conduction and convection require atom vibrations and molecular flows respectively.",
          si: "තාප විකිරණය සිදුවන්නේ විද්‍යුත් චුම්බක තරංග මාර්ගයෙන් වන බැවින් ඒ සඳහා කිසිදු මාධ්‍යයක් අවශ්‍ය නොවේ. සන්නයනය හා සංවහනය සඳහා පරමාණු කම්පනය හා අංශු චලිතය අවශ්‍ය වේ."
        }
      }
    ]);
  };

  return (
    <div id="admin-content-publisher" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-800 pb-3 gap-4">
        <button
          onClick={() => setActiveSubTab('material')}
          className={`pb-1 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'material'
              ? 'text-amber-400 border-amber-500'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <FileText className="h-4.5 w-4.5" />
          {t.addMaterial}
        </button>
        <button
          onClick={() => setActiveSubTab('exam')}
          className={`pb-1 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'exam'
              ? 'text-amber-400 border-amber-500'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <HelpCircle className="h-4.5 w-4.5" />
          {t.createMCQExam}
        </button>
        <button
          onClick={() => setActiveSubTab('class')}
          className={`pb-1 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'class'
              ? 'text-amber-400 border-amber-500'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Calendar className="h-4.5 w-4.5" />
          Create / Edit Classes
        </button>
      </div>

      {activeSubTab === 'material' && (
        /* STUDY MATERIAL PUBLISHING FORM */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-950 p-4.5 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Upload printable PDFs, lesson booklets, syllabus targets and model answers directly locked to batch authorizations.
            </p>
            <button
              onClick={prefillSampleMaterial}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20 transition-all cursor-pointer"
            >
              Prefill Sample Booklet
            </button>
          </div>

          <form onSubmit={handlePublishMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Booklet Title (English)
              </label>
              <input
                id="material-title-en"
                type="text"
                value={materialTitleEn}
                onChange={(e) => setMaterialTitleEn(e.target.value)}
                placeholder="e.g. Mechanics Booklet 02 - Projectiles Study Guide"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Booklet Title (Sinhala)
              </label>
              <input
                id="material-title-si"
                type="text"
                value={materialTitleSi}
                onChange={(e) => setMaterialTitleSi(e.target.value)}
                placeholder="e.g. යාන්ත්‍ර විද්‍යාව පොත 02 - ප්‍රක්ෂේපණ නිබන්ධනය"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Topic Module Category
              </label>
              <select
                id="material-module-select"
                value={materialModule}
                onChange={(e) => setMaterialModule(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Mechanics">Mechanics (යාන්ත්‍ර විද්‍යාව)</option>
                <option value="Waves & Vibrations">Waves & Vibrations (තරංග සහ කම්පන)</option>
                <option value="Thermal Physics">Thermal Physics (තාපය)</option>
                <option value="Fields">Fields (ක්ෂේත්‍ර)</option>
                <option value="Electricity & Magnetism">Electricity & Magnetism (ධාරා විද්‍යුතය)</option>
                <option value="Electronics">Electronics (ඉලෙක්ට්‍රොනික විද්‍යාව)</option>
                <option value="Modern Physics">Modern Physics (නූතන භෞතික විද්‍යාව)</option>
                <option value="General">General Physics (පොදු කරුණු)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                Target Student Batch
              </label>
              <select
                id="material-batch-select"
                value={materialBatch}
                onChange={(e: any) => setMaterialBatch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="2027">2027 A/L Class</option>
                <option value="2026">2026 A/L Class</option>
                <option value="2025">2025 A/L Class</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                PDF Resource Download Link
              </label>
              <input
                id="material-pdf-url"
                type="text"
                value={materialPdfUrl}
                onChange={(e) => setMaterialPdfUrl(e.target.value)}
                placeholder="Paste PDF link (e.g. https://arxiv.org/pdf/physics/...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <input
                id="material-is-free-checkbox"
                type="checkbox"
                checked={materialIsFree}
                onChange={(e) => setMaterialIsFree(e.target.checked)}
                className="w-4 h-4 text-red-500 bg-slate-950 border-slate-800 rounded focus:ring-red-500 focus:ring-offset-slate-950"
              />
              <label htmlFor="material-is-free-checkbox" className="font-bold text-xs text-slate-300 cursor-pointer select-none">
                🆓 Set as Free Study Material (Students can download this study material without payment, highlighted in red)
              </label>
            </div>

            <div className="md:col-span-2 pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl tracking-wider uppercase transition-colors"
              >
                Publish Study Booklet
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === 'exam' && (
        /* MCQ QUESTIONNAIRE BUILDER MODULE */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-950 p-4.5 rounded-xl border border-slate-800 text-xs">
            <p className="text-slate-300 max-w-lg leading-relaxed font-sans">
              Build a real online exam paper with strict countdown timings, answer options grids, and step-by-step math solver feedback comments.
            </p>
            <button
              onClick={prefillSampleExam}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/20 transition-all shrink-0 cursor-pointer"
            >
              Prefill Sample Exam
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start text-xs">
            {/* Exam metadata and question drafting */}
            <div className="space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-bold block mb-2">
                1. Exam Configuration
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                    Exam Title (English)
                  </label>
                  <input
                    id="exam-title-en"
                    type="text"
                    value={examTitleEn}
                    onChange={(e) => setExamTitleEn(e.target.value)}
                    placeholder="e.g. Kinetic Theory Speed Test 01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                    Exam Title (Sinhala)
                  </label>
                  <input
                    id="exam-title-si"
                    type="text"
                    value={examTitleSi}
                    onChange={(e) => setExamTitleSi(e.target.value)}
                    placeholder="e.g. වායුගතික වාද ඇගයීම් පරීක්ෂණය 01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                    Target Batch
                  </label>
                  <select
                    id="exam-batch-select"
                    value={examBatch}
                    onChange={(e: any) => setExamBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="2027">2027 Class</option>
                    <option value="2026">2026 Class</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                    Timer (Minutes)
                  </label>
                  <input
                    id="exam-duration-input"
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Draft Question form */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-bold block mb-2">
                  2. Add MCQ Question to Draft
                </span>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Question Prompt (English)</label>
                  <input
                    id="draft-q-en"
                    type="text"
                    value={qEn}
                    onChange={(e) => setQEn(e.target.value)}
                    placeholder="Type physics question in English..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-amber-500/50 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Question Prompt (Sinhala)</label>
                  <input
                    id="draft-q-si"
                    type="text"
                    value={qSi}
                    onChange={(e) => setQSi(e.target.value)}
                    placeholder="Type physics question in Sinhala..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-amber-500/50 mt-1"
                  />
                </div>

                {/* Choices */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option A (English)</label>
                    <input
                      type="text"
                      value={optionsEn[0]}
                      onChange={(e) => setOptionsEn([e.target.value, optionsEn[1], optionsEn[2], optionsEn[3]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option A (Sinhala)</label>
                    <input
                      type="text"
                      value={optionsSi[0]}
                      onChange={(e) => setOptionsSi([e.target.value, optionsSi[1], optionsSi[2], optionsSi[3]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option B (English)</label>
                    <input
                      type="text"
                      value={optionsEn[1]}
                      onChange={(e) => setOptionsEn([optionsEn[0], e.target.value, optionsEn[2], optionsEn[3]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option B (Sinhala)</label>
                    <input
                      type="text"
                      value={optionsSi[1]}
                      onChange={(e) => setOptionsSi([optionsSi[0], e.target.value, optionsSi[2], optionsSi[3]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option C (English)</label>
                    <input
                      type="text"
                      value={optionsEn[2]}
                      onChange={(e) => setOptionsEn([optionsEn[0], optionsEn[1], e.target.value, optionsEn[3]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option C (Sinhala)</label>
                    <input
                      type="text"
                      value={optionsSi[2]}
                      onChange={(e) => setOptionsSi([optionsSi[0], optionsSi[1], e.target.value, optionsSi[3]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option D (English)</label>
                    <input
                      type="text"
                      value={optionsEn[3]}
                      onChange={(e) => setOptionsEn([optionsEn[0], optionsEn[1], optionsEn[2], e.target.value])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Option D (Sinhala)</label>
                    <input
                      type="text"
                      value={optionsSi[3]}
                      onChange={(e) => setOptionsSi([optionsSi[0], optionsSi[1], optionsSi[2], e.target.value])}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Correct Selection */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500">Correct Answer Option</label>
                    <select
                      id="draft-q-correct-idx-select"
                      value={correctIdx}
                      onChange={(e) => setCorrectIdx(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>

                {/* Step-by-step math solver feedback comment */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-500">Tutor Math Solver Explanation (English)</label>
                  <textarea
                    value={expEn}
                    onChange={(e) => setExpEn(e.target.value)}
                    placeholder="Provide equations and reasoning steps..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none min-h-[50px] mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500">Tutor Math Solver Explanation (Sinhala)</label>
                  <textarea
                    value={expSi}
                    onChange={(e) => setExpSi(e.target.value)}
                    placeholder="සමීකරණ සහ විභාග ලකුණු ලබාදීමේ විවරණ පියවර ලියන්න..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none min-h-[50px] mt-1"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionToDraft}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 hover:border-slate-600 rounded-xl text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Question to Paper
                </button>
              </div>
            </div>

            {/* Questions preview panel */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between h-full min-h-[480px]">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block mb-3 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                  3. Question Draft Timeline ({questionsList.length})
                </span>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {questionsList.length === 0 ? (
                    <p className="text-slate-600 text-xs italic text-center py-20">No draft questions added. Use the drafting panel on the left.</p>
                  ) : (
                    questionsList.map((qDraft, idx) => (
                      <div key={qDraft.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-bold text-slate-500">Q{idx + 1}: {qDraft.question[lang]}</span>
                          <p className="text-[10px] text-amber-500 font-mono mt-1 font-semibold">
                            Correct: {String.fromCharCode(65 + qDraft.correctOptionIndex)}
                          </p>
                        </div>
                        <button
                          onClick={() => setQuestionsList(prev => prev.filter(qItem => qItem.id !== qDraft.id))}
                          className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={handlePublishExam}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15"
                >
                  <BookOpen className="h-4.5 w-4.5" /> Publish Finished Exam Paper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'class' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-950 p-4.5 rounded-xl border border-slate-800 gap-3">
            <div className="text-xs">
              <span className="font-bold text-amber-400 block mb-0.5 font-mono uppercase tracking-wider">Interactive Pathways Administration</span>
              <p className="text-slate-400 leading-relaxed font-sans">
                Create new curriculum schedules, set student monthly fees, or update, hide, and remove existing tracks instantly.
              </p>
            </div>
            {editingClassId && (
              <button
                onClick={cancelEditClass}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-[11px] text-amber-500 font-bold hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                Clear Current Edit State
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDE: LIST OF EXISTING CLASSES */}
            <div className="xl:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Configured Class Tracks ({classes.length})
                </h3>
              </div>

              {classes.length === 0 ? (
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
                  No active or configured class tracks found.
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {classes.map((cls) => {
                    const isBeingEdited = editingClassId === cls.id;
                    return (
                      <div
                        key={cls.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isBeingEdited
                            ? 'bg-amber-950/20 border-amber-500 shadow-lg shadow-amber-950/10'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={cls.thumbnailUrl || 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=150&q=80'}
                            alt={cls.name.en}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded font-bold font-mono">
                                A/L {cls.batch}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide uppercase ${
                                cls.type === 'Theory' 
                                  ? 'bg-emerald-500/10 text-emerald-400' 
                                  : 'bg-indigo-500/10 text-indigo-400'
                              }`}>
                                {cls.type}
                              </span>
                              {cls.isHidden && (
                                <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white tracking-wide mt-1 truncate">
                              {cls.name.en}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {cls.name.si}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">
                              LKR {cls.fee.toLocaleString()} • {cls.weeklySchedule.en}
                            </p>
                          </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center justify-end gap-1.5 border-t border-slate-800/60 mt-3 pt-2.5">
                          <button
                            type="button"
                            onClick={() => startEditClass(cls)}
                            title="Edit pathway data"
                            className="p-1.5 bg-slate-950 text-slate-400 hover:text-amber-400 hover:bg-slate-850 rounded-lg border border-slate-800 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateClass) {
                                onUpdateClass({
                                  ...cls,
                                  isHidden: !cls.isHidden
                                });
                              }
                            }}
                            title={cls.isHidden ? "Make visible to students" : "Hide from students"}
                            className={`p-1.5 bg-slate-950 text-slate-400 hover:bg-slate-850 rounded-lg border border-slate-800 transition-all cursor-pointer flex items-center justify-center ${
                              cls.isHidden ? 'text-red-400 hover:text-emerald-400' : 'hover:text-amber-500'
                            }`}
                          >
                            {cls.isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you absolutely sure you want to permanently delete the "${cls.name.en}" class pathway? This cannot be undone.`)) {
                                if (onDeleteClass) onDeleteClass(cls.id);
                              }
                            }}
                            title="Delete class permanently"
                            className="p-1.5 bg-slate-950 text-slate-400 hover:text-red-400 hover:bg-slate-850 rounded-lg border border-slate-800 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: DYNAMIC EDITOR / CREATOR FORM */}
            <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {editingClassId ? 'Modify Selected Class Track' : 'Publish New Class Track'}
                </h3>
                {editingClassId && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {editingClassId}
                  </span>
                )}
              </div>

              <form onSubmit={handlePublishClassSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Class Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={classTitleEn}
                    onChange={(e) => setClassTitleEn(e.target.value)}
                    placeholder="e.g. 2027 Theory - Thermal Physics Masterclass"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Class Name (Sinhala)
                  </label>
                  <input
                    type="text"
                    required
                    value={classTitleSi}
                    onChange={(e) => setClassTitleSi(e.target.value)}
                    placeholder="e.g. 2027 සිද්ධාන්ත - තාප භෞතික විද්‍යාව විශේෂ පන්තිය"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Target Batch
                  </label>
                  <input
                    type="text"
                    required
                    value={classBatch}
                    onChange={(e) => setClassBatch(e.target.value)}
                    placeholder="e.g. 2027"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Class Type
                  </label>
                  <select
                    value={classType}
                    onChange={(e: any) => setClassType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50 font-sans"
                  >
                    <option value="Theory">Theory (සිද්ධාන්ත)</option>
                    <option value="Revision">Revision (පුනරීක්ෂණ)</option>
                    <option value="Paper Class">Paper Class (ප්‍රශ්න පත්‍ර)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Class Month
                  </label>
                  <select
                    value={classMonth}
                    onChange={(e) => setClassMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50 font-sans"
                  >
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Monthly Fee (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={classFee}
                    onChange={(e) => setClassFee(Number(e.target.value) || 0)}
                    placeholder="e.g. 3500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Live Stream Link / Embed URL (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={classStreamUrl}
                    onChange={(e) => setClassStreamUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Weekly Class Time (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={classScheduleEn}
                    onChange={(e) => setClassScheduleEn(e.target.value)}
                    placeholder="e.g. Every Sunday 8:00 AM - 1:30 PM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Weekly Class Time (Sinhala)
                  </label>
                  <input
                    type="text"
                    required
                    value={classScheduleSi}
                    onChange={(e) => setClassScheduleSi(e.target.value)}
                    placeholder="e.g. සෑම ඉරිදා දිනකම පෙ.ව 8:00 - ප.ව 1:30"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="md:col-span-2 bg-slate-900/50 p-4.5 rounded-xl border border-slate-800 space-y-4">
                  <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                    Class Cover Banner (Drag & Drop or Preset)
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* File Upload Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('banner-file-input')?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isDragOver
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      <input
                        id="banner-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Upload className="h-8 w-8 mb-2 text-slate-500 animate-pulse" />
                      <p className="text-xs font-bold text-slate-300">Drag & Drop Banner Image here</p>
                      <p className="text-[10px] text-slate-500 mt-1">or click to browse local files (PNG, JPG, WEBP)</p>
                    </div>

                    {/* URL Entry / Custom Presets */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-1">
                          Or paste an external Image URL
                        </label>
                        <input
                          type="text"
                          value={classThumbnail}
                          onChange={(e) => setClassThumbnail(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                        />
                      </div>

                      <div>
                        <span className="block text-[9px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-1.5">
                          Or select a Quick Preset:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setClassThumbnail('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80')}
                            className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 py-1.5 px-2 rounded-lg border border-slate-800 truncate cursor-pointer"
                          >
                            Cyber Physics
                          </button>
                          <button
                            type="button"
                            onClick={() => setClassThumbnail('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80')}
                            className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 py-1.5 px-2 rounded-lg border border-slate-800 truncate cursor-pointer"
                          >
                            Quantum Lab
                          </button>
                          <button
                            type="button"
                            onClick={() => setClassThumbnail('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80')}
                            className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 py-1.5 px-2 rounded-lg border border-slate-800 truncate cursor-pointer"
                          >
                            Space & Gravity
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banner Preview Area */}
                  {classThumbnail && (
                    <div className="relative border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950 p-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Image className="h-3.5 w-3.5 text-amber-500" /> Active Banner Preview
                        </span>
                        <button
                          type="button"
                          onClick={() => setClassThumbnail('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80')}
                          className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Reset to default"
                        >
                          <X className="h-3.5 w-3.5" /> Reset
                        </button>
                      </div>
                      <div className="relative h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={classThumbnail}
                          alt="Class banner preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-3">
                          <span className="text-[8px] bg-amber-500 text-slate-950 font-bold tracking-wider px-1.5 py-0.5 rounded uppercase self-start mb-1">
                            {classType || 'Theory'}
                          </span>
                          <h4 className="text-[11px] font-bold text-white tracking-wide truncate">
                            {classTitleEn || 'Class Title (English)'}
                          </h4>
                          <p className="text-[9px] text-slate-300 truncate">
                            {classTitleSi || 'Class Title (Sinhala)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    WhatsApp Group Invitation Link
                  </label>
                  <input
                    type="text"
                    required
                    value={classWhatsapp}
                    onChange={(e) => setClassWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Telegram Group Invitation Link (including Telegram Link)
                  </label>
                  <input
                    type="text"
                    value={classTelegram}
                    onChange={(e) => setClassTelegram(e.target.value)}
                    placeholder="https://t.me/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Description (English)
                  </label>
                  <textarea
                    value={classDescEn}
                    onChange={(e) => setClassDescEn(e.target.value)}
                    placeholder="Briefly summarize this pathway's syllabus targets..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 min-h-[50px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                    Description (Sinhala)
                  </label>
                  <textarea
                    value={classDescSi}
                    onChange={(e) => setClassDescSi(e.target.value)}
                    placeholder="මෙම පන්ති කාණ්ඩයේ විෂය පථය කෙටියෙන් විස්තර කරන්න..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 min-h-[50px]"
                  />
                </div>

                {/* CLASS VIDEOS ASSOCIATED WITH THIS TRACK */}
                <div className="md:col-span-2 bg-slate-900/40 p-4.5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5 text-red-400">
                      <Plus className="h-4 w-4" />
                      Class Videos ({classVideos.length})
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Add multiple videos for this class. Students click and redirect directly to YouTube
                    </span>
                  </div>

                  {/* List of currently added videos */}
                  {classVideos.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                      {classVideos.map((vid, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <div className="min-w-0 flex-1 pr-3">
                            <span className="text-[10px] text-red-400 font-mono truncate block mb-1" title={vid.url}>
                              {vid.url}
                            </span>
                            <h5 className="font-bold text-white text-xs truncate">
                              {vid.titleEn} / {vid.titleSi}
                            </h5>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setClassVideos(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                            title="Remove video"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new video inputs */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          Video Title (English)
                        </label>
                        <input
                          type="text"
                          value={newVideoTitleEn}
                          onChange={(e) => setNewVideoTitleEn(e.target.value)}
                          placeholder="e.g. Friction Force Deep Dive Lesson"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          Video Title (Sinhala)
                        </label>
                        <input
                          type="text"
                          value={newVideoTitleSi}
                          onChange={(e) => setNewVideoTitleSi(e.target.value)}
                          placeholder="e.g. ඝර්ෂණ බලය ගැඹුරින් අධ්‍යයනය"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                        YouTube Video Link (Redirect Link)
                      </label>
                      <input
                        type="text"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40 font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!newVideoTitleEn.trim() || !newVideoTitleSi.trim() || !newVideoUrl.trim()) {
                          alert("Please fill in Video Title in English & Sinhala and a valid YouTube URL.");
                          return;
                        }
                        setClassVideos(prev => [
                          ...prev,
                          {
                            titleEn: newVideoTitleEn.trim(),
                            titleSi: newVideoTitleSi.trim(),
                            url: newVideoUrl.trim()
                          }
                        ]);
                        setNewVideoTitleEn('');
                        setNewVideoTitleSi('');
                        setNewVideoUrl('');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors"
                    >
                      + Add Video to List
                    </button>
                  </div>
                </div>

                {/* STUDY MATERIALS ASSOCIATED WITH THIS CLASS TRACK */}
                <div className="md:col-span-2 bg-slate-900/40 p-4.5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-amber-500" />
                      Class Study Materials ({classMaterials.length})
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Add study sheets/PDFs that unlock instantly with this class track
                    </span>
                  </div>

                  {/* List of currently associated materials */}
                  {classMaterials.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {classMaterials.map((mat, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-slate-900 text-amber-500 px-1.5 py-0.25 text-[8px] font-mono rounded font-bold uppercase">
                                {mat.moduleName}
                              </span>
                              <span className="bg-slate-900 text-emerald-500 px-1.5 py-0.25 text-[8px] font-mono rounded font-bold uppercase">
                                {mat.type || 'Theory Note'}
                              </span>
                              {mat.isFree && (
                                <span className="bg-white text-red-600 border border-red-200 px-1.5 py-0.25 text-[8px] font-mono rounded font-bold uppercase">
                                  FREE
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" title={mat.pdfUrl}>
                                {mat.pdfUrl}
                              </span>
                            </div>
                            <h5 className="font-bold text-white text-xs mt-1 truncate">
                              {mat.titleEn}
                            </h5>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setClassMaterials(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                            title="Remove study material"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new study material inputs */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          Material Title (English)
                        </label>
                        <input
                          type="text"
                          value={newMatTitleEn}
                          onChange={(e) => setNewMatTitleEn(e.target.value)}
                          placeholder="e.g. Unit 1 - Introduction to Mechanics Booklet"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          Material Title (Sinhala)
                        </label>
                        <input
                          type="text"
                          value={newMatTitleSi}
                          onChange={(e) => setNewMatTitleSi(e.target.value)}
                          placeholder="e.g. 1 ඒකකය - යාන්ත්‍ර විද්‍යාව හැඳින්වීම නිබන්ධනය"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          Physics Module / Part
                        </label>
                        <input
                          type="text"
                          value={newMatModule}
                          onChange={(e) => setNewMatModule(e.target.value)}
                          placeholder="e.g. Mechanics (යාන්ත්‍ර විද්‍යාව)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          Material Type
                        </label>
                        <select
                          value={newMatType}
                          onChange={(e) => setNewMatType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/40 font-sans"
                        >
                          <option value="Theory Note">Theory Note (සිද්ධාන්ත සටහන)</option>
                          <option value="Revision Guide">Revision Guide (පුනරීක්ෂණ අත්පොත)</option>
                          <option value="Homework Sheet">Homework Sheet (නිබන්ධනය)</option>
                          <option value="Paper Discussion">Paper Discussion (ප්‍රශ්න පත්‍ර සාකච්ඡාව)</option>
                          <option value="Other">Other (වෙනත්)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-semibold mb-1">
                          PDF Booklet URL (Google Drive / Direct)
                        </label>
                        <input
                          type="text"
                          value={newMatPdfUrl}
                          onChange={(e) => setNewMatPdfUrl(e.target.value)}
                          placeholder="Paste PDF link here"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/40 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id="new-mat-is-free-checkbox"
                        type="checkbox"
                        checked={newMatIsFree}
                        onChange={(e) => setNewMatIsFree(e.target.checked)}
                        className="w-3.5 h-3.5 text-red-500 bg-slate-900 border-slate-800 rounded focus:ring-red-500"
                      />
                      <label htmlFor="new-mat-is-free-checkbox" className="font-semibold text-[10px] text-slate-300 cursor-pointer select-none">
                        🆓 Set as Free Study Material (red text for students, free download)
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!newMatTitleEn.trim() || !newMatTitleSi.trim() || !newMatPdfUrl.trim()) {
                          alert("Please fill in English and Sinhala titles plus a valid PDF URL.");
                          return;
                        }
                        setClassMaterials(prev => [
                          ...prev,
                          {
                            titleEn: newMatTitleEn.trim(),
                            titleSi: newMatTitleSi.trim(),
                            moduleName: newMatModule,
                            pdfUrl: newMatPdfUrl.trim(),
                            type: newMatType,
                            isFree: newMatIsFree
                          }
                        ]);
                        // Clear fields except module
                        setNewMatTitleEn('');
                        setNewMatTitleSi('');
                        setNewMatPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                        setNewMatIsFree(false);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors"
                    >
                      + Add Material to List
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 pt-2 flex justify-end gap-2">
                  {editingClassId && (
                    <button
                      type="button"
                      onClick={cancelEditClass}
                      className="px-5 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold rounded-xl tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    {editingClassId ? 'Save Class Pathway' : 'Create Class Track'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}