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

