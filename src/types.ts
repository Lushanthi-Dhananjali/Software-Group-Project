export type Role = 'student' | 'admin' | 'editor' | 'instructor' | 'super-admin';
export type VerificationStatus = 'active' | 'pending' | 'rejected';
export type Batch = string;
export type ClassType = 'Theory' | 'Revision' | 'Paper Class';
export type Language = 'en' | 'si';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  whatsapp?: string;
  school?: string;
  gender?: string;
  district?: string;
  address?: string;
  batch: Batch;
  role: Role;
  indexNo: string; // e.g. AP-2027-1002
  barcode: string; // customized serial for scanners
  status: VerificationStatus;
  rejectionReason?: string;
  createdAt: string;
  manuallyEnrolledClasses?: string[];
  hiddenExamPaperIds?: string[];
  password?: string;
}

export interface PhysicsClass {
  id: string;
  name: { en: string; si: string };
  batch: Batch;
  type: ClassType;
  fee: number; // LKR e.g. 3500
  weeklySchedule: { en: string; si: string }; // e.g. "Sunday 8:00 AM - 1:00 PM"
  streamUrl: string; // YouTube stream embed URL
  thumbnailUrl: string;
  whatsappLink: string;
  description: { en: string; si: string };
  isHidden?: boolean;
  month?: string; // e.g., "June"
  telegramLink?: string; // e.g. "https://t.me/..."
  videoLinks?: { id: string; title: { en: string; si: string }; url: string }[];
}

export interface Recording {
  id: string;
  classId: string;
  title: { en: string; si: string };
  date: string;
  videoUrl: string;
  duration: string;
  bookmarks: { time: number; label: string }[];
}

export interface StudyMaterial {
  id: string;
  title: { en: string; si: string };
  moduleName: string; // Mechanics, Light, Fields, etc.
  batch: Batch;
  classId: string;
  pdfUrl: string; // Mock or downloadable PDF
  uploadedAt: string;
  downloadsCount: number;
  type?: string; // e.g. "Theory Note", "Homework Sheet", etc.
  isFree?: boolean;
}

export interface MCQQuestion {
  id: string;
  question: { en: string; si: string };
  options: {
    en: [string, string, string, string];
    si: [string, string, string, string];
  };
  correctOptionIndex: number; // 0 to 3
  explanation: { en: string; si: string };
  diagramUrl?: string;
}

export interface MCQExam {
  id: string;
  title: { en: string; si: string };
  batch: Batch;
  moduleName: string;
  durationMinutes: number;
  questions: MCQQuestion[];
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  score: number; // Percentage
  correctCount: number;
  totalCount: number;
  answers: { [questionId: string]: number }; // questionId -> selectedOptionIndex
  submittedAt: string;
}

export interface ExamPaperMCQ {
  id: string;
  question: string;
  options: [string, string, string, string];
}

export interface ExamPaperSubQuestion {
  id: string;
  prompt: string;
}

export interface ExamPaperStructuredQuestion {
  id: string;
  prompt: string;
  subQuestions: ExamPaperSubQuestion[];
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  topic: string;
  batch: Batch;
  durationMinutes: number;
  mcqQuestions: ExamPaperMCQ[];
  structuredQuestions: ExamPaperStructuredQuestion[];
  createdAt: string;
  createdBy: string;
  isPublished: boolean;
}

export interface ExamPaperSubmission {
  id: string;
  paperId: string;
  studentId: string;
  studentName: string;
  studentIndexNo: string;
  batch: Batch;
  mcqAnswers: Record<string, number>;
  structuredAnswers: Record<string, string>;
  submittedAt: string;
}

