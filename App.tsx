import React, { useState, useEffect } from 'react';
import {
  getLMSData,
  saveLMSData,
  TRANSLATIONS,
  INITIAL_CLASSES,
  INITIAL_ANNOUNCEMENTS
} from './data/mockData';
import {
  fetchLMSData,
  saveUser,
  deleteUser,
  saveClass,
  deleteClass,
  deleteMaterial,
  saveRecording,
  saveMaterial,
  saveExam,
  saveForum,
  saveSlip,
  saveAnnouncement,
  deleteAnnouncement,
  saveExamAttempt,
  fetchExamAttempts,
  signInWithGooglePopup,
  saveHomeSectionsVisibility,
  fetchHomeSectionsVisibility,
  fetchHomeContentSettings,
  saveHomeContentSettings,
  saveChatMessage,
  saveFeedback,
  deleteFeedback,
  fetchDbStatus
} from './lib/firebase';
import {
  User,
  PhysicsClass,
  Recording,
  StudyMaterial,
  MCQExam,
  ForumPost,
  PaymentSlip,
  Announcement,
  Language,
  VerificationStatus,
  Role,
  Batch,
  ForumReply,
  ExamAttempt,
  HomeSectionsVisibility,
  HomeContentSettings,
  Milestone,
  ChatMessage,
  StudentFeedback
} from './types';

// Importing child components
import StudentDigitalID from './components/StudentDigitalID';
import LivePlayer, { RestrictedVideoPlayer } from './components/LivePlayer';
import MCQExamView from './components/MCQExamView';
import CommunityForum from './components/CommunityForum';
import PaymentCenter from './components/PaymentCenter';
import AdminSlipVerification from './components/AdminSlipVerification';
import AdminUserManagement from './components/AdminUserManagement';
import AdminContentPublisher from './components/AdminContentPublisher';
import AdminHomepageEditor from './components/AdminHomepageEditor';
import SupportChat from './components/SupportChat';
import AdminClassesStudents from './components/AdminClassesStudents';

// Icons
import {
  GraduationCap,
  Globe,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  MapPin,
  CreditCard,
  Users,
  Video,
  MessageSquare,
  Calendar,
  ShieldAlert,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Bell,
  Settings,
  Plus,
  Trash,
  Play,
  Eye,
  Info,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  QrCode,
  RefreshCw,
  Terminal,
  Upload,
  FileText,
  File,
  Lock,
  Youtube,
  Send,
  User as UserIcon
} from 'lucide-react';

interface PasswordResetCardProps {
  user: User;
  db: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
}

function PasswordResetCard({ user, db, setDb }: PasswordResetCardProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match!');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    // Update user's password in the users array
    const updatedUsers = db.users.map((u: User) => {
      if (u.id === user.id) {
        return { ...u, password: newPassword.trim() };
      }
      return u;
    });

    setDb((prev: any) => ({
      ...prev,
      users: updatedUsers
    }));

    setSuccess('Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <Lock className="h-5 w-5 text-amber-500" />
        <h3 className="font-display font-bold text-white text-base">Password Reset Section</h3>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs font-semibold text-emerald-400">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs font-semibold text-red-400">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter brand new password"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Retype brand new password"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-md active:scale-95"
        >
          Update Account Password
        </button>
      </form>
    </div>
  );
}

