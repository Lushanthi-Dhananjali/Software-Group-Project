import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  User, 
  PhysicsClass, 
  Recording, 
  StudyMaterial, 
  MCQExam, 
  ForumPost, 
  PaymentSlip, 
  Announcement,
  ExamAttempt,
  HomeSectionsVisibility,
  HomeContentSettings,
  ChatMessage,
  StudentFeedback
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_RECORDINGS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_EXAMS,
  INITIAL_FORUMS,
  INITIAL_SLIPS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CHATS,
  INITIAL_FEEDBACKS
} from '../data/mockData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (used for client-side Google Login)
export const auth = getAuth(app);

// Sign in with Google Popup helper
export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error with Google Sign-In Popup:", error);
    throw error;
  }
}

// -------------------------------------------------------------
// BACKEND API CLIENT INTEGRATION (Replaces Firestore with MySQL)
// -------------------------------------------------------------

async function saveToServer(table: string, id: string, data: any) {
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Error saving to table ${table} on backend:`, err);
  }
}

async function deleteFromServer(table: string, id: string) {
  try {
    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Error deleting from table ${table} on backend:`, err);
  }
}

// Fetch all LMS collections at once
export async function fetchLMSData() {
  try {
    const res = await fetch('/api/lms-data');
    if (!res.ok) {
      throw new Error('Failed to load LMS data from backend API');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Warning: Could not load data from backend. Falling back to local offline structure:", error);
    return {
      users: INITIAL_USERS,
      classes: INITIAL_CLASSES,
      recordings: INITIAL_RECORDINGS,
      materials: INITIAL_STUDY_MATERIALS,
      exams: INITIAL_EXAMS,
      forums: INITIAL_FORUMS,
      slips: INITIAL_SLIPS,
      announcements: INITIAL_ANNOUNCEMENTS,
      chats: INITIAL_CHATS,
      feedbacks: INITIAL_FEEDBACKS
    };
  }
}

// Fetch database status
export async function fetchDbStatus() {
  try {
    const res = await fetch('/api/db-status');
    if (!res.ok) {
      throw new Error('Failed to fetch db status');
    }
    return await res.json();
  } catch (error) {
    return {
      connected: false,
      provider: 'Local File JSON Fallback (Offline)',
      databaseName: 'physics_lms-353036310fd3',
      host: null
    };
  }
}

// -------------------------------------------------------------
// USER MUTATIONS
// -------------------------------------------------------------

export async function saveUser(user: User) {
  await saveToServer('users', user.id, user);
}

export async function deleteUser(userId: string) {
  await deleteFromServer('users', userId);
}

// -------------------------------------------------------------
// CLASS PATHWAY MUTATIONS
// -------------------------------------------------------------

export async function saveClass(physicsClass: PhysicsClass) {
  await saveToServer('classes', physicsClass.id, physicsClass);
}

export async function deleteClass(classId: string) {
  await deleteFromServer('classes', classId);
}

// -------------------------------------------------------------
// STUDY MATERIAL MUTATIONS
// -------------------------------------------------------------

export async function saveMaterial(material: StudyMaterial) {
  await saveToServer('materials', material.id, material);
}

export async function deleteMaterial(materialId: string) {
  await deleteFromServer('materials', materialId);
}

// -------------------------------------------------------------
// RECORDING MUTATIONS
// -------------------------------------------------------------

export async function saveRecording(recording: Recording) {
  await saveToServer('recordings', recording.id, recording);
}

// -------------------------------------------------------------
// EXAM MUTATIONS
// -------------------------------------------------------------

export async function saveExam(exam: MCQExam) {
  await saveToServer('exams', exam.id, exam);
}

// -------------------------------------------------------------
// FORUM MUTATIONS
// -------------------------------------------------------------

export async function saveForum(post: ForumPost) {
  await saveToServer('forums', post.id, post);
}

// -------------------------------------------------------------
// PAYMENT SLIP MUTATIONS
// -------------------------------------------------------------

export async function saveSlip(slip: PaymentSlip) {
  await saveToServer('slips', slip.id, slip);
}

// -------------------------------------------------------------
// CHAT MUTATIONS
// -------------------------------------------------------------

export async function saveChatMessage(msg: ChatMessage) {
  await saveToServer('chats', msg.id, msg);
}

// -------------------------------------------------------------
// ANNOUNCEMENT MUTATIONS
// -------------------------------------------------------------

export async function saveAnnouncement(notice: Announcement) {
  await saveToServer('announcements', notice.id, notice);
}

export async function deleteAnnouncement(noticeId: string) {
  await deleteFromServer('announcements', noticeId);
}

// -------------------------------------------------------------
// EXAM ATTEMPT MUTATIONS & FETCHERS
// -------------------------------------------------------------

export async function saveExamAttempt(attempt: ExamAttempt) {
  await saveToServer('attempts', attempt.id, attempt);
}

export async function fetchExamAttempts(studentId: string): Promise<ExamAttempt[]> {
  try {
    const res = await fetch(`/api/attempts/${studentId}`);
    if (!res.ok) {
      throw new Error('Failed to load exam attempts from API');
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching exam attempts:', err);
    return [];
  }
}

// -------------------------------------------------------------
// SETTINGS MUTATIONS & FETCHERS
// -------------------------------------------------------------

export async function saveHomeSectionsVisibility(visibility: HomeSectionsVisibility) {
  await saveToServer('settings', 'home_sections', visibility);
}

export async function fetchHomeSectionsVisibility(): Promise<HomeSectionsVisibility> {
  const fallback: HomeSectionsVisibility = {
    id: "home_sections",
    hero: true,
    classes: true,
    timeline: true,
    announcements: true,
    contact: true
  };
  try {
    const res = await fetch('/api/lms-data');
    if (res.ok) {
      const data = await res.json();
      const settings = data.settings || [];
      const found = settings.find((s: any) => s.id === 'home_sections');
      if (found) {
        return found;
      }
    }
  } catch (err) {
    console.warn('Could not fetch home sections visibility from API, using default', err);
  }
  return fallback;
}

export async function saveHomeContentSettings(content: HomeContentSettings) {
  await saveToServer('settings', 'home_content', content);
}

export async function fetchHomeContentSettings(): Promise<HomeContentSettings> {
  const fallback: HomeContentSettings = {
    id: "home_content",
    heroTitleEn: "Master A/L Physics with Precision",
    heroTitleSi: "නිරවද්‍යතාවයෙන් භෞතික විද්‍යාව ජය ගන්න",
    heroSubtitleEn: "Sri Lanka's premium educational portal led by expert pedagogy, offering theory modules, revision clinics, and live paper grading.",
    heroSubtitleSi: "සිද්ධාන්ත, පුනරීක්ෂණ සහ ප්‍රශ්න පත්‍ර පන්ති සජීවීව මෙහෙයවන ශ්‍රී ලංකාවේ ප්‍රමුඛතම භෞතික විද්‍යා අධ්‍යාපන පද්ධතිය.",
    heroVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    milestones: [
      { phase: "Phase 01", titleEn: "Classical Newtonian Mechanics", titleSi: "යාන්ත්‍ර විද්‍යාව මූලික සිද්ධාන්ත", months: "June - Sept", topics: "Vectors, Circular Motion, Friction Equilibrium, Energy laws" },
      { phase: "Phase 02", titleEn: "Oscillations & Waves Resonance", titleSi: "තරංග සහ කම්පන විශ්ලේෂණය", months: "Oct - Dec", topics: "Acoustic physics, Doppler effect, Resonance columns, Light reflection" },
      { phase: "Phase 03", titleEn: "Thermal & Fields Dynamics", titleSi: "තාපය සහ ක්ෂේත්‍ර නියම", months: "Jan - April", topics: "Kinetic theory, Gas laws, Electrostatics, Gravitational grids" },
      { phase: "Phase 04", titleEn: "Electronics & Revision Masterclass", titleSi: "ඉලෙක්ට්‍රොනික විද්‍යාව සහ ප්‍රශ්න පත්‍ර", months: "May - August", topics: "Logic gates, Transistors, OP-AMPS, Past 20 A/L Paper Clinics" }
    ],
    helplinePhone: "+94 11 259 8810",
    helplineWhatsapp: "+94 77 123 4567",
    helplineHours: "Every Day: 8:00 AM - 8:00 PM",
    centers: [
      { name: "Colombo Physical Auditorium", address: "Nugegoda Hall complex, Sri Lanka" },
      { name: "Gampaha Main Lecture Theater", address: "Yakkala Road physical branch" }
    ],
    bankProtocolEn: "Students depositing fees via direct physical bank cash deposits should take a clear unblurred photo of the stamped slip, register an account, and upload it inside their Payment panel to unlock.",
    bankProtocolSi: "සෘජුවම බැංකු තැන්පතු මඟින් ගාස්තු ගෙවන සිසුන්, එම පැහැදිලි තැන්පතු පත්‍රිකාව ඡායාරූපගත කර, ගිණුමක් සාදා, පන්ති සක්‍රීය කර ගැනීමට ඔවුන්ගේ ගෙවීම් අංශය (Payment panel) තුලින් ඉදිරිපත් කළ යුතුය.",
    heroWelcomeTitleEn: "Dr. Aritha Perera",
    heroWelcomeTitleSi: "ආචාර්ය අරිත පෙරේරා",
    heroTaglineEn: "A visionary educator inspiring students to master academic concepts with deep scientific thinking",
    heroTaglineSi: "ගැඹුරු විද්‍යාත්මක චින්තනයෙන් යුතුව විශිෂ්ටතම ප්‍රතිඵල කරා සිසුන් මෙහෙයවන ප්‍රමුඛතම දේශකයා"
  };
  try {
    const res = await fetch('/api/lms-data');
    if (res.ok) {
      const data = await res.json();
      const settings = data.settings || [];
      const found = settings.find((s: any) => s.id === 'home_content');
      if (found) {
        return found;
      }
    }
  } catch (err) {
    console.warn('Could not fetch home content settings from API, using default', err);
  }
  return fallback;
}

// -------------------------------------------------------------
// STUDENT FEEDBACK MUTATIONS
// -------------------------------------------------------------

export async function saveFeedback(feedback: StudentFeedback) {
  await saveToServer('feedbacks', feedback.id, feedback);
}

export async function deleteFeedback(feedbackId: string) {
  await deleteFromServer('feedbacks', feedbackId);
}