export interface ForumPost {
  id: string;
  studentId: string;
  studentName: string;
  indexNo: string;
  topic: 'Mechanics' | 'Waves & Vibrations' | 'Thermal Physics' | 'Fields' | 'Electricity & Magnetism' | 'Electronics' | 'Modern Physics' | 'General';
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

export interface PaymentSlip {
  id: string;
  studentId: string;
  studentName: string;
  indexNo: string;
  batch: Batch;
  classId: string;
  className: { en: string; si: string };
  month: string; // e.g. "2026-06"
  slipImageUrl: string;
  slipRef?: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  amountPaid: number;
  comments?: string;
  wantsPrintedMaterials?: boolean;
  postalAddress?: string;
}

export interface Announcement {
  id: string;
  title: { en: string; si: string };
  content: { en: string; si: string };
  date: string;
  isPinned: boolean;
  category: 'general' | 'exam' | 'holiday' | 'seminar';
}

export interface HomeSectionsVisibility {
  id: string;
  hero: boolean;
  classes: boolean;
  timeline: boolean;
  announcements: boolean;
  contact: boolean;
}

export interface Milestone {
  phase: string;
  titleEn: string;
  titleSi: string;
  months: string;
  topics: string;
}

export interface CenterLocation {
  name: string;
  address: string;
}

export interface HomeContentSettings {
  id: string;
  heroTitleEn: string;
  heroTitleSi: string;
  heroSubtitleEn: string;
  heroSubtitleSi: string;
  heroVideoUrl: string;
  milestones: Milestone[];
  helplinePhone: string;
  helplineWhatsapp: string;
  helplineHours: string;
  centers: CenterLocation[];
  bankProtocolEn: string;
  bankProtocolSi: string;
  showPolicies?: boolean;
  heroWelcomeTitleEn?: string;
  heroWelcomeTitleSi?: string;
  heroTaglineEn?: string;
  heroTaglineSi?: string;
}

export interface ChatMessage {
  id: string;
  studentId: string;
  studentName: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  createdAt: string; // ISO String
}

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  batch: Batch;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AssignmentMCQ {
  id: string;
  questionNumber: number; // 1 to 20 or 30
  question: string;
  options: [string, string, string, string]; // Exactly 4 options: A, B, C, D
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  topic: string;
  batch: Batch;
  description: string;
  totalQuestions: number; // 20 or 30 MCQs
  durationHours: number; // 24 hours (1 day submission deadline)
  durationDays?: number; // 1 day submission duration
  deadline: string; // ISO date string (submission deadline: within 1 day)
  visibleUntil?: string; // ISO date string (visible for 1 month / 30 days)
  mcqQuestions: AssignmentMCQ[];
  markingScheme: Record<number, number>; // 1-indexed question number -> 0..3 option index (well distributed A, B, C, D)
  markingSchemeImageUrl?: string; // Admin uploaded marking scheme image
  markingSchemeNotes?: string;
  createdAt: string;
  createdBy: string;
  isPublished: boolean;
  provider?: 'Gemini' | 'Ollama' | 'Standard Syllabus';
}

export type QuestionEvaluationStatus = 'correct' | 'wrong' | 'unanswered' | 'unclear';

export interface AssignmentQuestionResult {
  questionNumber: number; // 1 to 20 or 30
  detectedAnswer: number | null; // 0..3 index (0=A, 1=B, 2=C, 3=D) or null
  detectedAnswerLabel: string; // "A", "B", "C", "D", "Unanswered", "Unclear"
  correctAnswer: number; // 0..3 index
  correctAnswerLabel: string; // "A", "B", "C", "D"
  status: QuestionEvaluationStatus;
  isCorrect: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

export interface AssignmentResultCalculation {
  maximumPossibleMarks: number;
  totalMarksObtained: number;
  percentage: number;
  totalQuestions?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  unansweredQuestions?: number;
  unclearQuestions?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentIndexNo: string;
  batch: Batch;
  answerSheetImageUrl: string; // Completed physical answer sheet photo
  submittedAt: string;
  evaluatedAt: string;
  score: number; // Total marks obtained
  totalMarks: number; // Maximum possible marks (20 or 30)
  percentage: number; // Percentage
  calculation: AssignmentResultCalculation; // Complete 8-metric result calculation
  questionResults: AssignmentQuestionResult[];
  aiFeedback?: string;
  status: 'submitted' | 'graded';
}