export default function App() {
  // 1. Core LMS Database States
  const [db, setDb] = useState(() => getLMSData());
  const [dbLoading, setDbLoading] = useState(true);
  const [pastAttemptsState, setPastAttemptsState] = useState<ExamAttempt[]>([]);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    provider: 'Checking...',
    databaseName: 'physics_lms-353036310fd3',
    host: null as string | null
  });

  // 2. Client Preferences & Router
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('ap_lang');
      if (savedLang === 'en' || savedLang === 'si') return savedLang;
    } catch {}
    return 'si';
  });
  const [currentScreen, setCurrentScreen] = useState<'home' | 'auth' | 'student' | 'admin'>(() => {
    try {
      const savedScreen = localStorage.getItem('ap_current_screen');
      if (savedScreen && ['home', 'auth', 'student', 'admin'].includes(savedScreen)) {
        return savedScreen as any;
      }
    } catch {}
    return 'home';
  });
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('ap_logged_in_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Active Tab Routers
  const [studentTab, setStudentTab] = useState<'profile' | 'dashboard' | 'classes' | 'lms' | 'exams' | 'forum' | 'payment' | 'messages'>(() => {
    try {
      const savedTab = localStorage.getItem('ap_student_tab');
      if (savedTab) return savedTab as any;
    } catch {}
    return 'profile';
  });
  const [profileSubTab, setProfileSubTab] = useState<'dashboard' | 'lms' | 'payment' | 'profile_info' | 'feedback'>(() => {
    try {
      const savedTab = localStorage.getItem('ap_profile_sub_tab');
      if (savedTab) return savedTab as any;
    } catch {}
    return 'dashboard';
  });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'slips' | 'users' | 'publisher' | 'settings' | 'homepage' | 'messages' | 'superadmin' | 'classes-students' | 'feedback_approval'>(() => {
    try {
      const savedTab = localStorage.getItem('ap_admin_tab');
      if (savedTab) return savedTab as any;
    } catch {}
    return 'dashboard';
  });

  // Class section filters
  const [classFilterBatch, setClassFilterBatch] = useState<string>('All');
  const [classFilterType, setClassFilterType] = useState<string>('All');
  const [classFilterMonth, setClassFilterMonth] = useState<string>('All');

  // Track currently playing video in student dashboard
  const [activeDashboardVideo, setActiveDashboardVideo] = useState<{ classId: string; videoUrl: string; title: string } | null>(null);

  // Track currently playing video in student classes library tab
  const [activeClassesVideo, setActiveClassesVideo] = useState<{ classId: string; videoUrl: string; title: string } | null>(null);

  // Multi-Class / Bulk Payment States for classes section
  const [classesSelectedForPayment, setClassesSelectedForPayment] = useState<string[]>([]);
  const [bulkPaymentMethod, setBulkPaymentMethod] = useState<'slip' | 'card'>('slip');
  const [bulkPaymentSlipUrl, setBulkPaymentSlipUrl] = useState<string>('');
  const [bulkPaymentSlipRef, setBulkPaymentSlipRef] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState<boolean>(false);
  const [wantsPrintedMaterials, setWantsPrintedMaterials] = useState<boolean>(false);
  const [studentPostalAddress, setStudentPostalAddress] = useState<string>('');
  const [isStudentDragOver, setIsStudentDragOver] = useState<boolean>(false);
  const [isBulkPaying, setIsBulkPaying] = useState<boolean>(false);
  const [bulkPaymentSuccess, setBulkPaymentSuccess] = useState<string>('');

  // Visitor selected class pathway on homepage
  const [selectedHomeClass, setSelectedHomeClass] = useState<PhysicsClass>(INITIAL_CLASSES[0]);

  // Synchronize selected home class if classes load or change
  useEffect(() => {
    const activeClasses = db.classes.filter(c => !c.isHidden);
    if (activeClasses.length > 0) {
      const pathwaysMonth = activeClasses[0]?.month || 'June';
      const filteredPathways = activeClasses.filter(c => c.month === pathwaysMonth);
      const listToCheck = filteredPathways.length > 0 ? filteredPathways : activeClasses;
      if (!listToCheck.some(c => c.id === selectedHomeClass?.id)) {
        setSelectedHomeClass(listToCheck[0]);
      }
    }
  }, [db.classes, selectedHomeClass]);

  // Auth fields
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMobile, setAuthMobile] = useState('');
  const [authWhatsapp, setAuthWhatsapp] = useState('');
  const [authSchool, setAuthSchool] = useState('');
  const [authGender, setAuthGender] = useState('Male');
  const [authDistrict, setAuthDistrict] = useState('Colombo');
  const [authAddress, setAuthAddress] = useState('');
  const [authBatch, setAuthBatch] = useState<Batch>('2027');

  // Home Sections Visibility configuration state
  const [homeSections, setHomeSections] = useState<HomeSectionsVisibility>({
    id: "home_sections",
    hero: true,
    classes: true,
    timeline: true,
    announcements: true,
    contact: true
  });

  // Home dynamic content settings state
  const [homeContent, setHomeContent] = useState<HomeContentSettings | null>(null);

  const handleToggleHomeSection = async (section: keyof Omit<HomeSectionsVisibility, 'id'>) => {
    const updated = {
      ...homeSections,
      [section]: !homeSections[section]
    };
    setHomeSections(updated);
    await saveHomeSectionsVisibility(updated);
  };

  // New announcement form fields (Admin Settings)
  const [newNoticeTitleEn, setNewNoticeTitleEn] = useState('');
  const [newNoticeTitleSi, setNewNoticeTitleSi] = useState('');
  const [newNoticeContentEn, setNewNoticeContentEn] = useState('');
  const [newNoticeContentSi, setNewNoticeContentSi] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'general' | 'exam' | 'holiday' | 'seminar'>('general');

  // Student Feedback Form states
  const [newFeedbackComment, setNewFeedbackComment] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refund policy drawer state
  const [refundPolicyOpen, setRefundPolicyOpen] = useState(false);

  // Privacy policy drawer state
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  // Terms and conditions drawer state
  const [termsAndConditionsOpen, setTermsAndConditionsOpen] = useState(false);

  // Fetch database from Firestore on load and keep synchronized
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await fetchLMSData();
        const visibility = await fetchHomeSectionsVisibility();
        const content = await fetchHomeContentSettings();
        const status = await fetchDbStatus();
        if (isMounted) {
          setDb(data);
          setHomeSections(visibility);
          setHomeContent(content);
          setDbStatus(status);
          setDbLoading(false);
        }
      } catch (err) {
        console.warn("Warning: Could not load initial database from Firestore (using local fallback):", err);
        try {
          const status = await fetchDbStatus();
          if (isMounted) {
            setDbStatus(status);
          }
        } catch (statusErr) {}
        if (isMounted) {
          setDbLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time synchronization of state from Firestore (polls every 5 seconds when logged in)
  useEffect(() => {
    let isMounted = true;
    let intervalId: any;

    const syncData = async () => {
      try {
        const data = await fetchLMSData();
        if (isMounted) {
          setDb(data);
          if (loggedInUser) {
            const freshUser = data.users.find(u => u.id === loggedInUser.id);
            if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(loggedInUser)) {
              setLoggedInUser(freshUser);
            }
          }
        }
      } catch (err) {
        console.warn("Warning: Could not sync background database from Firestore:", err);
      }
    };

    if (loggedInUser) {
      intervalId = setInterval(syncData, 5000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [loggedInUser]);

  // Fetch logged-in student exam attempts
  useEffect(() => {
    if (loggedInUser) {
      fetchExamAttempts(loggedInUser.id).then(attempts => {
        setPastAttemptsState(attempts);
      });
    } else {
      setPastAttemptsState([]);
    }
  }, [loggedInUser]);

  // Auto save to localStorage when database state updates
  useEffect(() => {
    if (dbLoading) return;
    saveLMSData('ap_users', db.users);
    saveLMSData('ap_classes', db.classes);
    saveLMSData('ap_recordings', db.recordings);
    saveLMSData('ap_materials', db.materials);
    saveLMSData('ap_exams', db.exams);
    saveLMSData('ap_forums', db.forums);
    saveLMSData('ap_slips', db.slips);
    saveLMSData('ap_announcements', db.announcements);
    if (db.feedbacks) {
      saveLMSData('ap_feedbacks', db.feedbacks);
    }
  }, [db, dbLoading]);

  // Sync loggedInUser, currentScreen, lang, and active tab states to localStorage
  useEffect(() => {
    try {
      if (loggedInUser) {
        localStorage.setItem('ap_logged_in_user', JSON.stringify(loggedInUser));
      } else {
        localStorage.removeItem('ap_logged_in_user');
      }
    } catch (e) {
      console.warn("Failed to save loggedInUser to localStorage:", e);
    }
  }, [loggedInUser]);

  useEffect(() => {
    try {
      localStorage.setItem('ap_current_screen', currentScreen);
    } catch (e) {
      console.warn("Failed to save currentScreen to localStorage:", e);
    }
  }, [currentScreen]);

  useEffect(() => {
    try {
      localStorage.setItem('ap_lang', lang);
    } catch (e) {
      console.warn("Failed to save lang to localStorage:", e);
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('ap_admin_tab', adminTab);
    } catch (e) {
      console.warn("Failed to save adminTab to localStorage:", e);
    }
  }, [adminTab]);

  useEffect(() => {
    try {
      localStorage.setItem('ap_student_tab', studentTab);
    } catch (e) {
      console.warn("Failed to save studentTab to localStorage:", e);
    }
  }, [studentTab]);

  useEffect(() => {
    try {
      localStorage.setItem('ap_profile_sub_tab', profileSubTab);
    } catch (e) {
      console.warn("Failed to save profileSubTab to localStorage:", e);
    }
  }, [profileSubTab]);

  // Translation helper
  const t = TRANSLATIONS[lang];

  // Language Toggle Handler
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'si' : 'en';
    setLang(nextLang);
  };

  // Student Feedback Publisher Handler
  const handlePublishFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!newFeedbackComment.trim()) {
      setFeedbackMsg({ text: t.feedbackEmptyError, type: 'error' });
      return;
    }

    if (!loggedInUser) return;

    const newFeedback: StudentFeedback = {
      id: `feedback-${Date.now()}`,
      studentId: loggedInUser.id,
      studentName: loggedInUser.name,
      batch: loggedInUser.batch,
      comment: newFeedbackComment.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedFeedbacks = [newFeedback, ...(db.feedbacks || [])];
    const updatedDb = {
      ...db,
      feedbacks: updatedFeedbacks
    };

    setDb(updatedDb);
    setNewFeedbackComment('');
    setFeedbackMsg({ text: t.feedbackSuccess, type: 'success' });

    try {
      await saveFeedback(newFeedback);
    } catch (err) {
      console.error("Failed to persist feedback in Firestore:", err);
    }
  };

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      alert("Please fill in both Email and Password fields.");
      return;
    }

    const user = db.users.find(u => u.email.toLowerCase() === authEmail.trim().toLowerCase());
    if (!user) {
      alert("No account registered with this email address. Please register above!");
      return;
    }

    // Verify password if set on the account
    if (user.password && user.password !== authPassword.trim()) {
      alert("Incorrect password. Please try again!");
      return;
    }

    // Role-based routing
    setLoggedInUser(user);
    if (user.role === 'admin' || user.role === 'super-admin' || user.role === 'editor' || user.role === 'instructor') {
      setCurrentScreen('admin');
      setAdminTab('dashboard');
    } else {
      setCurrentScreen('home');
      setStudentTab('dashboard');
    }

    // Clean inputs
    setAuthEmail('');
    setAuthPassword('');
  };

  // Registration Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !authName.trim() ||
      !authEmail.trim() ||
      !authMobile.trim() ||
      !authWhatsapp.trim() ||
      !authSchool.trim() ||
      !authGender ||
      !authDistrict ||
      !authAddress.trim() ||
      !authPassword.trim()
    ) {
      alert("All fields are mandatory to complete registration (සියලුම තොරතුරු අනිවාර්ය වේ).");
      return;
    }

    const exists = db.users.some(u => u.email.toLowerCase() === authEmail.trim().toLowerCase());
    if (exists) {
      alert("An account already exists with this email address. Please login!");
      return;
    }

    // Auto-generate credentials
    const nextSeq = db.users.filter(u => u.batch === authBatch).length + 1003;
    const generatedIndex = `AP-${authBatch}-${nextSeq}`;
    const generatedBarcode = `${authBatch}${nextSeq}${Math.floor(Math.random() * 10)}`;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: authName.trim(),
      email: authEmail.trim(),
      mobile: authMobile.trim(),
      whatsapp: authWhatsapp.trim(),
      school: authSchool.trim(),
      gender: authGender,
      district: authDistrict,
      address: authAddress.trim(),
      batch: authBatch,
      role: 'student',
      indexNo: generatedIndex,
      barcode: generatedBarcode,
      status: 'pending', // Pending verification
      createdAt: new Date().toISOString(),
      password: authPassword.trim()
    };

    setDb(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    saveUser(newUser);

    setLoggedInUser(newUser);
    setCurrentScreen('home');
    setStudentTab('dashboard');

    // Clean inputs
    setAuthName('');
    setAuthEmail('');
    setAuthMobile('');
    setAuthWhatsapp('');
    setAuthSchool('');
    setAuthGender('Male');
    setAuthDistrict('Colombo');
    setAuthBatch('2027');
    setAuthAddress('');
    setAuthPassword('');
  };

  // Google Authentication Handler
  const handleGoogleSignIn = async () => {
    try {
      const firebaseUser = await signInWithGooglePopup();
      if (!firebaseUser || !firebaseUser.email) {
        alert("Google sign-in did not return email profile details.");
        return;
      }

      // Search if user already exists
      const existingUser = db.users.find(u => u.email.toLowerCase() === firebaseUser.email!.toLowerCase());

      if (existingUser) {
        setLoggedInUser(existingUser);
        if (existingUser.role === 'admin' || existingUser.role === 'super-admin' || existingUser.role === 'editor' || existingUser.role === 'instructor') {
          setCurrentScreen('admin');
          setAdminTab('dashboard');
        } else {
          setCurrentScreen('home');
          setStudentTab('dashboard');
        }
      } else {
        // Automatically register as a student
        const defaultBatch: Batch = '2027';
        const nextSeq = db.users.filter(u => u.batch === defaultBatch).length + 1003;
        const generatedIndex = `AP-${defaultBatch}-${nextSeq}`;
        const generatedBarcode = `${defaultBatch}${nextSeq}${Math.floor(Math.random() * 10)}`;

        const newUser: User = {
          id: `google-${firebaseUser.uid}`,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          mobile: firebaseUser.phoneNumber || '',
          batch: defaultBatch,
          role: 'student',
          indexNo: generatedIndex,
          barcode: generatedBarcode,
          status: 'active', // Google users are authenticated, grant instant access
          createdAt: new Date().toISOString()
        };

        setDb(prev => ({
          ...prev,
          users: [...prev.users, newUser]
        }));
        await saveUser(newUser);

        setLoggedInUser(newUser);
        setCurrentScreen('home');
        setStudentTab('dashboard');
      }
    } catch (error) {
      console.error("Google sign-in handler failed:", error);
      if (error instanceof Error && !error.message.includes('auth/popup-closed-by-user')) {
        alert(`Google authentication failed: ${error.message}`);
      }
    }
  };

  // Sign out
  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentScreen('home');
  };

  // Update payment status (Admin action)
  const handleVerifySlip = (slipId: string, status: 'approved' | 'rejected', comments?: string) => {
    // 1. Save to Firestore
    const slip = db.slips.find(s => s.id === slipId);
    if (slip) {
      const updatedSlip = { ...slip, status, comments };
      saveSlip(updatedSlip);

      const studentUser = db.users.find(u => u.id === slip.studentId);
      if (studentUser) {
        const updatedUser = {
          ...studentUser,
          status: status === 'approved' ? 'active' : 'rejected',
          rejectionReason: status === 'rejected' ? comments : undefined
        } as User;
        saveUser(updatedUser);
      }
    }

    setDb(prev => {
      // 1. Update slip status
      const updatedSlips = prev.slips.map(s => {
        if (s.id === slipId) {
          return { ...s, status, comments };
        }
        return s;
      });

      // Find the slip to update student's global verification state if needed
      const slipObj = prev.slips.find(s => s.id === slipId);
      let updatedUsers = prev.users;
      if (slipObj) {
        updatedUsers = prev.users.map(u => {
          if (u.id === slipObj.studentId) {
            return {
              ...u,
              status: status === 'approved' ? 'active' : 'rejected',
              rejectionReason: status === 'rejected' ? comments : undefined
            } as User;
          }
          return u;
        });
      }

      return {
        ...prev,
        slips: updatedSlips,
        users: updatedUsers
      };
    });
  };

  // Student upload a bank slip payment receipt
  const handleStudentUploadSlip = (slipData: { 
    classId: string; 
    month: string; 
    amountPaid: number; 
    slipImageUrl: string;
    wantsPrintedMaterials?: boolean;
    postalAddress?: string;
    isOnlinePayment?: boolean;
    slipId?: string;
  }) => {
    if (!loggedInUser) return;

    const targetClass = db.classes.find(c => c.id === slipData.classId);
    const isOnline = !!slipData.isOnlinePayment;
    const newSlip: PaymentSlip = {
      id: slipData.slipId || `slip-${Date.now()}`,
      studentId: loggedInUser.id,
      studentName: loggedInUser.name,
      indexNo: loggedInUser.indexNo,
      batch: loggedInUser.batch,
      classId: slipData.classId,
      className: targetClass ? targetClass.name : { en: "Physics Pathway Class", si: "භෞතික විද්‍යා පන්තිය" },
      month: slipData.month,
      slipImageUrl: slipData.slipImageUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: isOnline ? 'approved' : 'pending',
      amountPaid: slipData.amountPaid,
      wantsPrintedMaterials: slipData.wantsPrintedMaterials,
      postalAddress: slipData.postalAddress,
      slipRef: isOnline ? `PAYHERE-${slipData.slipId}` : undefined,
      comments: isOnline ? "Instantly approved via secure online PayHere gateway checkout." : undefined
    };

    setDb(prev => ({
      ...prev,
      slips: [newSlip, ...prev.slips.filter(s => s.id !== newSlip.id)]
    }));
    saveSlip(newSlip);

    // Save postal address to student profile and mark active on successful online payment
    if (isOnline || (slipData.wantsPrintedMaterials && slipData.postalAddress)) {
      const updatedUser: User = { 
        ...loggedInUser, 
        status: isOnline ? 'active' : loggedInUser.status,
        address: slipData.wantsPrintedMaterials && slipData.postalAddress ? slipData.postalAddress : loggedInUser.address 
      };
      setLoggedInUser(updatedUser);
      saveUser(updatedUser);
      setDb(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === loggedInUser.id ? updatedUser : u)
      }));
    }
  };

  const handleStudentSlipDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsStudentDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleStudentSlipFile(e.dataTransfer.files[0]);
    }
  };

  const handleStudentSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleStudentSlipFile(e.target.files[0]);
    }
  };

  const handleStudentSlipFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid bank slip image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBulkPaymentSlipUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Student bulk upload slips for multiple selected classes
  const handleBulkPaymentSubmit = () => {
    if (classesSelectedForPayment.length === 0) return;
    if (bulkPaymentMethod === 'slip' && !bulkPaymentSlipUrl.trim()) return;
    if (bulkPaymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim() || !cardName.trim())) {
      alert("Please fill in all card payment details.");
      return;
    }
    setIsBulkPaying(true);
    setBulkPaymentSuccess('');

    setTimeout(() => {
      classesSelectedForPayment.forEach((classId, index) => {
        const targetClass = db.classes.find(c => c.id === classId);
        if (targetClass) {
          const isCard = bulkPaymentMethod === 'card';
          const newSlip: PaymentSlip = {
            id: `slip-${Date.now()}-${index}`,
            studentId: loggedInUser!.id,
            studentName: loggedInUser!.name,
            indexNo: loggedInUser!.indexNo,
            batch: loggedInUser!.batch,
            classId: classId,
            className: targetClass.name,
            month: "June 2026",
            slipImageUrl: isCard ? "CARD" : bulkPaymentSlipUrl,
            slipRef: isCard ? `CARD-PAY-${cardNumber.slice(-4)}-${Date.now().toString().slice(-6)}` : (bulkPaymentSlipRef || undefined),
            uploadedAt: new Date().toISOString().split('T')[0],
            status: isCard ? 'approved' : 'pending',
            amountPaid: targetClass.fee + (index === 0 && wantsPrintedMaterials ? 200 : 0),
            wantsPrintedMaterials: wantsPrintedMaterials,
            postalAddress: wantsPrintedMaterials ? studentPostalAddress : undefined
          };

          setDb(prev => {
            // Check for existing pending/approved slips for same class/student/month to avoid duplicate rendering
            if (prev.slips.some(s => s.studentId === loggedInUser!.id && s.classId === classId && (s.status === 'pending' || s.status === 'approved'))) {
              return prev;
            }
            return {
              ...prev,
              slips: [newSlip, ...prev.slips]
            };
          });
          saveSlip(newSlip);
        }
      });

      setIsBulkPaying(false);

      if (loggedInUser) {
        const updatedUser: User = { 
          ...loggedInUser, 
          status: bulkPaymentMethod === 'card' ? 'active' : loggedInUser.status,
          address: wantsPrintedMaterials ? studentPostalAddress : (loggedInUser.address || undefined)
        };
        setLoggedInUser(updatedUser);
        saveUser(updatedUser);
        setDb(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === loggedInUser.id ? updatedUser : u)
        }));
      }

      if (bulkPaymentMethod === 'card') {
        setBulkPaymentSuccess("Card payment processed successfully! Your selected classes have been instantly activated.");
      } else {
        setBulkPaymentSuccess("Bank payment slip uploaded successfully for all selected classes! An administrator will verify them shortly.");
      }
      setClassesSelectedForPayment([]);
      setBulkPaymentSlipUrl('');
      setBulkPaymentSlipRef('');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
    }, 1500);
  };

  // Create MCQ Exam (Admin action)
  const handlePublishExam = (exam: Omit<MCQExam, 'id' | 'createdAt'>) => {
    const newExam: MCQExam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDb(prev => ({
      ...prev,
      exams: [newExam, ...prev.exams]
    }));
    saveExam(newExam);
  };

  // Create Class Track (Admin action)
  const handlePublishClass = (newClass: PhysicsClass, materialsList?: any[]) => {
    setDb(prev => {
      const newMaterials: StudyMaterial[] = (materialsList || []).map((m, idx) => ({
        id: m.id || `pdf-${Date.now()}-${idx}`,
        title: { en: m.titleEn, si: m.titleSi },
        moduleName: m.moduleName,
        batch: newClass.batch,
        classId: newClass.id,
        pdfUrl: m.pdfUrl,
        type: m.type || "Theory Note",
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadsCount: 0,
        isFree: m.isFree || false
      }));

      // Save each material to Firestore
      newMaterials.forEach(saveMaterial);

      return {
        ...prev,
        classes: [...prev.classes, newClass],
        materials: [...newMaterials, ...prev.materials]
      };
    });
    saveClass(newClass);
  };

  const handleDeleteClass = async (classId: string) => {
    setDb(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== classId)
    }));
    await deleteClass(classId);
  };

  const handleUpdateClass = async (updatedClass: PhysicsClass, materialsList?: any[]) => {
    setDb(prev => {
      const otherMaterials = prev.materials.filter(m => m.classId !== updatedClass.id);
      
      const newMaterials: StudyMaterial[] = (materialsList || []).map((m, idx) => {
        const existingMat = prev.materials.find(x => x.id === m.id);
        return {
          id: m.id || `pdf-${Date.now()}-${idx}`,
          title: { en: m.titleEn, si: m.titleSi },
          moduleName: m.moduleName,
          batch: updatedClass.batch,
          classId: updatedClass.id,
          pdfUrl: m.pdfUrl,
          type: m.type || "Theory Note",
          uploadedAt: existingMat ? existingMat.uploadedAt : new Date().toISOString().split('T')[0],
          downloadsCount: existingMat ? existingMat.downloadsCount : 0,
          isFree: m.isFree || false
        };
      });

      // Find deleted materials
      const oldClassMatIds = prev.materials.filter(m => m.classId === updatedClass.id).map(m => m.id);
      const newClassMatIds = newMaterials.map(m => m.id);
      const deletedIds = oldClassMatIds.filter(id => !newClassMatIds.includes(id));
      deletedIds.forEach(deleteMaterial);

      // Save/update to Firestore
      newMaterials.forEach(saveMaterial);

      return {
        ...prev,
        classes: prev.classes.map(c => c.id === updatedClass.id ? updatedClass : c),
        materials: [...newMaterials, ...otherMaterials]
      };
    });
    await saveClass(updatedClass);
  };

  // Publish Study Material PDF (Admin action)
  const handlePublishMaterial = (material: Omit<StudyMaterial, 'id' | 'uploadedAt' | 'downloadsCount'>) => {
    const newMaterial: StudyMaterial = {
      ...material,
      id: `pdf-${Date.now()}`,
      downloadsCount: 0,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setDb(prev => ({
      ...prev,
      materials: [newMaterial, ...prev.materials]
    }));
    saveMaterial(newMaterial);
  };

  // Save forum thread (Student/Admin action)
  const handleSavePost = (newPost: ForumPost) => {
    setDb(prev => ({
      ...prev,
      forums: [newPost, ...prev.forums]
    }));
    saveForum(newPost);
  };

  // Save reply to forum thread (Student/Admin action)
  const handleSaveReply = (postId: string, newReply: ForumReply) => {
    setDb(prev => {
      const updatedForums = prev.forums.map(post => {
        if (post.id === postId) {
          const updatedPost = {
            ...post,
            replies: [...post.replies, newReply]
          };
          saveForum(updatedPost);
          return updatedPost;
        }
        return post;
      });
      return {
        ...prev,
        forums: updatedForums
      };
    });
  };

  // MCQ Exam scorecard submission callback
  const handleSaveExamAttempt = async (attempt: ExamAttempt) => {
    await saveExamAttempt(attempt);
    setPastAttemptsState(prev => [...prev, attempt]);

    // We can save attempts inside a custom key in localStorage as backup
    try {
      const saved = localStorage.getItem('ap_attempts') || '[]';
      const parsed = JSON.parse(saved);
      parsed.push(attempt);
      localStorage.setItem('ap_attempts', JSON.stringify(parsed));
    } catch (e) {
      console.warn("Could not save attempt to localStorage backup:", e);
      try {
        localStorage.setItem('ap_attempts', JSON.stringify([attempt]));
      } catch (innerError) {
        console.warn("Could not save even a single attempt to localStorage:", innerError);
      }
    }
  };

  const getPastAttempts = () => {
    return pastAttemptsState;
  };

  // Create Announcement (Admin Settings)
  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitleEn.trim() || !newNoticeContentEn.trim()) {
      alert("Announcement must have English title and content completed.");
      return;
    }

    const newNotice: Announcement = {
      id: `notice-${Date.now()}`,
      title: { en: newNoticeTitleEn, si: newNoticeTitleSi || newNoticeTitleEn },
      content: { en: newNoticeContentEn, si: newNoticeContentSi || newNoticeContentEn },
      date: new Date().toISOString().split('T')[0],
      isPinned: false,
      category: newNoticeCategory
    };

    setDb(prev => ({
      ...prev,
      announcements: [newNotice, ...prev.announcements]
    }));
    saveAnnouncement(newNotice);

    alert("Notice Board Announcement published successfully!");
    setNewNoticeTitleEn('');
    setNewNoticeTitleSi('');
    setNewNoticeContentEn('');
    setNewNoticeContentSi('');
  };

  // Delete Announcement
  const handleDeleteNotice = (noticeId: string) => {
    setDb(prev => ({
      ...prev,
      announcements: prev.announcements.filter(n => n.id !== noticeId)
    }));
    deleteAnnouncement(noticeId);
  };

  // Admin user directory management functions
  const handleUpdateUserStatus = (userId: string, status: VerificationStatus) => {
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          const updated = { ...u, status };
          saveUser(updated);
          return updated;
        }
        return u;
      })
    }));
  };

  const handleUpdateManuallyEnrolledClasses = (userId: string, classIds: string[]) => {
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          const updated = { ...u, manuallyEnrolledClasses: classIds };
          saveUser(updated);
          // If the logged in user is the updated user, update local storage/state too
          if (loggedInUser && loggedInUser.id === userId) {
            setLoggedInUser(updated);
          }
          return updated;
        }
        return u;
      })
    }));
  };

  const handleUpdateUserRole = (userId: string, role: Role) => {
    const userToUpdate = db.users.find(u => u.id === userId);
    if (userToUpdate?.email === 'admin@channelaplus.com') {
      alert("Error: Role of the permanent Super Admin (admin@channelaplus.com) cannot be modified.");
      return;
    }
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          const updated = { ...u, role };
          saveUser(updated);
          return updated;
        }
        return u;
      })
    }));
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = db.users.find(u => u.id === userId);
    if (userToDelete?.email === 'admin@channelaplus.com') {
      alert("Error: The permanent Super Admin profile cannot be deleted.");
      return;
    }
    setDb(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
    deleteUser(userId);
  };

  const handleSendChatMessage = (studentId: string, text: string) => {
    if (!loggedInUser) return;
    
    // Find the student's name from db or fallback to current student
    const student = db.users.find(u => u.id === studentId);
    const studentName = student?.name || loggedInUser.name || 'Student';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      studentId,
      studentName,
      senderId: loggedInUser.id,
      senderName: loggedInUser.name,
      senderRole: loggedInUser.role,
      text,
      createdAt: new Date().toISOString()
    };

    setDb(prev => {
      const chats = prev.chats || [];
      const updatedChats = [...chats, newMsg];
      saveLMSData('ap_chats', updatedChats); // Sync to offline cache
      return {
        ...prev,
        chats: updatedChats
      };
    });

    saveChatMessage(newMsg); // Sync to Firestore
  };

  // Class locked checker based on approved monthly payments
  const isClassUnlocked = (classId: string) => {
    if (!loggedInUser) return false;
    // Admins always have access
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'super-admin') return true;
    
    // Check manual enrollment
    if (loggedInUser.manuallyEnrolledClasses?.includes(classId)) return true;
    const dbUser = db.users.find(u => u.id === loggedInUser.id);
    if (dbUser?.manuallyEnrolledClasses?.includes(classId)) return true;

    // Check if there is an approved payment slip for this classId
    return db.slips.some(s => s.studentId === loggedInUser.id && s.classId === classId && s.status === 'approved');
  };

  // Active student classes matching their registered batch (e.g. 2027 batch)
  const studentBatchClasses = db.classes.filter(c => c.batch === loggedInUser?.batch && !c.isHidden);

  const activeHomeContent: HomeContentSettings = homeContent || {
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
    showPolicies: true,
    heroWelcomeTitleEn: "Dr. Aritha Perera",
    heroWelcomeTitleSi: "ආචාර්ය අරිත පෙරේරා",
    heroTaglineEn: "A visionary educator inspiring students to master academic concepts with deep scientific thinking",
    heroTaglineSi: "ගැඹුරු විද්‍යාත්මක චින්තනයෙන් යුතුව විශිෂ්ටතම ප්‍රතිඵල කරා සිසුන් මෙහෙයවන ප්‍රමුඛතම දේශකයා"
  };

  if (dbLoading) {
    return (
      <div id="firestore-loading-screen" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="relative inline-flex mb-2">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 animate-pulse">
              <span className="font-display font-black text-slate-950 text-2xl">NG</span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-lg font-bold tracking-tight text-white font-display">NextGEN LMS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Synchronizing Secure Firestore...</p>
          </div>

          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
          </div>
          
          <div className="text-[10px] text-slate-600 font-mono">
            පන්ති පද්ධතිය සක්‍රිය වෙමින් පවතී...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* ----------------- GLOBAL HEADER / STICKY NAVIGATION ----------------- */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentScreen('home')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="font-display font-black text-slate-950 text-lg">A+</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-white text-base tracking-tight block">
                {t.appName}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono font-bold leading-none">
                Physics Institute
              </span>
            </div>
          </div>

          {/* Desktop Links (Conditional based on Visitor landing vs Portals) */}
          {currentScreen === 'home' && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {homeSections.hero && <a href="#hero" className="hover:text-amber-400 transition-colors">{t.home}</a>}
              {homeSections.classes && <a href="#pathways" className="hover:text-amber-400 transition-colors">{t.classes}</a>}
              {homeSections.timeline && <a href="#milestones" className="hover:text-amber-400 transition-colors">{t.timeline}</a>}
              {homeSections.announcements && <a href="#announcements" className="hover:text-amber-400 transition-colors">{t.announcements}</a>}
              {homeSections.contact && <a href="#contact" className="hover:text-amber-400 transition-colors">{t.contact}</a>}
            </nav>
          )}

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Bilingual Language Switch button */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-400 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{t.bilingualToggle}</span>
            </button>

            {/* Portal redirection / Logout buttons */}
            {loggedInUser ? (
              loggedInUser.role === 'admin' || loggedInUser.role === 'super-admin' || loggedInUser.role === 'editor' || loggedInUser.role === 'instructor' ? (
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {t.welcome}, <span className="font-bold text-slate-200">{loggedInUser.name.split(' ')[0]}</span>
                  </span>
                  <button
                    onClick={() => setCurrentScreen('admin')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {t.adminCenter}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-red-400 border border-slate-800 rounded-xl transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Student Profile Icon with Dropdown */
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 hover:ring-2 hover:ring-amber-400 hover:ring-offset-2 hover:ring-offset-slate-950 transition duration-150 relative shadow-lg cursor-pointer"
                    title={loggedInUser.name}
                  >
                    {loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                  </button>

                  {profileDropdownOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileDropdownOpen(false)} 
                      />
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl z-50 overflow-hidden py-2 animate-fade-in">
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                          <p className="text-xs text-slate-400 font-medium">Logged in as Student</p>
                          <p className="font-bold text-sm text-amber-400 truncate">{loggedInUser.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{loggedInUser.email}</p>
                        </div>
                        <div className="p-1.5 space-y-1">
                          <button
                            onClick={() => {
                              setCurrentScreen('student');
                              setStudentTab('profile');
                              setProfileSubTab('dashboard');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
                          >
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            STUDENT DASHBOARD
                          </button>
                          <button
                            onClick={() => {
                              setCurrentScreen('student');
                              setStudentTab('classes');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
                          >
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            LIVE CLASS STREAM
                          </button>
                          <button
                            onClick={() => {
                              setCurrentScreen('student');
                              setStudentTab('profile');
                              setProfileSubTab('lms');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
                          >
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            STUDY MATERIAL FOLDERS
                          </button>
                          <button
                            onClick={() => {
                              setCurrentScreen('student');
                              setStudentTab('messages');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
                          >
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            LIVE SUPPORT CHAT
                          </button>
                          <button
                            onClick={() => {
                              setCurrentScreen('student');
                              setStudentTab('profile');
                              setProfileSubTab('payment');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
                          >
                            <div className="h-2 w-2 rounded-full bg-pink-500" />
                            TUITION PAYMENT SLIP
                          </button>
                          <button
                            onClick={() => {
                              setCurrentScreen('student');
                              setStudentTab('profile');
                              setProfileSubTab('profile_info');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
                          >
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            MY PROFILE DATA
                          </button>
                        </div>
                        <div className="border-t border-slate-800 pt-1.5 mt-1.5 px-1.5">
                          <button
                            onClick={() => {
                              handleLogout();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2.5"
                          >
                            <LogOut className="h-4 w-4" />
                            LOG OUT
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            ) : (
              <button
                onClick={() => { setIsRegisterMode(false); setCurrentScreen('auth'); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl tracking-wider uppercase transition-colors flex items-center gap-1 shadow-md shadow-amber-500/15 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t.login}</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            {currentScreen === 'home' && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && currentScreen === 'home' && (
          <div className="md:hidden bg-slate-950 border-t border-slate-900 px-4 py-3 space-y-2.5 text-xs font-semibold uppercase text-slate-400">
            {homeSections.hero && <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-amber-400">{t.home}</a>}
            {homeSections.classes && <a href="#pathways" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-amber-400">{t.classes}</a>}
            {homeSections.timeline && <a href="#milestones" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-amber-400">{t.timeline}</a>}
            {homeSections.announcements && <a href="#announcements" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-amber-400">{t.announcements}</a>}
            {homeSections.contact && <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-amber-400">{t.contact}</a>}
            
            {loggedInUser && (
              <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                <span className="text-slate-400">{loggedInUser.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>


      {/* ----------------- SCREEN ROUTING MAIN LAYOUT ----------------- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================== A. PUBLIC VISITOR LANDING SCREEN ==================== */}
        {currentScreen === 'home' && (
          <div className="space-y-16 animate-fade-in">
            
            {/* HERO SECTION */}
            {homeSections.hero && (
              <section id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
                <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                    <GraduationCap className="h-4 w-4" />
                    Sri Lanka's Premium NextGEN LMS
                  </span>

                  <div className="space-y-3">
                    <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                      {lang === 'en' 
                        ? (activeHomeContent.heroWelcomeTitleEn || "Dr. Aritha Perera") 
                        : (activeHomeContent.heroWelcomeTitleSi || "ආචාර්ය අරිත පෙරේරා")}
                    </h1>
                    <p className="font-display font-medium text-amber-400 text-lg sm:text-xl lg:text-2xl leading-snug tracking-tight">
                      {lang === 'en' 
                        ? (activeHomeContent.heroTaglineEn || "A visionary educator inspiring students to master academic concepts with deep scientific thinking") 
                        : (activeHomeContent.heroTaglineSi || "ගැඹුරු විද්‍යාත්මක චින්තනයෙන් යුතුව විශිෂ්ටතම ප්‍රතිඵල කරා සිසුන් මෙහෙයවන ප්‍රමුඛතම දේශකයා")}
                    </p>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {lang === 'en' ? activeHomeContent.heroSubtitleEn : activeHomeContent.heroSubtitleSi}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {loggedInUser && loggedInUser.role === 'student' ? (
                      <button
                        onClick={() => { setCurrentScreen('student'); }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer"
                      >
                        <span>STUDENT DASHBOARD</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'super-admin' || loggedInUser.role === 'editor' || loggedInUser.role === 'instructor') ? (
                      <button
                        onClick={() => { setCurrentScreen('admin'); }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer"
                      >
                        <span>ADMIN DASHBOARD</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { setIsRegisterMode(true); setCurrentScreen('auth'); }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer"
                      >
                        <span>{t.registerNow}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}

                    <a
                      href="#pathways"
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center"
                    >
                      Explore Classes
                    </a>
                  </div>
                </div>

                {/* Promo Video welcome panel */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl overflow-hidden">
                  <div 
                    className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/60 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <iframe
                      id="welcome-promo-iframe"
                      className="absolute inset-0 w-full h-full border-none"
                      src={(() => {
                        const url = activeHomeContent.heroVideoUrl;
                        if (!url) return '';
                        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
                        if (isYouTube) {
                          try {
                            let videoId = '';
                            if (url.includes('youtu.be/')) {
                              videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
                            } else if (url.includes('youtube.com/embed/')) {
                              videoId = url.split('youtube.com/embed/')[1]?.split(/[?#]/)[0];
                            } else if (url.includes('youtube.com/watch')) {
                              const urlObj = new URL(url);
                              videoId = urlObj.searchParams.get('v') || '';
                            } else if (url.includes('youtube.com/live/')) {
                              videoId = url.split('youtube.com/live/')[1]?.split(/[?#]/)[0];
                            } else if (url.includes('youtube.com/shorts/')) {
                              videoId = url.split('youtube.com/shorts/')[1]?.split(/[?#]/)[0];
                            }

                            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                            const urlObj = new URL(embedUrl);
                            urlObj.searchParams.set('modestbranding', '1');
                            urlObj.searchParams.set('rel', '0');
                            urlObj.searchParams.set('showinfo', '0');
                            urlObj.searchParams.set('iv_load_policy', '3');
                            urlObj.searchParams.set('fs', '1');
                            urlObj.searchParams.set('disablekb', '1');
                            return urlObj.toString();
                          } catch (e) {
                            let videoId = '';
                            if (url.includes('youtu.be/')) {
                              videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
                            } else if (url.includes('youtube.com/shorts/')) {
                              videoId = url.split('youtube.com/shorts/')[1]?.split(/[?#]/)[0];
                            }
                            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                            const separator = embedUrl.includes('?') ? '&' : '?';
                            return `${embedUrl}${separator}modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&disablekb=1`;
                          }
                        }
                        return url;
                      })()}
                      title="Welcome class promo video"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                      allowFullScreen
                    />
                    {/* Top Full Overlay to block YouTube Share, Info, Channel, and other top-bar links */}
                    <div 
                      className="absolute top-0 left-0 w-full h-[65px] z-30 cursor-default pointer-events-auto"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                    {/* Bottom Right Overlay to block YouTube Logo and external player buttons */}
                    <div 
                      className="absolute bottom-0 right-0 w-[140px] h-[48px] z-30 cursor-default pointer-events-auto"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                    {/* Bottom Left Overlay: covers the bottom-left corner where a share icon / link icon resides */}
                    <div 
                      className="absolute bottom-0 left-0 w-[220px] h-[96px] z-30 cursor-default pointer-events-auto"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* INTERACTIVE BENTO-GRID LIVE CLASSES CHART */}
            {homeSections.classes && (
              <section id="pathways" className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="font-display font-extrabold text-white text-2xl tracking-tight">
                    {t.activePathways}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                    {t.pathwaysSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Horizontal left selection column */}
                  <div className="lg:col-span-4 space-y-3.5">
                    {(() => {
                      const activeClasses = db.classes.filter(c => !c.isHidden);
                      const pathwaysMonth = activeClasses[0]?.month || 'June';
                      const pathwaysList = activeClasses.filter(c => c.month === pathwaysMonth);
                      return pathwaysList.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedHomeClass(cls)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex gap-4 ${
                            selectedHomeClass.id === cls.id
                              ? 'bg-amber-500/10 border-amber-500 text-white'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="h-10 w-10 bg-slate-950 border border-slate-800 rounded-lg shrink-0 flex items-center justify-center font-bold text-amber-400">
                            A+
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase block">
                              A/L {cls.batch} • {cls.type}
                            </span>
                            <h4 className="font-sans font-bold text-xs truncate leading-tight mt-0.5">
                              {cls.name[lang]}
                            </h4>
                            <span className="font-mono text-[10px] text-amber-500 font-semibold mt-1 block">
                              LKR {cls.fee} / month
                            </span>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>

                  {/* Right detailed expanded card */}
                  <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-xl flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3]">
                      <img
                        src={selectedHomeClass.thumbnailUrl}
                        alt={selectedHomeClass.name[lang]}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="md:w-1/2 flex flex-col justify-between">
                      <div>
                        <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-amber-500/20 uppercase">
                          A/L {selectedHomeClass.batch} Track
                        </span>
                        <h3 className="font-display font-bold text-white text-base mt-2">
                          {selectedHomeClass.name[lang]}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mt-2.5 font-sans">
                          {selectedHomeClass.description[lang]}
                        </p>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-slate-800 mt-6 text-xs font-sans">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.weeklyTime}</span>
                          <span className="font-bold text-slate-200">{selectedHomeClass.weeklySchedule[lang]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.classFees}</span>
                          <span className="font-mono font-bold text-amber-400">LKR {selectedHomeClass.fee}</span>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              if (loggedInUser) {
                                if (!classesSelectedForPayment.includes(selectedHomeClass.id)) {
                                  setClassesSelectedForPayment(prev => [...prev, selectedHomeClass.id]);
                                }
                                setCurrentScreen('student');
                                setStudentTab('classes');
                              } else {
                                setIsRegisterMode(true);
                                setCurrentScreen('auth');
                              }
                            }}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            {lang === 'en' ? 'JOIN THIS CLASS' : 'මෙම පන්තියට සම්බන්ධ වන්න'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* DYNAMIC JOURNEY MILESTONES TIMELINE */}
            {homeSections.timeline && (
              <section id="milestones" className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="font-display font-extrabold text-white text-2xl tracking-tight">
                    {t.milestones}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                    {t.milestonesSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {activeHomeContent.milestones.map((mile, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute right-3 top-3 font-mono text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">
                        {mile.months}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold block mb-1">
                          {mile.phase}
                        </span>
                        <h4 className="font-sans font-bold text-slate-100 text-sm leading-snug">
                          {lang === 'en' ? mile.titleEn : mile.titleSi}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {mile.topics}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-800/60 mt-4 text-[10px] font-mono text-amber-500/70 font-semibold uppercase">
                        Target 100% syllabus score
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* REAL-TIME NOTICE BOARD / ANNOUNCEMENTS */}
            {homeSections.announcements && (
              <section id="announcements" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex justify-between items-center pb-4 border-b border-slate-850 mb-6">
                  <div>
                    <h2 className="font-display font-extrabold text-white text-xl tracking-tight flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-400" />
                      {t.pinnedNotice}
                    </h2>
                    <p className="text-xs text-slate-400">Notice updates posted directly by physical center operations.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...db.announcements].sort((a, b) => b.date.localeCompare(a.date)).map((notice) => (
                    <div key={notice.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
                      {notice.isPinned && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-bl">
                          PINNED
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-500 uppercase font-semibold">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{notice.date}</span>
                          <span>•</span>
                          <span>{notice.category}</span>
                        </div>
                        <h4 className="font-sans font-bold text-white text-sm mt-1.5 leading-snug">
                          {notice.title[lang]}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2.5 text-justify">
                          {notice.content[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STUDENTS FEEDBACK SECTION */}
            <section id="feedbacks" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-slate-850 mb-6">
                <div>
                  <h2 className="font-display font-extrabold text-white text-xl tracking-tight flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-amber-400" />
                    {t.studentFeedbackTitle}
                  </h2>
                  <p className="text-xs text-slate-400">Verifiable feedback shared by our active and previous students.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const approvedFeedbacks = (db.feedbacks || []).filter((fb: any) => fb.status === 'approved');
                  if (approvedFeedbacks.length === 0) {
                    return (
                      <div className="col-span-full text-center py-6 text-slate-400 text-xs font-medium">
                        No approved student feedbacks yet.
                      </div>
                    );
                  }
                  return approvedFeedbacks.map((fb: any) => (
                    <div key={fb.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start border-b border-slate-800/60 pb-3 mb-3">
                          <div>
                            <span className="font-sans font-bold text-slate-100 text-xs block">
                              {fb.studentName}
                            </span>
                            <span className="font-mono text-[10px] text-amber-500 uppercase font-semibold block mt-0.5">
                              A/L {fb.batch} Batch
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(fb.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'si-LK')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed text-justify">
                          {fb.comment}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </section>

            {/* CONTACTS, BANKS & PHYSICAL HELPLINES */}
            {homeSections.contact && (
              <section id="contact" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Helpline coords */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <PhoneCall className="h-4.5 w-4.5 text-amber-400" />
                    {t.contactDetails}
                  </h4>
                  <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                    <div>
                      <p className="text-slate-500 uppercase text-[9px] font-mono">Main Office Coordinates</p>
                      <p className="font-bold text-slate-200 mt-0.5">{activeHomeContent.helplinePhone}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase text-[9px] font-mono">WhatsApp Helpline Desk</p>
                      <p className="font-bold text-emerald-400 mt-0.5">{activeHomeContent.helplineWhatsapp}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase text-[9px] font-mono">Operations Help Hours</p>
                      <p className="font-semibold text-slate-300 mt-0.5">{activeHomeContent.helplineHours}</p>
                    </div>
                  </div>
                </div>

                {/* Physical centers list */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <MapPin className="h-4.5 w-4.5 text-amber-400" />
                    {t.physicalCenters}
                  </h4>
                  <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                    {activeHomeContent.centers.map((center, index) => (
                      <div key={index} className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <p className="font-bold text-slate-200">{center.name}</p>
                        <p className="text-[10px] text-slate-500">{center.address}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cash deposits instruction */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <CreditCard className="h-4.5 w-4.5 text-amber-400" />
                    Cash Deposits Slip Protocol
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {lang === 'en' ? activeHomeContent.bankProtocolEn : activeHomeContent.bankProtocolSi}
                  </p>
                </div>
              </section>
            )}
          </div>
        )}


        {/* ==================== B. BILINGUAL AUTHENTICATION SYSTEM ==================== */}
        {currentScreen === 'auth' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in my-8">
            <button
              onClick={() => setCurrentScreen('home')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-4 transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Home
            </button>

            <div className="text-center space-y-1.5 mb-6">
              <h2 className="font-display font-extrabold text-white text-2xl tracking-tight">
                {isRegisterMode ? t.register : t.login}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegisterMode ? t.registerSubtitle : t.loginSubtitle}
              </p>
            </div>

            {/* Double-sided form toggler */}
            {!isRegisterMode ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    {t.email}
                  </label>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. kasun@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">Demo login: kasun@gmail.com or admin@channelaplus.com</p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    {t.password}
                  </label>
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors"
                >
                  {t.login}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-[9px] uppercase font-mono font-bold tracking-widest">{t.orSeparator}</span>
                  <div className="flex-grow border-t border-slate-800/80"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-medium rounded-xl text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c.1-.28.23-.55.37-.82s.27-.54.44-.81z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  {t.googleSignIn}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-amber-400 hover:text-amber-500 underline"
                  >
                    {t.notRegistered}
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    {t.fullName}
                  </label>
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    {t.email}
                  </label>
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. kasun@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    {t.mobileNumber}
                  </label>
                  <input
                    id="register-mobile-input"
                    type="text"
                    required
                    value={authMobile}
                    onChange={(e) => setAuthMobile(e.target.value)}
                    placeholder="e.g. 0714567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    WhatsApp Contact Number (WhatsApp දුරකථන අංකය)
                  </label>
                  <input
                    id="register-whatsapp-input"
                    type="text"
                    required
                    value={authWhatsapp}
                    onChange={(e) => setAuthWhatsapp(e.target.value)}
                    placeholder="e.g. 0714567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    School Name (පාසල)
                  </label>
                  <input
                    id="register-school-input"
                    type="text"
                    required
                    value={authSchool}
                    onChange={(e) => setAuthSchool(e.target.value)}
                    placeholder="e.g. Royal College"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                      Gender (ස්ත්‍රී/පුරුෂ භාවය)
                    </label>
                    <select
                      id="register-gender-select"
                      required
                      value={authGender}
                      onChange={(e) => setAuthGender(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Male">Male (පුරුෂ)</option>
                      <option value="Female">Female (ස්ත්‍රී)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                      District (දිස්ත්‍රික්කය)
                    </label>
                    <select
                      id="register-district-select"
                      required
                      value={authDistrict}
                      onChange={(e) => setAuthDistrict(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50 scrollbar-thin scrollbar-thumb-slate-800"
                    >
                      {["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                      {t.selectBatch}
                    </label>
                    <select
                      id="register-batch-select"
                      required
                      value={authBatch}
                      onChange={(e) => setAuthBatch(e.target.value as Batch)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="2025">2025 A/L</option>
                      <option value="2026">2026 A/L</option>
                      <option value="2027">2027 A/L</option>
                      <option value="2028">2028 A/L</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    Postal Address for Study Materials (නිබන්ධන එවිය යුතු ලිපිනය)
                  </label>
                  <textarea
                    id="register-address-input"
                    required
                    rows={2}
                    value={authAddress}
                    onChange={(e) => setAuthAddress(e.target.value)}
                    placeholder="e.g. No. 45, Flower Road, Colombo 07 (study materials will be posted to this address)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                    {t.password}
                  </label>
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors"
                >
                  Generate Index & Register
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-[9px] uppercase font-mono font-bold tracking-widest">{t.orSeparator}</span>
                  <div className="flex-grow border-t border-slate-800/80"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-medium rounded-xl text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c.1-.28.23-.55.37-.82s.27-.54.44-.81z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  {t.googleSignIn}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="text-amber-400 hover:text-amber-500 underline"
                  >
                    {t.alreadyRegistered}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}


        {/* ==================== C. STUDENT PORTAL (LMS) ==================== */}
        {currentScreen === 'student' && loggedInUser && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Sidebar Navigation column */}
            <div className="lg:col-span-4 space-y-6">

              {/* Portal Menu navigation panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-xl space-y-1">
                {[
                  { id: 'profile', label: 'Student Profile & Center', icon: UserIcon },
                  { id: 'classes', label: t.activeLiveStream, icon: Video },
                  { id: 'messages', label: lang === 'en' ? 'Live Support Chat' : 'සජීවී ගුරු සහය', icon: MessageSquare }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setStudentTab(item.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-3 ${
                        studentTab === item.id
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content View Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Pending verification alert banner */}
              {loggedInUser.status === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex gap-3 text-xs leading-relaxed">
                  <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-yellow-400 uppercase">Verification Pending</h5>
                    <p className="text-slate-300 mt-1">
                      Your registered account index registration is pending slip reconciliation. Submit your bank payment slip receipt in the <strong>Tuition Payment</strong> tab below to instantly unlock files and live playbacks!
                    </p>
                  </div>
                </div>
              )}

              {/* STUDENT TAB: PROFILE, DASHBOARD, LMS, PAYMENT */}
              {studentTab === 'profile' && (
                <div className="space-y-6">
                  {/* Nested Tab Buttons Segment */}
                  <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-2xl flex flex-wrap gap-1.5 shadow-xl mb-6">
                    {[
                      { id: 'dashboard', label: 'STUDENT DASHBOARD', icon: GraduationCap },
                      { id: 'lms', label: 'STUDY MATERIAL FOLDERS', icon: BookOpen },
                      { id: 'payment', label: 'TUITION PAYMENT SLIP', icon: CreditCard },
                      { id: 'profile_info', label: 'MY PROFILE DATA', icon: UserIcon },
                      { id: 'feedback', label: t.publishMyFeedback, icon: MessageSquare }
                    ].map((tabInfo) => {
                      const Icon = tabInfo.icon;
                      const isSelected = profileSubTab === tabInfo.id;
                      return (
                        <button
                          key={tabInfo.id}
                          onClick={() => setProfileSubTab(tabInfo.id as any)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{tabInfo.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub Tab Wrapper Container */}
                  <div className="mt-4">
                    {/* Sub Tab Contents */}
                    {profileSubTab === 'profile_info' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in items-start">
                        {/* Student Digital ID Card Column */}
                        <div className="lg:col-span-5 w-full">
                          <StudentDigitalID user={loggedInUser} lang={lang} />
                        </div>

                        {/* Profile Info & Password Reset Column */}
                        <div className="lg:col-span-7 space-y-6">
                          {/* All Student Profile Data Card */}
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                              <UserIcon className="h-5 w-5 text-amber-500" />
                              <h3 className="font-display font-bold text-white text-base">Student Profile Details</h3>
                            </div>
                            
                            <div className="space-y-3.5 text-xs leading-relaxed">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Full Name</span>
                                  <span className="font-sans font-bold text-slate-200 mt-0.5 block truncate">{loggedInUser.name}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Index Number</span>
                                  <span className="font-mono font-bold text-amber-500 mt-0.5 block">{loggedInUser.indexNo}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Email Address</span>
                                  <span className="font-sans font-medium text-slate-300 mt-0.5 block truncate">{loggedInUser.email}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Academic Batch</span>
                                  <span className="font-sans font-bold text-slate-200 mt-0.5 block">{loggedInUser.batch} Theory</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Mobile Number</span>
                                  <span className="font-sans font-semibold text-slate-300 mt-0.5 block">{loggedInUser.mobile}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">WhatsApp</span>
                                  <span className="font-sans font-semibold text-emerald-400 mt-0.5 block">{loggedInUser.whatsapp || 'N/A'}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">School</span>
                                  <span className="font-sans font-medium text-slate-300 mt-0.5 block truncate">{loggedInUser.school || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">District</span>
                                  <span className="font-sans font-medium text-slate-300 mt-0.5 block">{loggedInUser.district || 'N/A'}</span>
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-semibold mb-1">Mailing Address ( study books posted here )</span>
                                <p className="font-sans text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-850 min-h-12 text-[11px] leading-relaxed">
                                  {loggedInUser.address || 'No mailing address provided.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Password Reset Section */}
                          <PasswordResetCard user={loggedInUser} db={db} setDb={setDb} />
                        </div>
                      </div>
                    )}

                    {profileSubTab === 'dashboard' && (
                      <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Class Track</span>
                      <span className="font-sans text-xs font-bold text-slate-200 mt-0.5 block truncate">
                        {studentBatchClasses[0]?.name[lang] || "2027 Theory Mechanics"}
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Assessment Status</span>
                      <span className="font-sans text-xs font-bold text-emerald-400 mt-0.5 block flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Core Term Quiz Unlocked
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Active Classes</span>
                      <span className="font-sans text-xs font-bold text-slate-200 mt-0.5 block">
                        {db.classes.filter(cls => !cls.isHidden && isClassUnlocked(cls.id)).length} Active Courses
                      </span>
                    </div>
                  </div>

                  {/* My Unlocked Classes Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-display font-bold text-white text-base flex items-center gap-2 border-b border-slate-805 pb-3">
                      <BookOpen className="h-4.5 w-4.5 text-amber-400" />
                      {lang === 'en' ? 'My Unlocked Classes & Learning hub' : 'මගේ සක්‍රීය පන්ති සහ දේශන එකතුව'}
                    </h3>

                    {(() => {
                      const unlockedClasses = db.classes.filter(cls => !cls.isHidden && isClassUnlocked(cls.id));
                      
                      if (unlockedClasses.length === 0) {
                        return (
                          <div className="p-5 bg-slate-950/50 border border-slate-850 rounded-xl text-center space-y-3">
                            <ShieldAlert className="h-10 w-10 text-amber-500/80 mx-auto" />
                            <div>
                              <h4 className="font-bold text-slate-200 text-xs">
                                {lang === 'en' ? 'No Classes Unlocked Yet' : 'තවමත් කිසිදු පන්තියක් සක්‍රීය කර නැත'}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                {lang === 'en' 
                                  ? 'Submit your bank deposit slip or pay instantly with Card in the payment tab to unlock live video streams and download pdf study books.' 
                                  : 'සජීවී දේශන නැරඹීමට සහ නිබන්ධන බාගත කර ගැනීමට Tuition Payment මඟින් බැංකු රිසිට්පතක් ඉදිරිපත් කරන්න හෝ කාඩ්පතකින් ගෙවන්න.'}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setStudentTab('profile');
                                setProfileSubTab('payment');
                              }}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                            >
                              {lang === 'en' ? 'Go to Payment Section' : 'ගෙවීම් අංශයට යන්න'}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          {unlockedClasses.map((cls) => {
                            const clsMaterials = db.materials.filter(m => m.classId === cls.id);
                            const clsRecordings = db.recordings.filter(r => r.classId === cls.id);
                            const activeVid = activeDashboardVideo && activeDashboardVideo.classId === cls.id ? activeDashboardVideo : null;

                            return (
                              <div key={cls.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
                                {/* Thumbnail banner header */}
                                <div className="relative h-32 bg-slate-900 border-b border-slate-850">
                                  <img
                                    src={cls.thumbnailUrl}
                                    alt={cls.name[lang]}
                                    className="w-full h-full object-cover opacity-35"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-4">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                                        {lang === 'en' ? 'Active ✓' : 'සක්‍රීය ✓'}
                                      </span>
                                      <span className="bg-slate-900 text-slate-300 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase border border-slate-800 tracking-wider shadow-sm">
                                        {cls.batch} Batch
                                      </span>
                                      <span className="bg-purple-500/10 text-purple-400 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase border border-purple-500/20 tracking-wider shadow-sm">
                                        {cls.type}
                                      </span>
                                    </div>
                                    <h4 className="font-sans font-bold text-white text-xs sm:text-sm">
                                      {cls.name[lang]}
                                    </h4>
                                  </div>
                                </div>

                                {/* Class Time & Date Section (Shown to all students - before and after payment) */}
                                <div className="bg-slate-950/70 border-b border-slate-850 p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                      <Calendar className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Class Time & Date (to Join)</span>
                                      <span className="font-bold text-slate-100 text-xs sm:text-sm">
                                        {cls.weeklySchedule[lang] || cls.weeklySchedule.en}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                    <span>{lang === 'en' ? 'Live Online' : 'සජීවී විකාශනය'}</span>
                                  </div>
                                </div>

                                <div className="p-4 sm:p-5 space-y-4">
                                  {/* Inline Video Player if active */}
                                  {activeVid && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-2">
                                      <div className="aspect-video relative w-full bg-black">
                                        <RestrictedVideoPlayer
                                          id={`dashboard-player-${cls.id}`}
                                          src={activeVid.videoUrl}
                                          title={activeVid.title}
                                        />
                                      </div>
                                      <div className="p-3 flex justify-between items-center bg-slate-950/40 text-xs">
                                        <div className="min-w-0 pr-2">
                                          <span className="text-[9px] font-mono uppercase text-amber-500 tracking-wider block font-bold">Now Playing</span>
                                          <p className="font-bold text-slate-200 truncate">{activeVid.title}</p>
                                        </div>
                                        <button
                                          onClick={() => setActiveDashboardVideo(null)}
                                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold transition-all"
                                        >
                                          {lang === 'en' ? 'Close ✕' : 'වසා දමන්න ✕'}
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Grid layout for Video Links and Study Materials */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Column 1: Video Lessons & Streams */}
                                    <div className="space-y-3">
                                      <h5 className="text-xs font-mono tracking-wider text-slate-300 uppercase font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2">
                                        <Youtube className="h-4 w-4 text-red-500" />
                                        {lang === 'en' ? 'Video Lessons & Recordings' : 'වීඩියෝ පාඩම් සහ පටිගත කිරීම්'}
                                      </h5>

                                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {/* 1. Main Stream Link / Live Stream */}
                                        {cls.streamUrl && (
                                          <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all text-sm">
                                            <div className="min-w-0 flex-1 mr-2">
                                              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                                                {lang === 'en' ? 'Live Stream' : 'සජීවී දේශනය'}
                                              </span>
                                              <h6 className="font-bold text-slate-100 text-xs mt-1 truncate">
                                                {cls.name[lang]}
                                              </h6>
                                            </div>
                                            <button
                                              onClick={() => {
                                                setActiveDashboardVideo({
                                                  classId: cls.id,
                                                  videoUrl: cls.streamUrl,
                                                  title: cls.name[lang]
                                                });
                                              }}
                                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 duration-100"
                                            >
                                              <Video className="h-3.5 w-3.5" /> {lang === 'en' ? 'Watch Stream' : 'නරඹන්න'}
                                            </button>
                                          </div>
                                        )}

                                        {/* 2. Custom Uploaded Video Links */}
                                        {cls.videoLinks && cls.videoLinks.length > 0 && (
                                          cls.videoLinks.map((vid, idx) => (
                                            <div key={vid.id || idx} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all text-sm">
                                              <div className="min-w-0 flex-1 mr-2">
                                                <span className="text-[10px] bg-slate-950 text-amber-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                  {lang === 'en' ? `Part ${idx + 1}` : `කොටස ${idx + 1}`}
                                                </span>
                                                <h6 className="font-bold text-slate-200 text-xs mt-1 truncate" title={vid.title[lang]}>
                                                  {vid.title[lang]}
                                                </h6>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  setActiveDashboardVideo({
                                                    classId: cls.id,
                                                    videoUrl: vid.url,
                                                    title: vid.title[lang]
                                                  });
                                                }}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                              >
                                                <Play className="h-3.5 w-3.5 fill-white" /> Play
                                              </button>
                                            </div>
                                          ))
                                        )}

                                        {/* 3. Past Completed Live Recordings */}
                                        {clsRecordings && clsRecordings.length > 0 && (
                                          clsRecordings.map((rec) => (
                                            <div key={rec.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all text-sm">
                                              <div className="min-w-0 flex-1 mr-2">
                                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                  {lang === 'en' ? 'Recording' : 'පටිගත කිරීම්'}
                                                </span>
                                                <h6 className="font-bold text-slate-200 text-xs mt-1 truncate" title={rec.title[lang]}>
                                                  {rec.title[lang]}
                                                </h6>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  setActiveDashboardVideo({
                                                    classId: cls.id,
                                                    videoUrl: rec.videoUrl,
                                                    title: rec.title[lang]
                                                  });
                                                }}
                                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                              >
                                                <Play className="h-3.5 w-3.5 fill-slate-950" /> Play
                                              </button>
                                            </div>
                                          ))
                                        )}

                                        {/* No videos at all */}
                                        {(!cls.streamUrl && (!cls.videoLinks || cls.videoLinks.length === 0) && (!clsRecordings || clsRecordings.length === 0)) && (
                                          <p className="text-slate-500 text-xs italic pl-1">
                                            {lang === 'en' ? 'No video streams or lesson links uploaded yet.' : 'මෙම පන්තිය සඳහා තවමත් වීඩියෝ උඩුගත කර නොමැත.'}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Column 2: Study Materials */}
                                    <div className="space-y-3">
                                      <h5 className="text-xs font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2">
                                        <FileText className="h-4 w-4 text-amber-500" />
                                        {lang === 'en' ? 'Study Materials & Booklets' : 'අධ්‍යයන ද්‍රව්‍ය සහ නිබන්ධන'}
                                      </h5>

                                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {clsMaterials.length === 0 ? (
                                          <p className="text-slate-500 text-xs italic pl-1">
                                            {lang === 'en' ? 'No study materials uploaded for this class yet.' : 'මෙම පන්තිය සඳහා තවමත් නිබන්ධන උඩුගත කර නොමැත.'}
                                          </p>
                                        ) : (
                                          clsMaterials.map((mat) => (
                                            <div key={mat.id} className={`p-3 bg-slate-900 border ${mat.isFree ? 'border-red-500/30 hover:border-red-500/50' : 'border-slate-850 hover:border-slate-750'} rounded-lg flex items-center justify-between transition-all text-sm`}>
                                              <div className="min-w-0 flex-1 mr-2">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  <span className="text-[10px] bg-slate-950 text-amber-500 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                    {mat.moduleName}
                                                  </span>
                                                  {mat.isFree && (
                                                    <span className="text-[10px] bg-white text-red-600 border border-red-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                      {lang === 'en' ? 'Free STUDY MATERIAL' : 'නොමිලේ අධ්‍යයන ද්‍රව්‍ය'}
                                                    </span>
                                                  )}
                                                </div>
                                                <h5 className={`font-semibold text-xs mt-1 truncate ${mat.isFree ? 'text-red-500 font-bold' : 'text-slate-200'}`} title={mat.title[lang]}>
                                                  {mat.title[lang]}
                                                </h5>
                                              </div>
                                              <a
                                                href={mat.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-md text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                              >
                                                Download
                                              </a>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Announcement Notices Board */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-display font-bold text-white text-base flex items-center gap-2 border-b border-slate-805 pb-3">
                      <Bell className="h-4.5 w-4.5 text-amber-400" />
                      Active Institute Announcements
                    </h3>

                    <div className="space-y-4">
                      {[...db.announcements].sort((a, b) => b.date.localeCompare(a.date)).map((notice) => (
                        <div key={notice.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl relative overflow-hidden text-xs">
                          {notice.isPinned && (
                            <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl">
                              PINNED
                            </span>
                          )}
                          <div className="flex gap-2 items-center text-slate-500 font-mono text-[10px]">
                            <span>{notice.date}</span>
                            <span>•</span>
                            <span className="uppercase text-amber-500">{notice.category}</span>
                          </div>
                          <h4 className="font-sans font-bold text-slate-100 text-sm mt-1">{notice.title[lang]}</h4>
                          <p className="text-slate-400 leading-relaxed mt-2 text-justify">{notice.content[lang]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            )}

            {profileSubTab === 'lms' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                  {t.lmsFolders} ({loggedInUser.batch} Batch Folders)
                </h3>

                {(() => {
                  const batchPdfs = db.materials.filter(m => m.batch === loggedInUser.batch);
                  if (batchPdfs.length === 0) {
                    return <p className="text-slate-500 text-xs italic py-8 text-center">{t.noMaterials}</p>;
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {batchPdfs.map((pdf) => {
                        const unlocked = pdf.isFree || isClassUnlocked(pdf.classId);
                        return (
                          <div key={pdf.id} className={`p-4 bg-slate-950 border ${pdf.isFree ? 'border-red-500/35 hover:border-red-500/50 shadow-lg shadow-red-500/5' : 'border-slate-800/80 hover:border-slate-750'} rounded-xl relative overflow-hidden flex flex-col justify-between transition-all`}>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-500 uppercase">
                                  {pdf.moduleName}
                                </span>
                                {pdf.isFree && (
                                  <span className="bg-white text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                                    {lang === 'en' ? 'Free STUDY MATERIAL' : 'නොමිලේ අධ්‍යයන ද්‍රව්‍ය'}
                                  </span>
                                )}
                              </div>
                              <h4 className={`font-sans text-xs mt-2 line-clamp-2 leading-snug ${pdf.isFree ? 'text-red-500 font-extrabold' : 'font-bold text-white'}`}>
                                {pdf.title[lang]}
                              </h4>
                            </div>

                            <div className="pt-4 border-t border-slate-850 mt-4 flex justify-between items-center text-xs font-sans">
                              <span className="text-[10px] text-slate-500 font-mono">Published: {pdf.uploadedAt}</span>
                              {unlocked ? (
                                <a
                                  href={pdf.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                                >
                                  Download PDF
                                </a>
                              ) : (
                                <button
                                  onClick={() => {
                                    setStudentTab('profile');
                                    setProfileSubTab('payment');
                                  }}
                                  className="px-3.5 py-1.5 bg-slate-900 text-slate-500 border border-slate-800 font-semibold rounded-lg text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                                >
                                  🔒 Locked
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {profileSubTab === 'payment' && (
              <PaymentCenter
                userClasses={studentBatchClasses}
                slips={db.slips.filter(s => s.studentId === loggedInUser.id)}
                lang={lang}
                onUploadSlip={handleStudentUploadSlip}
                currentUserAddress={loggedInUser.address}
                currentUserEmail={loggedInUser.email}
                currentUserName={loggedInUser.name}
                currentUserId={loggedInUser.id}
              />
            )}

            {profileSubTab === 'feedback' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl animate-fade-in space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-white text-lg tracking-tight flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-amber-400" />
                    {t.publishMyFeedback}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Share your learning experience and feedback directly with Dr. Aritha Perera and have it published on our main homepage.
                  </p>
                </div>

                {/* Submission status alert or success */}
                {feedbackMsg && (
                  <div className={`p-4 rounded-xl text-xs leading-relaxed flex gap-2 ${
                    feedbackMsg.type === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {feedbackMsg.text}
                  </div>
                )}

                <form onSubmit={handlePublishFeedback} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                      Your Name & Batch
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        disabled
                        value={loggedInUser.name}
                        className="w-full bg-slate-950 border border-slate-800/80 px-4 py-3 rounded-xl text-xs text-slate-400 font-medium"
                      />
                      <input
                        type="text"
                        disabled
                        value={`A/L ${loggedInUser.batch} Track`}
                        className="w-full bg-slate-950 border border-slate-800/80 px-4 py-3 rounded-xl text-xs text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                      Comment / Feedback
                    </label>
                    <textarea
                      rows={5}
                      value={newFeedbackComment}
                      onChange={(e) => setNewFeedbackComment(e.target.value)}
                      placeholder={t.feedbackPlaceholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>{t.submitFeedbackBtn}</span>
                    </button>
                  </div>
                </form>

                {/* Personal Submissions history */}
                <div className="pt-6 border-t border-slate-850">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                    Your Previous Submissions
                  </h4>
                  {(() => {
                    const myFeedbacks = (db.feedbacks || []).filter((fb: any) => fb.studentId === loggedInUser.id);
                    if (myFeedbacks.length === 0) {
                      return (
                        <p className="text-slate-500 text-xs italic">You haven't submitted any feedback yet.</p>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {myFeedbacks.map((fb: any) => (
                          <div key={fb.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex justify-between items-start">
                            <div className="space-y-1 max-w-[80%]">
                              <p className="text-xs text-slate-300 leading-relaxed text-justify">{fb.comment}</p>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Submitted on: {new Date(fb.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                                fb.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : fb.status === 'rejected'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              }`}>
                                {fb.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

              {/* STUDENT TAB 2: ACTIVE CLASSES & LIVE PLAYER */}
              {studentTab === 'classes' && (() => {
                const lockedClasses = [...studentBatchClasses.filter(cls => !isClassUnlocked(cls.id))].reverse();
                const totalFeesSelected = classesSelectedForPayment.length === 0
                  ? 0
                  : classesSelectedForPayment.reduce((sum, id) => {
                      const target = db.classes.find(c => c.id === id);
                      return sum + (target ? target.fee : 0);
                    }, 0);

                return (
                  <div className="space-y-6">
                    {/* Select Multiple Classes for Bulk Payment */}
                    {lockedClasses.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                              <CreditCard className="h-4.5 w-4.5 text-amber-400" />
                              Multi-Class Tuition Activation Panel
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                              Select multiple classes below to submit a single deposit slip and instantly activate them at once.
                            </p>
                          </div>
                          {/* Show total fees top of the section */}
                          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-right shrink-0">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Total Fees Selected</span>
                            <span className="text-base font-mono font-bold text-amber-400">
                              LKR {totalFeesSelected.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {bulkPaymentSuccess && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                            <span>{bulkPaymentSuccess}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                          {/* Left column: Selection */}
                          <div className={`${classesSelectedForPayment.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-2.5 transition-all duration-300`}>
                            <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                              Choose Classes (පන්ති තෝරන්න):
                            </span>
                            <div className={`grid gap-4 max-h-[480px] overflow-y-auto pr-1 ${
                              classesSelectedForPayment.length > 0 
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1' 
                                : 'grid-cols-1 md:grid-cols-2'
                            }`}>
                              {lockedClasses.map((cls) => {
                                const isChecked = classesSelectedForPayment.includes(cls.id);
                                return (
                                  <label
                                    key={cls.id}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden h-full ${
                                      isChecked
                                        ? 'bg-amber-950/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                                        : 'bg-slate-950 border border-slate-800/80 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-3">
                                      <div className="min-w-0 flex-1">
                                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-500 uppercase">
                                          {cls.type}
                                        </span>
                                        <h4 className="font-sans font-bold text-white text-xs mt-2 line-clamp-2 leading-snug">
                                          {cls.name[lang]}
                                        </h4>
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          if (isChecked) {
                                            setClassesSelectedForPayment(prev => prev.filter(id => id !== cls.id));
                                          } else {
                                            setClassesSelectedForPayment(prev => [...prev, cls.id]);
                                          }
                                        }}
                                        className="h-4 w-4 accent-amber-500 rounded text-slate-900 border-slate-800 focus:ring-0 cursor-pointer shrink-0 mt-0.5"
                                      />
                                    </div>

                                    <div className="pt-4 border-t border-slate-850 mt-4 flex justify-between items-center text-xs font-sans">
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {cls.weeklySchedule[lang]}
                                      </span>
                                      <span className="font-mono text-xs font-bold text-amber-400">
                                        LKR {cls.fee.toLocaleString()}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right column: Bank Details, Slip Upload & Card Checkout */}
                          {classesSelectedForPayment.length > 0 && (
                            <div className="lg:col-span-6 space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
                              {/* Payment Method Selector */}
                              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setBulkPaymentMethod('slip')}
                                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    bulkPaymentMethod === 'slip'
                                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  {lang === 'en' ? 'Bank Slip' : 'බැංකු රිසිට්පත'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBulkPaymentMethod('card')}
                                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    bulkPaymentMethod === 'card'
                                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                  {lang === 'en' ? 'Card Payment' : 'කාඩ්පත් ගෙවීම්'}
                                </button>
                              </div>

                            {bulkPaymentMethod === 'slip' ? (
                              <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                                <div>
                                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                                    Upload Bank Deposit Slip (බැංකු රිසිට්පත උඩුගත කරන්න)
                                  </label>
                                  <div
                                    onDragOver={(e) => { e.preventDefault(); setIsStudentDragOver(true); }}
                                    onDragLeave={() => setIsStudentDragOver(false)}
                                    onDrop={handleStudentSlipDrop}
                                    onClick={() => document.getElementById('student-slip-file-input')?.click()}
                                    className={`border-2 border-dashed rounded-xl p-4.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                                      isStudentDragOver
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-950/40 text-slate-400'
                                    }`}
                                  >
                                    <input
                                      id="student-slip-file-input"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleStudentSlipFileChange}
                                      className="hidden"
                                    />
                                    {bulkPaymentSlipUrl ? (
                                      <div className="space-y-2 w-full">
                                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                                          <CheckCircle2 className="h-5 w-5 animate-bounce" />
                                          <span className="text-xs font-bold font-mono">Slip Image Loaded!</span>
                                        </div>
                                        <img
                                          src={bulkPaymentSlipUrl}
                                          alt="Bank Slip Preview"
                                          className="max-h-24 mx-auto rounded border border-slate-800 object-contain"
                                        />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setBulkPaymentSlipUrl('');
                                          }}
                                          className="text-[10px] font-mono text-red-400 hover:text-red-300 underline block mx-auto cursor-pointer"
                                        >
                                          Clear / Upload New
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <Upload className="h-6 w-6 mb-1 text-slate-500" />
                                        <p className="text-xs font-bold text-slate-300">Drag & Drop Slip Image Here</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5">or click to browse files (PNG, JPG, WEBP)</p>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                                    Bank Slip Ref (බැංකු රිසිට්පත් අංකය / යොමුව):
                                  </label>
                                  <input
                                    type="text"
                                    value={bulkPaymentSlipRef}
                                    onChange={(e) => setBulkPaymentSlipRef(e.target.value)}
                                    placeholder="e.g. TXN102938475"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                                  />
                                </div>

                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1.5 text-[9px] text-slate-400">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-slate-300">BOC - Colombo:</span>
                                    <span className="font-mono text-amber-400">88720119</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-bold text-slate-300">Sampath Bank:</span>
                                    <span className="font-mono text-amber-400">1045928102</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3.5 animate-in fade-in-50 duration-150">
                                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-xl space-y-3">
                                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <CreditCard className="h-4 w-4 text-amber-500" />
                                      {lang === 'en' ? 'Secure Card Checkout' : 'කාඩ්පත් ගෙවීම'}
                                    </span>
                                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                                      Visa / Mastercard
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                                        Cardholder Name (කාඩ්පතේ නම)
                                      </label>
                                      <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="e.g. A.B.C. Perera"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                                        Card Number (කාඩ්පත් අංකය)
                                      </label>
                                      <input
                                        type="text"
                                        maxLength={19}
                                        value={cardNumber}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          const chunks = val.match(/.{1,4}/g);
                                          setCardNumber(chunks ? chunks.join(' ') : val);
                                        }}
                                        placeholder="4111 2222 3333 4444"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div>
                                        <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                                          Expiry (කල් ඉකුත්වීමේ දිනය)
                                        </label>
                                        <input
                                          type="text"
                                          maxLength={5}
                                          value={cardExpiry}
                                          onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length >= 2) {
                                              setCardExpiry(val.slice(0, 2) + '/' + val.slice(2, 4));
                                            } else {
                                              setCardExpiry(val);
                                            }
                                          }}
                                          placeholder="MM/YY"
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono text-center"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                                          CVC / CVV
                                        </label>
                                        <input
                                          type="password"
                                          maxLength={3}
                                          value={cardCvc}
                                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                          placeholder="123"
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono text-center"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (classesSelectedForPayment.length === 0) {
                                  alert("Please select classes to make a payment.");
                                  return;
                                }
                                if (bulkPaymentMethod === 'slip' && !bulkPaymentSlipUrl.trim()) {
                                  alert("Please upload your bank slip.");
                                  return;
                                }
                                if (bulkPaymentMethod === 'card' && (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
                                  alert("Please fill in all card fields correctly.");
                                  return;
                                }
                                setStudentPostalAddress(loggedInUser?.address || '');
                                setWantsPrintedMaterials(false);
                                setShowPaymentDetailsModal(true);
                              }}
                              disabled={
                                classesSelectedForPayment.length === 0 ||
                                (bulkPaymentMethod === 'slip' && !bulkPaymentSlipUrl.trim()) ||
                                (bulkPaymentMethod === 'card' && (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) ||
                                isBulkPaying
                              }
                              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs tracking-wider uppercase transition-colors disabled:opacity-40 cursor-pointer animate-pulse-subtle"
                            >
                              {isBulkPaying ? 'Processing...' : `Submit Payment for ${classesSelectedForPayment.length} Class(es)`}
                            </button>

                            {/* CONFIRMATION POP-UP WINDOW / MODAL */}
                            {showPaymentDetailsModal && (() => {
                              const selectedClassesData = db.classes.filter(c => classesSelectedForPayment.includes(c.id));
                              const eligibleMaterials = db.materials.filter(m => classesSelectedForPayment.includes(m.classId));
                              return (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                                  <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                    {/* Modal Header */}
                                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                                      <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-amber-500" />
                                        {lang === 'en' ? 'Confirm Selected Classes & Materials' : 'තෝරාගත් පන්ති සහ නිබන්ධන තහවුරු කරන්න'}
                                      </h3>
                                      <button
                                        type="button"
                                        onClick={() => setShowPaymentDetailsModal(false)}
                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                      >
                                        <X className="h-5 w-5" />
                                      </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
                                      {/* Selected Classes */}
                                      <div className="space-y-2.5">
                                        <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                                          Selected Class Tracks ({selectedClassesData.length})
                                        </span>
                                        <div className="space-y-2">
                                          {selectedClassesData.map(cls => (
                                            <div key={cls.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                                              <div>
                                                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wide">
                                                  {cls.type}
                                                </span>
                                                <h5 className="text-xs font-bold text-white mt-1 leading-snug">
                                                  {cls.name[lang]}
                                                </h5>
                                              </div>
                                              <span className="font-mono text-xs text-amber-500 font-bold">
                                                LKR {cls.fee.toLocaleString()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="flex justify-between border-t border-slate-800 pt-2 font-mono text-xs">
                                          <span className="text-slate-400">Total Tuition Fee:</span>
                                          <span className="text-white font-bold">
                                            LKR {selectedClassesData.reduce((sum, c) => sum + c.fee, 0).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Study Materials */}
                                      <div className="space-y-2.5">
                                        <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                                          Associated Study Materials / Booklets ({eligibleMaterials.length})
                                        </span>
                                        {eligibleMaterials.length === 0 ? (
                                          <p className="text-slate-500 text-xs italic pl-1">
                                            No specific booklets uploaded yet for these classes. You will receive updates as soon as they are added!
                                          </p>
                                        ) : (
                                          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                            {eligibleMaterials.map(mat => (
                                              <div key={mat.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
                                                <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                                                <div className="min-w-0">
                                                  <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.25 rounded font-mono uppercase">
                                                    {mat.moduleName}
                                                  </span>
                                                  <h6 className="font-bold text-xs text-slate-300 truncate mt-0.5">
                                                    {mat.title[lang]}
                                                  </h6>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Printed Study Materials Mailing Option */}
                                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                                        <div className="flex items-start gap-3">
                                          <input
                                            id="wants-printed-materials-checkbox"
                                            type="checkbox"
                                            checked={wantsPrintedMaterials}
                                            onChange={(e) => setWantsPrintedMaterials(e.target.checked)}
                                            className="mt-1 h-4 w-4 text-amber-500 rounded border-slate-800 bg-slate-900 focus:ring-amber-500 cursor-pointer"
                                          />
                                          <div className="flex-1">
                                            <label htmlFor="wants-printed-materials-checkbox" className="font-bold text-xs text-white cursor-pointer flex items-center gap-1.5">
                                              📦 Post printed study materials to my home
                                            </label>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                              Adds an additional <span className="text-amber-400 font-bold">Rs. 200</span> flat rate for mailing charges to your total bill.
                                            </p>
                                          </div>
                                        </div>

                                        {wantsPrintedMaterials && (
                                          <div className="space-y-2 pt-2 border-t border-slate-900">
                                            <label className="block text-[10px] font-mono uppercase tracking-wide text-slate-400 font-bold">
                                              Postal Shipping Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                              id="student-postal-address-input"
                                              value={studentPostalAddress}
                                              onChange={(e) => setStudentPostalAddress(e.target.value)}
                                              placeholder="Enter your complete home address with postal code (e.g., No. 45, Kandy Road, Colombo)"
                                              className={`w-full bg-slate-905 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-amber-500/50 min-h-[60px] ${
                                                !studentPostalAddress.trim() ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800'
                                              }`}
                                            />
                                            {!studentPostalAddress.trim() && (
                                              <p className="text-[10px] text-red-400 font-medium">
                                                ⚠️ You must provide a valid postal address before you can submit the payment.
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Payment Metadata Preview */}
                                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1 text-xs">
                                        <div className="flex justify-between font-mono">
                                          <span className="text-slate-400">Payment Method:</span>
                                          <span className="text-amber-400 font-bold">
                                            {bulkPaymentMethod === 'card' ? 'Visa/Mastercard Card' : 'Bank Deposit Slip'}
                                          </span>
                                        </div>
                                        {bulkPaymentMethod === 'card' ? (
                                          <>
                                            <div className="flex justify-between font-mono">
                                              <span className="text-slate-400">Cardholder Name:</span>
                                              <span className="text-white">{cardName}</span>
                                            </div>
                                            <div className="flex justify-between font-mono">
                                              <span className="text-slate-400">Card Number:</span>
                                              <span className="text-white">**** **** **** {cardNumber.replace(/\s+/g, '').slice(-4)}</span>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            {bulkPaymentSlipRef && (
                                              <div className="flex justify-between font-mono">
                                                <span className="text-slate-400">Slip Reference:</span>
                                                <span className="text-amber-400 font-bold">{bulkPaymentSlipRef}</span>
                                              </div>
                                            )}
                                            <div className="flex justify-between font-mono">
                                              <span className="text-slate-400">Slip Upload Status:</span>
                                              <span className="text-emerald-400 font-bold">Image Loaded ✓</span>
                                            </div>
                                          </>
                                        )}
                                        <div className="flex justify-between font-mono border-t border-slate-800/40 pt-1.5 mt-1.5">
                                          <span className="text-slate-400">Base Fees:</span>
                                          <span className="text-white">LKR {selectedClassesData.reduce((sum, c) => sum + c.fee, 0).toLocaleString()}</span>
                                        </div>
                                        {wantsPrintedMaterials && (
                                          <div className="flex justify-between font-mono text-purple-400 mt-1">
                                            <span>Mailing Surcharge:</span>
                                            <span>+ LKR 200</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between font-mono border-t border-slate-800/40 pt-1.5 mt-1 text-amber-500 font-bold">
                                          <span>Total Charged Amount:</span>
                                          <span>LKR {(selectedClassesData.reduce((sum, c) => sum + c.fee, 0) + (wantsPrintedMaterials ? 200 : 0)).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/20">
                                      <button
                                        type="button"
                                        onClick={() => setShowPaymentDetailsModal(false)}
                                        className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs tracking-wide uppercase transition-colors"
                                      >
                                        {lang === 'en' ? 'Go Back & Edit' : 'ආපසු ගොස් සංස්කරණය'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowPaymentDetailsModal(false);
                                          handleBulkPaymentSubmit();
                                        }}
                                        disabled={isBulkPaying || (wantsPrintedMaterials && !studentPostalAddress.trim())}
                                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/30 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs tracking-wide uppercase transition-colors shrink-0 disabled:cursor-not-allowed"
                                      >
                                        {isBulkPaying ? 'Submitting...' : (lang === 'en' ? 'Confirm & Submit' : 'තහවුරු කර ඉදිරිපත් කරන්න')}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Class Selection & Filtering Dashboard */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-amber-500" />
                            {lang === 'en' ? 'Physics Classes Library' : 'භෞතික විද්‍යාව පන්ති එකතුව'}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lang === 'en'
                              ? 'Filter and access previous, current, and newly published class recordings, notes, and interactive groups.'
                              : 'පෙර, වත්මන් සහ අලුතින් ප්‍රකාශිත පන්ති, සටහන් සහ සාකච්ඡා කාණ්ඩ මෙතැනින් ලබාගන්න.'}
                          </p>
                        </div>

                        {/* Stats indicator */}
                        <div className="flex gap-2">
                          <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 text-[10px] font-mono font-bold text-amber-500">
                            {(() => {
                              const filteredCount = db.classes.filter(c => {
                                if (c.isHidden) return false;
                                if (classFilterBatch !== 'All' && c.batch !== classFilterBatch) return false;
                                if (classFilterType !== 'All' && c.type.toLowerCase() !== classFilterType.toLowerCase()) return false;
                                if (classFilterMonth !== 'All' && c.month !== classFilterMonth) return false;
                                return true;
                              }).length;
                              return `${filteredCount} ${lang === 'en' ? 'Classes Found' : 'පන්ති හමු විය'}`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Filters Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Class Year (Batch) */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                            {lang === 'en' ? 'Class Year (Batch)' : 'පන්ති වසර (කණ්ඩායම)'}
                          </label>
                          <select
                            value={classFilterBatch}
                            onChange={(e) => setClassFilterBatch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="All">{lang === 'en' ? 'All Years (සියලුම වසර)' : 'සියලුම වසර'}</option>
                            <option value="2027">2027 Batch</option>
                            <option value="2028">2028 Batch</option>
                            <option value="2029">2029 Batch</option>
                            <option value="2030">2030 Batch</option>
                          </select>
                        </div>

                        {/* Class Type */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                            {lang === 'en' ? 'Class Type' : 'පන්ති වර්ගය'}
                          </label>
                          <select
                            value={classFilterType}
                            onChange={(e) => setClassFilterType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="All">{lang === 'en' ? 'All Types (සියලුම වර්ග)' : 'සියලුම වර්ග'}</option>
                            <option value="Theory">Theory (සිද්ධාන්ත)</option>
                            <option value="Revision">Revision (පුනරීක්ෂණ)</option>
                            <option value="Paper Class">Paper Class (ප්‍රශ්න පත්‍ර)</option>
                          </select>
                        </div>

                        {/* Month */}
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1.5">
                            {lang === 'en' ? 'Month' : 'මාසය'}
                          </label>
                          <select
                            value={classFilterMonth}
                            onChange={(e) => setClassFilterMonth(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="All">{lang === 'en' ? 'All Months (සියලුම මාස)' : 'සියලුම මාස'}</option>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Classes List */}
                    {(() => {
                      const filteredClasses = db.classes.filter(c => {
                        if (c.isHidden) return false;
                        if (classFilterBatch !== 'All' && c.batch !== classFilterBatch) return false;
                        if (classFilterType !== 'All' && c.type.toLowerCase() !== classFilterType.toLowerCase()) return false;
                        if (classFilterMonth !== 'All' && c.month !== classFilterMonth) return false;
                        return true;
                      });

                      if (filteredClasses.length === 0) {
                        return (
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
                            <BookOpen className="h-10 w-10 text-slate-700 mx-auto" />
                            <h4 className="font-display font-bold text-white text-sm">No Classes Match Your Filters</h4>
                            <p className="text-xs text-slate-400">
                              Try resetting or selecting other filters to view older sessions, booklets, or recordings.
                            </p>
                            <button
                              onClick={() => {
                                setClassFilterBatch('All');
                                setClassFilterType('All');
                                setClassFilterMonth('All');
                              }}
                              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-bold uppercase rounded-xl tracking-wider transition-colors cursor-pointer"
                            >
                              Reset Filters
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          {filteredClasses.map((cls) => {
                            const unlocked = isClassUnlocked(cls.id);
                            const classMaterialsList = db.materials.filter(m => m.classId === cls.id);
                            const classRecordingsList = db.recordings.filter(r => r.classId === cls.id);
                            const activeVid = activeClassesVideo && activeClassesVideo.classId === cls.id ? activeClassesVideo : null;
                            
                            // Group materials by type
                            const groupedMaterials = classMaterialsList.reduce((acc, mat) => {
                              const type = mat.type || 'Theory Note';
                              if (!acc[type]) {
                                acc[type] = [];
                              }
                              acc[type].push(mat);
                              return acc;
                            }, {} as Record<string, StudyMaterial[]>);

                            return (
                              <div key={cls.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                {/* Card Header Banner */}
                                <div className="relative h-44 sm:h-48 bg-slate-950 border-b border-slate-850">
                                  <img
                                    src={cls.thumbnailUrl}
                                    alt={cls.name[lang]}
                                    className="w-full h-full object-cover opacity-40"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/65 to-transparent flex flex-col justify-end p-5">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider shadow-sm">
                                        {cls.batch} Batch
                                      </span>
                                      <span className="bg-slate-950 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase border border-slate-800 font-mono tracking-wider shadow-sm">
                                        {cls.type}
                                      </span>
                                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/25 text-xs font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider shadow-sm">
                                        {cls.month || 'June'}
                                      </span>
                                      {unlocked ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider flex items-center gap-1 shadow-sm">
                                          <CheckCircle2 className="h-3 w-3" /> Unlocked
                                        </span>
                                      ) : (
                                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider flex items-center gap-1 shadow-sm">
                                          <Lock className="h-3 w-3" /> Locked
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="font-display font-bold text-white text-base sm:text-lg tracking-wide leading-snug">
                                      {cls.name[lang]}
                                    </h4>
                                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                                      {cls.description[lang] || (lang === 'en' ? 'No description available.' : 'විස්තරයක් ලබා ගත නොහැක.')}
                                    </p>
                                  </div>
                                </div>

                                {/* Class Time & Date Section (Shown to all students - before and after payment) */}
                                <div className="bg-slate-950/70 border-b border-slate-850 p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                      <Calendar className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Class Time & Date (to Join)</span>
                                      <span className="font-bold text-slate-100 text-xs sm:text-sm">
                                        {cls.weeklySchedule[lang] || cls.weeklySchedule.en}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                    <span>{lang === 'en' ? 'Live Online' : 'සජීවී විකාශනය'}</span>
                                  </div>
                                </div>

                                {/* Card Content (Conditional on Unlock state) */}
                                {!unlocked ? (
                                  <div className="p-6 text-center space-y-4 max-w-sm mx-auto">
                                    <Lock className="h-10 w-10 text-slate-600 mx-auto" />
                                    <div>
                                      <h5 className="font-bold text-white text-sm">Class Content is Locked</h5>
                                      <p className="text-xs text-slate-400 mt-1">
                                        {lang === 'en'
                                          ? `Unlock this class by submitting the tuition fee of LKR ${cls.fee.toLocaleString()} in the activation panel.`
                                          : `මෙම පන්තිය ලබා ගැනීමට පන්ති ගාස්තුව වන LKR ${cls.fee.toLocaleString()} ගෙවා සක්‍රිය කරගන්න.`}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (!classesSelectedForPayment.includes(cls.id)) {
                                          setClassesSelectedForPayment(prev => [...prev, cls.id]);
                                        }
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase rounded-xl tracking-wider transition-colors cursor-pointer"
                                    >
                                      Pay & Activate Class Above
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-6 space-y-6">
                                    {/* Inline Video Player if active */}
                                    {activeVid && (
                                      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-2">
                                        <div className="aspect-video relative w-full bg-black">
                                          <RestrictedVideoPlayer
                                            id={`classes-player-${cls.id}`}
                                            src={activeVid.videoUrl}
                                            title={activeVid.title}
                                          />
                                        </div>
                                        <div className="p-3 flex justify-between items-center bg-slate-900/40 text-xs">
                                          <div className="min-w-0 pr-2">
                                            <span className="text-[9px] font-mono uppercase text-amber-500 tracking-wider block font-bold">Now Playing</span>
                                            <p className="font-bold text-slate-200 truncate">{activeVid.title}</p>
                                          </div>
                                          <button
                                            onClick={() => setActiveClassesVideo(null)}
                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold transition-all cursor-pointer"
                                          >
                                            {lang === 'en' ? 'Close ✕' : 'වසා දමන්න ✕'}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Section 1: Video Lessons & Recordings (Inline Playable) */}
                                    <div className="space-y-3">
                                      <h5 className="text-xs font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5 border-b border-slate-800 pb-2">
                                        <Youtube className="h-4 w-4 text-red-500" />
                                        {lang === 'en' ? 'Video Lessons & Recordings' : 'වීඩියෝ පාඩම් සහ පටිගත කිරීම්'}
                                      </h5>

                                      {((cls.videoLinks && cls.videoLinks.length > 0) || cls.streamUrl || (classRecordingsList && classRecordingsList.length > 0)) ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {/* 1. Main Stream Link / Live Stream */}
                                          {cls.streamUrl && (
                                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-slate-800 transition-all gap-4">
                                              <div>
                                                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                  {lang === 'en' ? 'Live Stream' : 'සජීවී දේශනය'}
                                                </span>
                                                <h6 className="text-sm font-bold text-white mt-1.5 leading-snug">
                                                  {cls.name[lang]}
                                                </h6>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  setActiveClassesVideo({
                                                    classId: cls.id,
                                                    videoUrl: cls.streamUrl,
                                                    title: cls.name[lang]
                                                  });
                                                }}
                                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-center text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 duration-100"
                                              >
                                                <Video className="h-4 w-4" />
                                                {lang === 'en' ? 'Watch Live Stream' : 'සජීවී දේශනය නරඹන්න'}
                                              </button>
                                            </div>
                                          )}

                                          {/* 2. Custom Uploaded Video Links */}
                                          {cls.videoLinks && cls.videoLinks.length > 0 && (
                                            cls.videoLinks.map((vid, idx) => (
                                              <div key={vid.id || idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-slate-800 transition-all gap-4">
                                                <div>
                                                  <span className="text-[10px] bg-slate-900 text-amber-500 border border-slate-850 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                    {lang === 'en' ? `Part ${idx + 1}` : `කොටස ${idx + 1}`}
                                                  </span>
                                                  <h6 className="text-sm font-bold text-white mt-1.5 leading-snug">
                                                    {vid.title[lang]}
                                                  </h6>
                                                </div>
                                                <button
                                                  onClick={() => {
                                                    setActiveClassesVideo({
                                                      classId: cls.id,
                                                      videoUrl: vid.url,
                                                      title: vid.title[lang]
                                                    });
                                                  }}
                                                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-center text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                  <Play className="h-4 w-4 fill-white" />
                                                  {lang === 'en' ? 'Play Lesson' : 'වීඩියෝව නරඹන්න'}
                                                </button>
                                              </div>
                                            ))
                                          )}

                                          {/* 3. Past Completed Live Recordings */}
                                          {classRecordingsList && classRecordingsList.length > 0 && (
                                            classRecordingsList.map((rec) => (
                                              <div key={rec.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-slate-800 transition-all gap-4">
                                                <div>
                                                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                    {lang === 'en' ? 'Recording' : 'පටිගත කිරීම්'}
                                                  </span>
                                                  <h6 className="text-sm font-bold text-white mt-1.5 leading-snug">
                                                    {rec.title[lang]}
                                                  </h6>
                                                </div>
                                                <button
                                                  onClick={() => {
                                                    setActiveClassesVideo({
                                                      classId: cls.id,
                                                      videoUrl: rec.videoUrl,
                                                      title: rec.title[lang]
                                                    });
                                                  }}
                                                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-center text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                  <Play className="h-4 w-4 fill-slate-950" />
                                                  {lang === 'en' ? 'Play Recording' : 'පටිගත කිරීම නරඹන්න'}
                                                </button>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-slate-500 text-sm italic pl-1">
                                          {lang === 'en' ? 'No video streams or lesson links uploaded yet.' : 'මෙම පන්තිය සඳහා තවමත් වීඩියෝ උඩුගත කර නොමැත.'}
                                        </p>
                                      )}
                                    </div>

                                    {/* Section 2: Study Materials & Booklets */}
                                    <div className="space-y-4">
                                      <h5 className="text-xs font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5 border-b border-slate-800 pb-2">
                                        <FileText className="h-4 w-4 text-amber-500" />
                                        {lang === 'en' ? 'Study Materials & Booklets' : 'අධ්‍යයන ද්‍රව්‍ය සහ නිබන්ධන'}
                                      </h5>

                                      {Object.keys(groupedMaterials).length === 0 ? (
                                        <p className="text-slate-500 text-sm italic pl-1">
                                          No specific study materials uploaded for this class yet.
                                        </p>
                                      ) : (
                                        <div className="space-y-4">
                                          {Object.entries(groupedMaterials).map(([type, mats]) => {
                                            const typedMats = mats as StudyMaterial[];
                                            return (
                                              <div key={type} className="space-y-2.5">
                                                <span className="text-xs font-mono text-emerald-400 uppercase font-semibold tracking-wider block bg-slate-950/60 px-2.5 py-1 rounded border border-slate-850 self-start inline-block">
                                                  {type}
                                                </span>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  {typedMats.map((mat) => (
                                                  <div key={mat.id} className={`p-3.5 bg-slate-950 rounded-xl border ${mat.isFree ? 'border-red-500/35 hover:border-red-500/50 shadow-lg shadow-red-500/5' : 'border-slate-850 hover:border-slate-800'} flex items-center justify-between transition-all`}>
                                                    <div className="min-w-0 pr-3">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.25 rounded font-mono uppercase tracking-wide">
                                                          {mat.moduleName}
                                                        </span>
                                                        {mat.isFree && (
                                                          <span className="text-[10px] bg-white text-red-600 border border-red-200 px-1.5 py-0.25 rounded font-mono font-bold uppercase">
                                                            {lang === 'en' ? 'Free STUDY MATERIAL' : 'නොමිලේ අධ්‍යයන ද්‍රව්‍ය'}
                                                          </span>
                                                        )}
                                                      </div>
                                                      <h6 className={`font-bold text-sm mt-1 ${mat.isFree ? 'text-red-500 font-extrabold' : 'text-slate-200'}`}>
                                                        {mat.title[lang]}
                                                      </h6>
                                                    </div>
                                                    <a
                                                      href={mat.pdfUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs tracking-wide uppercase transition-colors shrink-0"
                                                    >
                                                      Download PDF
                                                    </a>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      )}
                                    </div>

                                    {/* Section 3: Telegram & WhatsApp Group Discussion Links */}
                                    <div className="space-y-3">
                                      <h5 className="text-xs font-mono tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5 border-b border-slate-800 pb-2">
                                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                                        {lang === 'en' ? 'Class Communication & Discussion Links' : 'සන්නිවේදන සහ සාකච්ඡා සමූහයන්'}
                                      </h5>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Telegram Button */}
                                        {cls.telegramLink ? (
                                          <a
                                            href={cls.telegramLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-blue-500/30 rounded-xl transition-all group"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-all">
                                                <Send className="h-5 w-5" />
                                              </div>
                                              <div>
                                                <h6 className="font-bold text-xs text-white">Join Telegram Group</h6>
                                                <p className="text-xs text-slate-400 mt-0.5 font-sans">Instant discussion and support link</p>
                                              </div>
                                            </div>
                                            <span className="text-xs font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform font-mono">
                                              JOIN →
                                            </span>
                                          </a>
                                        ) : (
                                          <div className="flex items-center gap-3 p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-slate-500">
                                            <Send className="h-5 w-5 opacity-45" />
                                            <div>
                                              <h6 className="font-bold text-xs">No Telegram link assigned</h6>
                                              <p className="text-xs text-slate-500">Contact support if expected.</p>
                                            </div>
                                          </div>
                                        )}

                                        {/* WhatsApp Button */}
                                        {cls.whatsappLink ? (
                                          <a
                                            href={cls.whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/30 rounded-xl transition-all group"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                                                <MessageSquare className="h-5 w-5" />
                                              </div>
                                              <div>
                                                <h6 className="font-bold text-xs text-white">Join WhatsApp Group</h6>
                                                <p className="text-xs text-slate-400 mt-0.5 font-sans">Announcement stream link</p>
                                              </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform font-mono">
                                              JOIN →
                                            </span>
                                          </a>
                                        ) : (
                                          <div className="flex items-center gap-3 p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-slate-500">
                                            <MessageSquare className="h-5 w-5 opacity-45" />
                                            <div>
                                              <h6 className="font-bold text-xs">No WhatsApp link assigned</h6>
                                              <p className="text-xs text-slate-500">Contact support if expected.</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}



              {/* STUDENT TAB 7: LIVE SUPPORT CHAT */}
              {studentTab === 'messages' && (
                <SupportChat
                  chats={db.chats || []}
                  currentUser={loggedInUser}
                  users={db.users}
                  onSendMessage={handleSendChatMessage}
                  lang={lang}
                />
              )}
            </div>
          </div>
        )}


        {/* ==================== D. ADMIN CONTROL CENTER ==================== */}
        {currentScreen === 'admin' && loggedInUser && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Admin Stats Bar */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-900 pb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase block">
                  {loggedInUser.role === 'instructor' ? 'INSTRUCTOR STAFF PORTAL' : 'SYSTEM LEVEL OVERSEER'}
                </span>
                <h2 className="font-display font-black text-white text-2xl tracking-tight">
                  {loggedInUser.role === 'instructor' ? 'Instructor Command Center' : t.adminCenter} • Dashboard
                </h2>
                <p className="text-xs text-slate-400">
                  {loggedInUser.role === 'instructor'
                    ? 'Verify cash deposits and reply to pedagogical/payment support questions directly from students.'
                    : 'Manage physical locations, verify cash deposits, publish exam questionnaires, and manage student accounts.'}
                </p>
              </div>

              {/* Quick Tab control desk */}
              <div className="flex flex-wrap gap-2">
                {(loggedInUser.role === 'instructor'
                  ? [
                      { id: 'dashboard', label: 'Admin Home' },
                      { id: 'slips', label: 'Slip Bureau' },
                      { id: 'classes-students', label: 'Classes & Student' },
                      { id: 'messages', label: 'Support Chat' }
                    ]
                  : loggedInUser.role === 'super-admin'
                  ? [
                      { id: 'dashboard', label: 'Admin Home' },
                      { id: 'slips', label: 'Slip Bureau' },
                      { id: 'classes-students', label: 'Classes & Student' },
                      { id: 'users', label: 'Student Directory' },
                      { id: 'publisher', label: 'Publish Content' },
                      { id: 'settings', label: 'Notice & Helplines' },
                      { id: 'homepage', label: 'Edit Homepage' },
                      { id: 'messages', label: 'Support Chat' },
                      { id: 'feedback_approval', label: t.feedbackApproval },
                      { id: 'superadmin', label: '⚡ Super Admin Portal' }
                    ]
                  : [
                      { id: 'dashboard', label: 'Admin Home' },
                      { id: 'slips', label: 'Slip Bureau' },
                      { id: 'classes-students', label: 'Classes & Student' },
                      { id: 'users', label: 'Student Directory' },
                      { id: 'publisher', label: 'Publish Content' },
                      { id: 'settings', label: 'Notice & Helplines' },
                      { id: 'homepage', label: 'Edit Homepage' },
                      { id: 'messages', label: 'Support Chat' },
                      { id: 'feedback_approval', label: t.feedbackApproval }
                    ]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all ${
                      adminTab === tab.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                
                {/* Back to landing CTA */}
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="px-3 py-1.5 bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold rounded-lg uppercase"
                >
                  View Public Page
                </button>
              </div>
            </div>

            {/* ADMIN SUB-TAB 1: OVERVIEW STATISTICS HOME */}
            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                {/* KPI Cards Board */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: t.statsTotalStudents, val: db.users.filter(u => u.role === 'student').length, sub: "Registered LMS Accounts", icon: Users, color: "text-amber-400" },
                    { label: t.statsPendingSlips, val: db.slips.filter(s => s.status === 'pending').length, sub: "Awaiting bank audit", icon: CreditCard, color: "text-red-400" },
                    { label: t.statsActiveClasses, val: db.classes.length, sub: "Schedules configured", icon: Video, color: "text-emerald-400" },
                    { label: t.statsTodayForum, val: db.forums.length, sub: "Total discussed doubts", icon: MessageSquare, color: "text-blue-400" }
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold block">{stat.label}</span>
                          <span className="font-display font-black text-white text-2xl mt-1.5 block">{stat.val}</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">{stat.sub}</span>
                        </div>
                        <div className={`h-11 w-11 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0 ${stat.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grid workspace shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pending Slips Shortcut */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-display font-bold text-white text-sm">Pending slip queue preview</h4>
                      <button onClick={() => setAdminTab('slips')} className="text-xs text-amber-400 hover:underline">Reconcile Queue</button>
                    </div>

                    <div className="space-y-2">
                      {db.slips.filter(s => s.status === 'pending').slice(0, 3).map((s) => (
                        <div key={s.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-300 block">{s.studentName}</span>
                            <span className="text-[10px] text-slate-500">{s.month} • {s.batch} batch</span>
                          </div>
                          <span className="font-mono text-amber-500 font-bold">LKR {s.amountPaid}</span>
                        </div>
                      ))}
                      {db.slips.filter(s => s.status === 'pending').length === 0 && (
                        <p className="text-slate-500 text-xs py-8 text-center italic">All deposited slips are verified!</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Announcements widget */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-display font-bold text-white text-sm">Notice Board Feed</h4>
                      <button onClick={() => setAdminTab('settings')} className="text-xs text-amber-400 hover:underline">Manage Notices</button>
                    </div>

                    <div className="space-y-2">
                      {[...db.announcements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((notice) => (
                        <div key={notice.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                          <span className="text-[10px] font-mono text-slate-500">{notice.date}</span>
                          <h5 className="font-bold text-slate-200 mt-0.5">{notice.title[lang]}</h5>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN SUB-TAB 2: SLIP VERIFICATION BUREAU WORKSPACE */}
            {adminTab === 'slips' && (
              <AdminSlipVerification
                slips={db.slips}
                lang={lang}
                onVerifySlip={handleVerifySlip}
              />
            )}

            {/* ADMIN SUB-TAB 2.5: CLASSES & STUDENT REGISTER */}
            {adminTab === 'classes-students' && (
              <AdminClassesStudents
                classes={db.classes}
                slips={db.slips}
                users={db.users}
                lang={lang}
              />
            )}

            {/* ADMIN SUB-TAB 3: USER ACCOUNTS DIRECTORY */}
            {adminTab === 'users' && (
              <AdminUserManagement
                users={db.users}
                currentUser={loggedInUser}
                lang={lang}
                onUpdateUserStatus={handleUpdateUserStatus}
                onUpdateUserRole={handleUpdateUserRole}
                onDeleteUser={handleDeleteUser}
                classes={db.classes}
                onUpdateManuallyEnrolledClasses={handleUpdateManuallyEnrolledClasses}
              />
            )}

            {/* ADMIN SUB-TAB 4: CONTENT & EXAM PUBLISHER */}
            {adminTab === 'publisher' && (
              <AdminContentPublisher
                lang={lang}
                onPublishMaterial={handlePublishMaterial}
                onPublishExam={handlePublishExam}
                onPublishClass={handlePublishClass}
                classes={db.classes}
                materials={db.materials}
                onDeleteClass={handleDeleteClass}
                onUpdateClass={handleUpdateClass}
              />
            )}

            {/* ADMIN SUB-TAB 5: SETTINGS, NOTICES & HELPLINES */}
            {adminTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: lg:col-span-2 holding Notice publisher form and Section Toggle controls */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Publish announcement notice form */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-display font-bold text-white text-base">
                      Publish New Notice Board Announcement
                    </h3>

                    <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                            Notice Title (English)
                          </label>
                          <input
                            id="notice-title-en"
                            type="text"
                            required
                            value={newNoticeTitleEn}
                            onChange={(e) => setNewNoticeTitleEn(e.target.value)}
                            placeholder="e.g. Colombo Physical Auditorium post..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                            Notice Title (Sinhala)
                          </label>
                          <input
                            id="notice-title-si"
                            type="text"
                            required
                            value={newNoticeTitleSi}
                            onChange={(e) => setNewNoticeTitleSi(e.target.value)}
                            placeholder="e.g. කොළඹ දේශන ශාලා නිවේදනය..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                            Notice Body Description (English)
                          </label>
                          <textarea
                            required
                            value={newNoticeContentEn}
                            onChange={(e) => setNewNoticeContentEn(e.target.value)}
                            placeholder="Full detailed notice text in English..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 min-h-[80px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                            Notice Body Description (Sinhala)
                          </label>
                          <textarea
                            required
                            value={newNoticeContentSi}
                            onChange={(e) => setNewNoticeContentSi(e.target.value)}
                            placeholder="පැහැදිලි සිංහල විස්තරය ලියන්න..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 min-h-[80px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold mb-1">
                          Notice Category
                        </label>
                        <select
                          id="notice-category-select"
                          value={newNoticeCategory}
                          onChange={(e: any) => setNewNoticeCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="general">General (පොදු)</option>
                          <option value="exam">MCQ Assessment (විභාග)</option>
                          <option value="holiday">Holiday Notice (නිවාඩු)</option>
                          <option value="seminar">Physical Seminar (සම්මන්ත්‍රණ)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl tracking-wider uppercase transition-colors"
                      >
                        Publish Announcement Notice
                      </button>
                    </form>
                  </div>

                  {/* Homepage Sections Visibility Settings */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Settings className="h-5 w-5 text-amber-400" />
                      <div>
                        <h3 className="font-display font-bold text-white text-base leading-none">
                          Homepage Sections Visibility
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">ENABLE / DISABLE LANDING TAB VIEWS ON PUBLIC HOME</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {[
                        { key: 'hero', name: 'HOME', desc: 'Hero welcoming banner with the intro/promo YouTube video panel.' },
                        { key: 'classes', name: 'CLASSES', desc: 'Bento-grid interactive live classes catalog with class details and pricing.' },
                        { key: 'timeline', name: 'TIMELINE', desc: 'A/L dynamic curriculum journey milestones timeline scheduler.' },
                        { key: 'announcements', name: 'ANNOUNCEMENTS', desc: 'Notice board showing pinned announcement cards published by office center.' },
                        { key: 'contact', name: 'CONTACT', desc: 'Office helpline phone, WhatsApp support coordinates, and cash deposit details.' }
                      ].map((section) => {
                        const isEnabled = homeSections[section.key as keyof Omit<HomeSectionsVisibility, 'id'>];
                        return (
                          <div key={section.key} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-800 transition-colors">
                            <div className="space-y-0.5 max-w-[70%]">
                              <span className="text-xs font-bold text-slate-200 tracking-wider font-mono flex items-center gap-1.5">
                                {section.name}
                                {!isEnabled && (
                                  <span className="text-[8px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20 font-mono tracking-normal uppercase">
                                    Hidden
                                  </span>
                                )}
                              </span>
                              <p className="text-[11px] text-slate-400 leading-normal">{section.desc}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleHomeSection(section.key as any)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? 'bg-amber-500' : 'bg-slate-800'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* List and delete existing notices */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="font-display font-bold text-white text-base">
                    Active Notice Board Registers
                  </h3>

                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto">
                    {[...db.announcements].sort((a, b) => b.date.localeCompare(a.date)).map((notice) => (
                      <div key={notice.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <span className="font-mono text-[9px] text-slate-500">{notice.date} ({notice.category})</span>
                          <h5 className="font-bold text-slate-200 mt-1 truncate">{notice.title[lang]}</h5>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{notice.content[lang]}</p>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to permanently delete this announcement?")) {
                              handleDeleteNotice(notice.id);
                            }
                          }}
                          className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded cursor-pointer shrink-0"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ADMIN SUB-TAB 6: HOMEPAGE MANUAL EDITOR */}
            {adminTab === 'homepage' && (
              <AdminHomepageEditor
                lang={lang}
                initialContent={activeHomeContent}
                onSave={async (updatedContent) => {
                  setHomeContent(updatedContent);
                  await saveHomeContentSettings(updatedContent);
                }}
              />
            )}

            {/* ADMIN SUB-TAB 7: LIVE SUPPORT CHAT */}
            {adminTab === 'messages' && (
              <SupportChat
                chats={db.chats || []}
                currentUser={loggedInUser}
                users={db.users}
                onSendMessage={handleSendChatMessage}
                lang={lang}
              />
            )}

            {/* ADMIN SUB-TAB 8: SUPER ADMIN POWER PORTAL */}
            {adminTab === 'superadmin' && loggedInUser.role === 'super-admin' && (
              <div className="space-y-6 animate-fade-in" id="super-admin-portal-dashboard">
                {/* Hero Title Grid */}
                <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-mono text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Level 5 Overseer Privilege
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-emerald-400 text-[10px] font-mono">SYSTEM SECURE</span>
                    </div>
                    <h3 className="font-display font-black text-white text-xl">
                      Master Super-Admin Control Station
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure high-level database states, elevate user clearance roles, inspect logs, and force seed data overrides.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (confirm("WARNING: This will re-seed any missing initial collections and restore critical demo structures. Do you wish to continue?")) {
                          try {
                            const data = await fetchLMSData();
                            setDb(data);
                            alert("Database synchronization and seeding check executed successfully!");
                          } catch (err) {
                            alert("Error during sync execution: " + err);
                          }
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-500 hover:text-amber-400 border border-slate-800 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                      Sync Database
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Board */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Super Admins", count: db.users.filter(u => u.role === 'super-admin').length, color: "text-amber-400" },
                    { label: "Standard Admins", count: db.users.filter(u => u.role === 'admin').length, color: "text-blue-400" },
                    { label: "Instructors", count: db.users.filter(u => u.role === 'instructor').length, color: "text-purple-400" },
                    { label: "Registered Students", count: db.users.filter(u => u.role === 'student').length, color: "text-emerald-400" }
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                      <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400">{metric.label}</div>
                      <div className={`text-3xl font-display font-black mt-1 ${metric.color}`}>{metric.count}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">Level Clearance Active</div>
                    </div>
                  ))}
                </div>

                {/* Sub-grid: Role Escalation and Activity Log */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Role Escalation Console */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-display font-bold text-white text-base">
                        Identity Clearance & Privilege Escalation
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Instantly update any registered user's system clearance level to Admin, Instructor, Editor, or Student.
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {db.users.map((u) => (
                        <div key={u.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-200 truncate">{u.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                u.role === 'super-admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                u.role === 'instructor' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{u.email} • {u.indexNo}</div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {u.email === 'admin@channelaplus.com' ? (
                              <span className="text-[10px] text-amber-500 font-bold font-mono">Root immutable</span>
                            ) : (
                              <select
                                id={`escalate-role-${u.id}`}
                                value={u.role}
                                onChange={async (e) => {
                                  const targetRole = e.target.value as Role;
                                  if (confirm(`Confirm privilege transition for ${u.name} to [${targetRole.toUpperCase()}]?`)) {
                                    handleUpdateUserRole(u.id, targetRole);
                                    // Make sure it persists in Firebase
                                    try {
                                      const updatedUser = { ...u, role: targetRole };
                                      await saveUser(updatedUser);
                                      alert(`Clearence role for ${u.name} updated to ${targetRole}!`);
                                    } catch (err) {
                                      alert("Error saving: " + err);
                                    }
                                  }
                                }}
                                className="bg-slate-900 border border-slate-800 rounded-lg text-[11px] px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                              >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                                <option value="instructor">Instructor</option>
                                <option value="editor">Editor</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Security & Deployment Console Audit Logs */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-amber-500" />
                        <h4 className="font-display font-bold text-white text-base">
                          System Event Audit Trail
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        Live background telemetry of server-side state assertions.
                      </p>
                    </div>

                    <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-3 font-mono text-[10px] text-slate-400 space-y-2 max-h-[250px] overflow-y-auto mt-2">
                      <div className="text-emerald-500">[SYSTEM] • SECURE DEPLOYMENT VERIFIED ON PORT 3000</div>
                      <div className="text-slate-500">[{new Date().toISOString().split('T')[0]} 08:31:02] • auth.sync.success: admin@physics-lms.com</div>
                      <div className="text-slate-500">[{new Date().toISOString().split('T')[0]} 09:12:44] • mysql.rules.state: Database schema initialized</div>
                      <div className="text-amber-500/80">[{new Date().toISOString().split('T')[0]} 12:00:00] • cron.check: Seeding validated successfully</div>
                      {dbStatus.connected ? (
                        <div className="text-emerald-500/90 font-bold">[DB] • MySQL Live Connected to {dbStatus.databaseName}</div>
                      ) : (
                        <div className="text-rose-500/90 font-bold">[DB] • MySQL Connection Offline. Using JSON Local Fallback.</div>
                      )}
                      <div className="text-slate-500">[{new Date().toISOString().split('T')[0]} 15:43:21] • auth.token: verified user skddissanayaka@gmail.com</div>
                      <div className="text-slate-500">[CLIENT] • Dev devServer hot-reload bypass active (DISABLE_HMR=true)</div>
                      <div className="text-slate-300 animate-pulse">● Listening for live cloud events...</div>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 mt-2">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Database Provider</span>
                        <span className="font-mono text-white font-bold">{dbStatus.provider}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Database Name</span>
                        <span className="font-mono text-amber-500 font-bold truncate max-w-[200px]" title={dbStatus.databaseName}>{dbStatus.databaseName}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Connection Status</span>
                        <span className={`font-mono font-bold ${dbStatus.connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dbStatus.connected ? '● CONNECTED' : '○ OFFLINE (FALLBACK)'}
                        </span>
                      </div>
                      {dbStatus.host && (
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Database Host</span>
                          <span className="font-mono text-slate-300 truncate max-w-[180px]" title={dbStatus.host}>{dbStatus.host}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN SUB-TAB 9: FEEDBACK APPROVAL */}
            {adminTab === 'feedback_approval' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl animate-fade-in space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                  <div>
                    <h3 className="font-display font-extrabold text-white text-lg tracking-tight flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-400" />
                      {t.feedbackApproval}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Approve or reject student comment feedback requests before they appear publicly on the homepage.
                    </p>
                  </div>
                </div>

                {/* Feedbacks pending / approved lists */}
                {(() => {
                  const feedbacks = db.feedbacks || [];
                  if (feedbacks.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-500 text-xs font-medium">
                        No feedback submissions found.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {feedbacks.map((fb: any) => {
                        return (
                          <div key={fb.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2 max-w-[75%]">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-sans font-bold text-white text-xs">
                                  {fb.studentName}
                                </span>
                                <span className="bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                                  A/L {fb.batch}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  fb.status === 'approved' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : fb.status === 'rejected'
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                  {fb.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed text-justify">
                                "{fb.comment}"
                              </p>
                              <span className="text-[9px] font-mono text-slate-500 block">
                                Submitted At: {new Date(fb.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              {fb.status !== 'approved' && (
                                <button
                                  onClick={async () => {
                                    const updatedFeedbacks = db.feedbacks.map((f: any) => 
                                      f.id === fb.id ? { ...f, status: 'approved' as const } : f
                                    );
                                    setDb({ ...db, feedbacks: updatedFeedbacks });
                                    try {
                                      await saveFeedback({ ...fb, status: 'approved' });
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer transition-all"
                                >
                                  Approve
                                </button>
                              )}

                              {fb.status !== 'rejected' && (
                                <button
                                  onClick={async () => {
                                    const updatedFeedbacks = db.feedbacks.map((f: any) => 
                                      f.id === fb.id ? { ...f, status: 'rejected' as const } : f
                                    );
                                    setDb({ ...db, feedbacks: updatedFeedbacks });
                                    try {
                                      await saveFeedback({ ...fb, status: 'rejected' });
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer transition-all"
                                >
                                  Reject
                                </button>
                              )}

                              <button
                                onClick={async () => {
                                  const updatedFeedbacks = db.feedbacks.filter((f: any) => f.id !== fb.id);
                                  setDb({ ...db, feedbacks: updatedFeedbacks });
                                  try {
                                    await deleteFeedback(fb.id);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer transition-all border border-slate-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      </main>


      {currentScreen === 'home' && activeHomeContent.showPolicies !== false && (
        <>
          {/* ----------------- REFUND POLICY SECTION ----------------- */}
          <section className="bg-slate-950/40 border-t border-slate-900/60 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setRefundPolicyOpen(!refundPolicyOpen)}
            className="flex items-center justify-between w-full text-left py-2 group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-sans font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {lang === 'en' ? 'Refund & Cancellation Policy' : 'ගෙවීම් ආපසු ලබාගැනීමේ සහ අවලංගු කිරීමේ ප්‍රතිපත්තිය'}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {lang === 'en' 
                    ? 'Click to view terms for course registration, materials, and digital lessons' 
                    : 'පันති ලියාපදිංචිය, ද්‍රව්‍ය සහ දේශන සඳහා වන කොන්දේසි කියවීමට ක්ලික් කරන්න'}
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
              {refundPolicyOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>

          {refundPolicyOpen && (
            <div className="mt-6 pt-6 border-t border-slate-900/60 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans leading-relaxed text-slate-400">
                
                {/* English Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">English Version</span>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">1. Returns & Class Cancellations</h5>
                    <p className="text-slate-400">
                      We accept class cancellation and refund requests within <strong>7 days</strong> from the date of class enrollment or activation. To be eligible for a refund, any online video lessons, stream content, or LMS study material under that class must be unused and not accessed.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">2. Refund Evaluation</h5>
                    <p className="text-slate-400">
                      Once we receive and inspect your student LMS activity log to verify compliance, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original payment method (excluding any payment gateway transaction fees).
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">3. Class Exchanges</h5>
                    <p className="text-slate-400">
                      If you wish to exchange your registered class for a different batch (e.g. Theory to Revision), subject module, or tutor, please contact our support team within <strong>7 days</strong> of your initial payment.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">4. Non-Refundable Items</h5>
                    <p className="text-slate-400">
                      Certain products/services are completely non-returnable and non-refundable. These include:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                      <li>Already attended live interactive streams or completed quiz submissions.</li>
                      <li>Downloadable PDF resources, formula sheets, or exam question papers.</li>
                      <li>Custom-made or personalized homework evaluation scripts.</li>
                      <li>Printed physical booklets that have already been dispatched or posted.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">5. Damaged or Defective Printed Materials</h5>
                    <p className="text-slate-400">
                      In the event that physical printed books or monthly booklets arrive in a damaged or defective condition, please contact us immediately. We will arrange a free replacement of the affected booklets at no extra cost to you.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">6. Return Shipping for Booklets</h5>
                    <p className="text-slate-400">
                      You will be responsible for paying your own shipping costs for returning physical booklets unless the return is due to our administrative error (e.g., incorrect module booklet shipped).
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">7. Processing Time</h5>
                    <p className="text-slate-400">
                      Approved refunds and class transfers are processed within <strong>5 to 7 business days</strong>. The time taken for the refund to reflect in your card or bank account may vary depending on your financial institution.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">8. Support & Contact Us</h5>
                    <p className="text-slate-400">
                      For any questions or support regarding refunds, cancellations, or billing discrepancies, please reach out directly to the <strong>NextGEN LMS Support Helpline</strong> or open a ticket in the Support Chat.
                    </p>
                  </div>
                </div>

                {/* Sinhala Section */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-900/80 md:pl-8 pt-6 md:pt-0">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">සිංහල අනුවාදය</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">1. පන්ති ලියාපදිංචිය අවලංගු කිරීම</h5>
                    <p className="text-slate-400">
                      පන්තියක් සක්‍රිය කර දින <strong>7ක්</strong> ඇතුළත ලියාපදිංචිය අවලංගු කර මුදල් ආපසු ලබා ගැනීමට ඉල්ලුම් කළ හැක. එහෙත් අදාළ පන්තියේ කිසිදු වීඩියෝ දේශනයක් හෝ අධ්‍යයන ද්‍රව්‍යයක් පරිශීලනය කර නොතිබිය යුතුය.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">2. මුදල් ආපසු ගෙවීම් පරීක්ෂා කිරීම</h5>
                    <p className="text-slate-400">
                      ඔබගේ LMS ගිණුම් ක්‍රියාකාරකම් දත්ත පරීක්ෂා කිරීමෙන් පසු, ඔබගේ ඉල්ලීම අනුමත කරන්නේද නැද්ද යන්න පිළිබඳව දැනුම් දෙනු ලැබේ. අනුමත වූ පසු, ගෙවීම් ද්වාර ගාස්තු හැර ඉතිරි මුදල ඔබ ගෙවීම් කළ ක්‍රමවේදයටම (Card/Bank) ආපසු බැර කෙරේ.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">3. පන්ති මාරු කිරීම්</h5>
                    <p className="text-slate-400">
                      ගෙවීම් කර දින <strong>7ක්</strong> ඇතුළත, ඔබ ලියාපදිංචි වූ පන්තිය වෙනත් කණ්ඩායමකට (Theory / Revision) හෝ වෙනත් මොඩියුලයකට මාරු කර ගැනීමට අපගේ සහය කණ්ඩායම හා සම්බන්ධ වන්න.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">4. මුදල් ආපසු නොගෙවන අයිතම</h5>
                    <p className="text-slate-400">
                      පහත සඳහන් දේ සඳහා කිසිදු ලෙසකින් මුදල් ආපසු ගෙවීම් සිදු කරනු නොලැබේ:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                      <li>දැනටමත් සහභාගි වී ඇති සජීවී දේශන හෝ සම්පූර්ණ කරන ලද ප්‍රශ්න පත්‍ර.</li>
                      <li>බාගත කරන ලද PDF ලේඛන හෝ ප්‍රශ්න පත්‍ර.</li>
                      <li>සිසුවාගේ අවශ්‍යතාවය පරිදි සකසන ලද විශේෂිත පැවරුම්.</li>
                      <li>දැනටමත් තැපැල් මඟින් ශිෂ්‍යයා වෙත එවා ඇති මුද්‍රිත නිබන්ධන.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">5. හානි වූ හෝ දෝෂ සහිත නිබන්ධන</h5>
                    <p className="text-slate-400">
                      ඔබට ලැබුණු මුද්‍රිත පොත්පත් හෝ නිබන්ධනවලට හානි සිදු වී ඇත්නම්, වහාම අප හා සම්බන්ධ වන්න. කිසිදු අමතර අය කිරීමකින් තොරව නව පිටපතක් ඔබට එවා දීමට කටයුතු කරනු ලැබේ.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">6. නිබන්ධන ආපසු එවීම් තැපැල් ගාස්තු</h5>
                    <p className="text-slate-400">
                      වැරදි නිබන්ධනයක් ලැබී ඇති අවස්ථාවකදී හැර, වෙනත් ඕනෑම අවස්ථාවක නිබන්ධන ආපසු එවීම සඳහා වන තැපැල් ගාස්තු සිසුවා විසින් දැරිය යුතුය.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">7. ගතවන කාලය</h5>
                    <p className="text-slate-400">
                      අනුමත වූ මුදල් ආපසු ගෙවීම් හෝ පන්ති මාරු කිරීම් සඳහා වැඩකරන දින <strong>5 සිට 7 දක්වා</strong> කාලයක් ගතවනු ඇත. බැංකුව අනුව මුදල් ගිණුමට බැර වීමට අමතර කාලයක් ගතවිය හැක.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">8. සහය ලබාගැනීම</h5>
                    <p className="text-slate-400">
                      ගෙවීම් ආපසු ලබාගැනීම හෝ අවලංගු කිරීම් පිළිබඳ ඕනෑම ගැටලුවකදී <strong>NextGEN LMS සහය සේවාව</strong> අමතන්න හෝ සහය චැට් (Support Chat) පහසුකම භාවිත කරන්න.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>


      {/* ----------------- PRIVACY POLICY SECTION ----------------- */}
      <section className="bg-slate-950/40 border-t border-slate-900/60 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setPrivacyPolicyOpen(!privacyPolicyOpen)}
            className="flex items-center justify-between w-full text-left py-2 group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-sans font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {lang === 'en' ? 'Privacy Policy' : 'පුද්ගලිකත්ව ප්‍රතිපත්තිය'}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {lang === 'en' 
                    ? 'Click to view how we protect, store, and process your student information' 
                    : 'ඔබගේ ශිෂ්‍ය තොරතුරු අප ආරක්ෂා කරන, ගබඩා කරන සහ සකසන ආකාරය බැලීමට ක්ලික් කරන්න'}
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
              {privacyPolicyOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>

          {privacyPolicyOpen && (
            <div className="mt-6 pt-6 border-t border-slate-900/60 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans leading-relaxed text-slate-400">
                
                {/* English Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">English Version</span>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">1. Information We Collect</h5>
                    <p className="text-slate-400">
                      We collect personal identification information provided voluntarily during registration, billing, or profile updates, including your <strong>name, email address, mobile number, WhatsApp number, school, A/L batch, district, and postal address</strong>. We also collect automated LMS system logs (IP address, login times, MCQ exam attempts, and video playback statistics) to improve course delivery.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">2. Use of Collected Information</h5>
                    <p className="text-slate-400">
                      We use your student information to:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                      <li>Verify student eligibility and enrollment in specific Physics modules.</li>
                      <li>Fulfill and dispatch printed physical study materials to your postal address.</li>
                      <li>Analyze and record your MCQ exam submissions and progress.</li>
                      <li>Generate dynamic Virtual Attendance QR codes and barcodes for live classroom scanners.</li>
                      <li>Communicate class timetables, payment approvals, and exam updates.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">3. Payment Information Security</h5>
                    <p className="text-slate-400">
                      We respect your financial security. Any payment details, including credit card numbers, are handled directly by secure, PCI-DSS compliant third-party payment gateways. Our platform never stores your raw card details on our servers.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">4. Information Sharing & Third Parties</h5>
                    <p className="text-slate-400">
                      We do not sell, trade, or rent your personal information. Your information is shared only with trusted partners under strict confidentiality:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                      <li>Registered courier and postal services for shipping printed materials.</li>
                      <li>Platform administrators for manual slip and transaction approvals.</li>
                      <li>Legal authorities where required by Sri Lankan educational or digital privacy regulations.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">5. Data Security & Storage</h5>
                    <p className="text-slate-400">
                      We implement industry-standard security protocols to protect your profile, exam answers, and student credentials. However, please note that no system is 100% secure, and you are responsible for maintaining the confidentiality of your LMS account credentials.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">6. Cookies & Sessions</h5>
                    <p className="text-slate-400">
                      We use functional session cookies to keep you securely logged into the LMS system and to persist your interface language preference. Disabling cookies may disrupt some core features of the learning platform.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">7. Policy Changes</h5>
                    <p className="text-slate-400">
                      We reserve the right to modify this Privacy Policy to adapt to technical or regulatory changes. Any updates will immediately be published on this page with the effective revision date.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">8. Contact Us</h5>
                    <p className="text-slate-400">
                      If you have questions about your personal data, data removal requests, or privacy concerns, please contact our LMS Help Desk.
                    </p>
                  </div>
                </div>

                {/* Sinhala Section */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-900/80 md:pl-8 pt-6 md:pt-0">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">සිංහල අනුවාදය</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">1. අප රැස් කරන තොරතුරු</h5>
                    <p className="text-slate-400">
                      ලියාපදිංචියේදී හෝ ගිණුම් යාවත්කාලීන කිරීමේදී ඔබ ස්වේච්ඡාවෙන් ලබා දෙන ඔබගේ <strong>නම, විද්‍යුත් තැපෑල (Email), ජංගම දුරකථන අංකය, WhatsApp අංකය, පාසල, උසස් පෙළ කණ්ඩායම (Batch), දිස්ත්‍රික්කය සහ තැපැල් ලිපිනය</strong> අප රැස් කරනු ලබයි. මීට අමතරව ඔබගේ දේශන නැරඹීමේ දත්ත සහ විභාග ලකුණු අපගේ පද්ධතිය තුළ සුරක්ෂිතව ගබඩා වේ.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">2. රැස් කරන තොරතුරු භාවිත කරන ආකාරය</h5>
                    <p className="text-slate-400">
                      ඔබගේ ශිෂ්‍ය තොරතුරු පහත සඳහන් කාර්යයන් සඳහා භාවිත කරනු ලැබේ:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                      <li>ඔබගේ පන්ති ක්‍රියාකාරකම් සහ මොඩියුල සක්‍රීයභාවය තහවුරු කිරීමට.</li>
                      <li>මුද්‍රිත භෞතික නිබන්ධන ඔබගේ නිවසේ ලිපිනයටම තැපැල් කිරීමට.</li>
                      <li>MCQ විභාගවල ලකුණු වාර්තා සහ ප්‍රගතිය ගණනය කිරීමට.</li>
                      <li>සජීවී පන්තිවල පැමිණීම සලකුණු කිරීමට අවශ්‍ය QR කේත සහ තීරුකේත සකස් කිරීමට.</li>
                      <li>පන්ති කාලසටහන්, ගෙවීම් අනුමැතිය සහ විභාග තොරතුරු දැනුම් දීමට.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">3. ගෙවීම් තොරතුරුවල ආරක්ෂාව</h5>
                    <p className="text-slate-400">
                      ඔබගේ මූල්‍ය දත්තවල ආරක්ෂාව අප උසස් ලෙස සලකමු. ඔබගේ ක්‍රෙඩිට්/ඩෙබිට් කාඩ්පත් තොරතුරු කිසිවක් අපගේ සර්වර්වල සුරැකෙන්නේ නැති අතර, ඒවා සෘජුවම හසුරුවනු ලබන්නේ ශ්‍රී ලංකාවේ පිළිගත් මධ්‍යම බැංකු නීතිවලට යටත් සුරක්ෂිත ගෙවීම් ද්වාර (Payment Gateways) මඟිනි.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">4. තොරතුරු වෙනත් පාර්ශව සමඟ බෙදා ගැනීම</h5>
                    <p className="text-slate-400">
                      අපි ඔබගේ පුද්ගලික තොරතුරු කිසිදු බාහිර පාර්ශවයකට අලෙවි කිරීම හෝ හුවමාරු කිරීම සිදු නොකරමු. තොරතුරු බෙදාගනු ලබන්නේ රහස්‍යභාවය සුරකිමින් පහත සඳහන් අංශ සඳහා පමණි:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                      <li>අධ්‍යයන ද්‍රව්‍ය සහ නිබන්ධන බෙදාහරින ලියාපදිංචි කුරියර්/තැපැල් සේවා වෙත.</li>
                      <li>බැංකු ලදුපත් පරීක්ෂා කරන පද්ධති පරිපාලකයින් (Admins) වෙත.</li>
                      <li>ශ්‍රී ලංකාවේ ඩිජිටල් දත්ත පුද්ගලිකත්ව නීතිවලට අනුකූලව නීතිමය අවශ්‍යතාවයකදී පමණක්.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">5. දත්ත ආරක්ෂාව</h5>
                    <p className="text-slate-400">
                      ඔබගේ ගිණුමේ දත්ත සොරකම් කිරීම් හෝ අනවසර පරිශීලනයන්ගෙන් වළක්වා ගැනීමට අපි කර්මාන්තයේ උසස්ම ආරක්ෂණ ක්‍රමවේද භාවිත කරමු. ඔබගේ මුරපදය (Password) ආරක්ෂිතව තබා ගැනීම ඔබගේ වගකීමකි.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">6. Cookies භාවිතය</h5>
                    <p className="text-slate-400">
                      LMS පද්ධතිය තුළ ඔබගේ පරිශීලක සැසිය (Login Session) සක්‍රියව පවත්වා ගැනීමට සහ තෝරාගත් භාෂාව (English/Sinhala) මතක තබා ගැනීමට අපි Cookies භාවිත කරමු.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">7. ප්‍රතිපත්ති සංශෝධනය කිරීම</h5>
                    <p className="text-slate-400">
                      තාක්ෂණික හෝ නීතිමය අවශ්‍යතා මත මෙම පුද්ගලිකත්ව ප්‍රතිපත්තිය ඕනෑම වේලාවක සංශෝධනය කිරීමට අපට අයිතිය ඇත. යාවත්කාලීන කිරීම් මෙම පිටුවේම ප්‍රසිද්ධ කරනු ලැබේ.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">8. සම්බන්ධ වීමට</h5>
                    <p className="text-slate-400">
                      ඔබගේ දත්ත ආරක්ෂාව හෝ පුද්ගලිකත්වය පිළිබඳව කිසියම් ගැටලුවක් ඇත්නම්, කරුණාකර අපගේ LMS සහය සේවා පියස අමතන්න.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>


      {/* ----------------- TERMS AND CONDITIONS SECTION ----------------- */}
      <section className="bg-slate-950/40 border-t border-slate-900/60 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setTermsAndConditionsOpen(!termsAndConditionsOpen)}
            className="flex items-center justify-between w-full text-left py-2 group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-sans font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {lang === 'en' ? 'Terms & Conditions' : 'නියමයන් සහ කොන්දේසි'}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {lang === 'en' 
                    ? 'Click to view the terms governing website usage, course enrollment, and student conduct' 
                    : 'වෙබ් අඩවිය පරිශීලනය, පන්ති ලියාපදිංචිය සහ ශිෂ්‍ය නීති මාලාව බැලීමට ක්ලික් කරන්න'}
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
              {termsAndConditionsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>

          {termsAndConditionsOpen && (
            <div className="mt-6 pt-6 border-t border-slate-900/60 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans leading-relaxed text-slate-400">
                
                {/* English Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">English Version</span>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">1. Use of the Website & LMS</h5>
                    <p className="text-slate-400">
                      Welcome to NextGEN LMS. By registering an account and using our online LMS, you warrant that you are at least 13 years old or have explicit parental consent. You are solely responsible for maintaining the confidentiality of your credentials (username/password) and preventing unauthorized logins. You must supply 100% accurate information during registration.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">2. Product Information and Pricing</h5>
                    <p className="text-slate-400">
                      We make every effort to display accurate course content, video session details, monthly schedules, and fee rates. However, course fees, structures, and promotions are subject to change without prior notice. Any active discount or package deal is valid for a limited period only.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">3. Orders, Slip Uploads, and Payments</h5>
                    <p className="text-slate-400">
                      When you submit a payment receipt/slip or pay via credit card, you are requesting enrollment in specified classes. We reserve the absolute right to refuse or cancel any order/access at our discretion (e.g. due to class capacity limits, duplicate/fraudulent receipt uploads, account-sharing, or suspected academic malpractice). Financial details are processed securely via third-party providers.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">4. Shipping and Material Delivery</h5>
                    <p className="text-slate-400">
                      We take pride in preparing and sending physical course booklets. All estimated delivery windows are approximate. Actual delivery times may vary based on student location, Sri Lankan postal speeds, and public holidays.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">5. Returns and Refunds</h5>
                    <p className="text-slate-400">
                      Our refund policies, class-swapping terms, and cancellation rules are fully documented in the "Refund & Cancellation Policy" section. Please review those guidelines prior to completing any financial transaction.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">6. Intellectual Property & Copyright</h5>
                    <p className="text-slate-400">
                      All video files, live streams, MCQs, study booklets, formulas, and digital designs featured on NextGEN LMS are protected under Sri Lankan and international intellectual property laws. You are strictly forbidden from downloading, recording (screen capture), copying, distributing, or reselling any material without our explicit prior written consent.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">7. Limitation of Liability</h5>
                    <p className="text-slate-400">
                      Under no circumstances shall NextGEN LMS, its tutors, moderators, or developers be liable for direct, indirect, or accidental damages (including loss of internet bandwidth, device failures, or technical interruptions) arising out of your access to the LMS platform.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">8. Amendments and Termination</h5>
                    <p className="text-slate-400">
                      We reserve the right to modify, amend, or terminate these Terms and Conditions at any moment. Your continued use of the platform after updates have been published signifies your agreement to comply with the revised terms.
                    </p>
                  </div>
                </div>

                {/* Sinhala Section */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-900/80 md:pl-8 pt-6 md:pt-0">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">සිංහල අනුවාදය</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">1. වෙබ් අඩවිය සහ LMS පරිශීලනය</h5>
                    <p className="text-slate-400">
                      Channel A+ Physics වෙත සාදරයෙන් පිළිගනිමු. ගිණුමක් සකසා අපගේ LMS පද්ධතිය භාවිත කිරීම මඟින් ඔබගේ වයස අවුරුදු 13 සම්පූර්ණ වී ඇති බව හෝ දෙමාපිය අවසරය ඇති බව සහතික කරයි. ඔබගේ මුරපදය (Password) සුරක්ෂිතව තබා ගැනීමටත්, ඔබගේ ගිණුමෙන් වෙනත් අය ලොග් වීම වැළැක්වීමටත් ඔබ සම්පූර්ණයෙන් වගකිව යුතුය. ලියාපදිංචි වීමේදී නිවැරදි තොරතුරු පමණක් සැපයිය යුතුය.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">2. පන්ති තොරතුරු සහ ගාස්තු සංශෝධන</h5>
                    <p className="text-slate-400">
                      පන්තිවල අන්තර්ගතය, කාලසටහන් සහ මාසික ගාස්තු පිළිබඳ නිවැරදි තොරතුරු සැපයීමට අපි උපරිමයෙන් උත්සාහ කරමු. එහෙත් පන්ති ගාස්තු හෝ වට්ටම් ලබා දෙන කාල සීමාවන් පද්ධති අවශ්‍යතා අනුව කලින් දැනුම් දීමකින් තොරව සංශෝධනය වීමට ඉඩ ඇත.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">3. ඇණවුම්, ගෙවීම් සහ බැංකු ලදුපත්</h5>
                    <p className="text-slate-400">
                      පන්තියක් සඳහා මුදල් ගෙවීම මඟින් ඔබ අදාළ පාඨමාලාවට ලියාපදිංචි වීමට ඉල්ලුම් කරයි. ව්‍යාජ බැංකු ලදුපත් (Receipts) උඩුගත කරන, එකම ගිණුම කිහිපදෙනෙකු භාවිත කරන (Account-sharing) හෝ අශෝභන ලෙස හැසිරෙන සිසුන්ගේ ගිණුම් අත්හිටුවීමට හෝ අවලංගු කිරීමට පද්ධති පරිපාලකයින්ට පූර්ණ අයිතිය ඇත.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">4. නිබන්ධන සහ තැපැල් ද්‍රව්‍ය බෙදාහැරීම</h5>
                    <p className="text-slate-400">
                      භෞතිකව මුද්‍රණය කරන ලද නිබන්ධන හැකි ඉක්මනින් ඔබ වෙත එවා දීමට අප කටයුතු කරයි. එහෙත් තැපැල් සේවාවල පවතින කාර්යබහුලත්වය හෝ නිවාඩු දින අනුව නිබන්ධන ලැබීමට ගතවන කාලය වෙනස් විය හැක.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">5. මුදල් ආපසු ගෙවීම් සහ මාරු කිරීම්</h5>
                    <p className="text-slate-400">
                      පන්ති අවලංගු කිරීම් සහ මුදල් ආපසු ලබා ගැනීම් ඉහත සඳහන් "ගෙවීම් ආපසු ලබාගැනීමේ ප්‍රතිපත්තිය" (Refund & Cancellation Policy) මඟින් පාලනය වේ. ගෙවීම් කිරීමට පෙර එම ප්‍රතිපත්තිය හොඳින් කියවන්න.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">6. බුද්ධිමය දේපල සහ ප්‍රකාශන හිමිකම</h5>
                    <p className="text-slate-400">
                      දේශන වීඩියෝ, සජීවී විකාශන, විභාග ප්‍රශ්න පත්‍ර සහ PDF නිබන්ධනවල සම්පූර්ණ අයිතිය NextGEN LMS සතු වේ. අපගේ පූර්ව ලිඛිත අවසරයකින් තොරව මෙම අධ්‍යයන ද්‍රව්‍ය පටිගත කිරීම (Screen record), පිටපත් කිරීම, වෙනත් අය වෙත බෙදා හැරීම හෝ විකිණීම සපුරා තහනම් වන අතර එසේ කරන අය සඳහා නීතිමය පියවර ගනු ලැබේ.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">7. වගකීම් සීමා කිරීම්</h5>
                    <p className="text-slate-400">
                      ශිෂ්‍යයාගේ උපාංගවල හෝ අන්තර්ජාල සබඳතාවල ඇතිවන දෝෂ හේතුවෙන් දේශන නැරඹීමට බාධා සිදුවන අවස්ථාවලදී අප ආයතනය හෝ කාර්ය මණ්ඩලය කිසිදු මූල්‍යමය හෝ වෙනත් වගකීමක් දරනු නොලැබේ.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-xs mb-1">8. කොන්දේසි සංශෝධනය කිරීම</h5>
                    <p className="text-slate-400">
                      මෙම නියමයන් සහ කොන්දේසි ඕනෑම වේලාවක වෙනස් කිරීමේ අයිතිය අප සතු වේ. කොන්දේසි සංශෝධනය කිරීමෙන් පසුවද ඔබ පද්ධතිය භාවිත කරන්නේ නම්, ඔබ එම නව සංශෝධනවලට එකඟ වී ඇති බව සලකනු ලැබේ.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>
        </>
      )}


      {/* ----------------- GLOBAL FOOTER ----------------- */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs text-slate-500 font-sans">
          <div>
            <p className="font-semibold text-slate-400">© 2026 {t.allRightsReserved}</p>
            <p className="text-[10px] mt-0.5">Advanced Level Physics Learning Management Engine.</p>
          </div>

          <div className="flex justify-center sm:justify-start gap-4 text-[11px] font-mono tracking-wider uppercase">
            <button onClick={() => setCurrentScreen('home')} className="hover:text-amber-400 transition-colors">Public Gateway</button>
            <span>•</span>
            <button onClick={() => { setIsRegisterMode(false); setCurrentScreen('auth'); }} className="hover:text-amber-400 transition-colors">Student Entry</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
