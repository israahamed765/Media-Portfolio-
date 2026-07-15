import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MediaShowcase from './components/MediaShowcase';
import Skills from './components/Skills';
import ContactForm from './components/ContactForm';
import AdminModal from './components/AdminModal';

import { ProfileData, ProjectData, SkillData, ContactMessage } from './types';
import { 
  INITIAL_PROFILE, 
  INITIAL_PROJECTS, 
  INITIAL_SKILLS, 
  INITIAL_MESSAGES 
} from './initialData';

import { Sparkles, ArrowUp, Lock, Mail, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { 
  getPortfolioData, 
  savePortfolioData, 
  getContactMessages, 
  sendContactMessage 
} from './lib/firebase';

export default function App() {
  // 1. Language state: العربي / English (Defaults to 'ar' Arabic as requested)
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('mansour_media_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const isAr = lang === 'ar';

  // Apply layout direction cleanly
  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('mansour_media_lang', lang);
  }, [lang, isAr]);

  // Loading indicator for cloud sync
  const [isLoading, setIsLoading] = useState(true);

  // 2. Portfolio Datasets
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);
  const [skills, setSkills] = useState<SkillData[]>(INITIAL_SKILLS);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);

  // 3. Admin control modal & identity logs
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('mansour_media_is_auth') === 'true';
  });

  // Load everything from Firestore on startup
  useEffect(() => {
    let active = true;
    async function loadCloudData() {
      try {
        const data = await getPortfolioData({
          profile: INITIAL_PROFILE,
          projects: INITIAL_PROJECTS,
          skills: INITIAL_SKILLS
        });
        
        const fetchedMessages = await getContactMessages();

        if (active) {
          if (data) {
            let loadedProfile = data.profile;
            const hasOldMetrics = !loadedProfile.metrics || 
              loadedProfile.metrics.length !== 4 || 
              loadedProfile.metrics.some(m => m.id.startsWith('metric-'));

            if (hasOldMetrics) {
              console.log("Old quantitative metrics detected. Migrating portfolio to the new Social & Cloud Connect profiles...");
              loadedProfile = {
                ...loadedProfile,
                metrics: INITIAL_PROFILE.metrics
              };
              // Save clean state to Firestore
              savePortfolioData(loadedProfile, data.projects, data.skills).catch(e => {
                console.error("Failed to auto-migrate portfolio metrics in Firestore:", e);
              });
            }

            setProfile(loadedProfile);
            setProjects(data.projects);
            setSkills(data.skills);

            // Cleanly overwrite any old local cache with the newest Nada Hamad info
            localStorage.setItem('mansour_media_profile', JSON.stringify(loadedProfile));
            localStorage.setItem('mansour_media_projects', JSON.stringify(data.projects));
            localStorage.setItem('mansour_media_skills', JSON.stringify(data.skills));
          }
          if (fetchedMessages) {
            setMessages(fetchedMessages);
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio from cloud, falling back to local storage:", err);
        // Fallback to localStorage if any network problem
        const savedProfile = localStorage.getItem('mansour_media_profile');
        const savedProjects = localStorage.getItem('mansour_media_projects');
        const savedSkills = localStorage.getItem('mansour_media_skills');
        const savedMessages = localStorage.getItem('mansour_media_messages');

        if (active) {
          if (savedProfile) {
            let parsedProfile = JSON.parse(savedProfile) as ProfileData;
            const containsTariq = (str?: string) => {
              if (!str) return false;
              const normalized = str.toLowerCase();
              return normalized.includes("tariq") || normalized.includes("mansour") || normalized.includes("طارق") || normalized.includes("منصور");
            };
            if (parsedProfile.name && (containsTariq(parsedProfile.name.en) || containsTariq(parsedProfile.name.ar))) {
              parsedProfile = INITIAL_PROFILE;
            }
            setProfile(parsedProfile);
          } else {
            setProfile(INITIAL_PROFILE);
          }
          if (savedProjects) setProjects(JSON.parse(savedProjects));
          if (savedSkills) setSkills(JSON.parse(savedSkills));
          if (savedMessages) setMessages(JSON.parse(savedMessages));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadCloudData();
    return () => {
      active = false;
    };
  }, []);

  // Keep login session cached
  useEffect(() => {
    localStorage.setItem('mansour_media_is_auth', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // 4. Save states permanently to Firestore & LocalStorage
  const handleSaveAll = async () => {
    try {
      // 1. Save locally as immediate backup
      localStorage.setItem('mansour_media_profile', JSON.stringify(profile));
      localStorage.setItem('mansour_media_projects', JSON.stringify(projects));
      localStorage.setItem('mansour_media_skills', JSON.stringify(skills));
      
      // 2. Save permanently to Cloud Firestore
      await savePortfolioData(profile, projects, skills);
    } catch (err) {
      console.error("Failed to save portfolio to Firestore:", err);
      throw err;
    }
  };

  // 5. Handle Guest Messages incoming validation
  const handleSendMessage = async (newMsg: Omit<ContactMessage, 'id' | 'timestamp' | 'isRead'>) => {
    const timeFormatted = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    // Save to Firestore first and get the generated ID
    try {
      const msgData = {
        timestamp: timeFormatted,
        isRead: false,
        ...newMsg
      };
      
      const firestoreId = await sendContactMessage(msgData);
      
      const msg: ContactMessage = {
        id: firestoreId,
        ...msgData
      };

      const updatedMessages = [msg, ...messages];
      setMessages(updatedMessages);

      // Backup locally
      localStorage.setItem('mansour_media_messages', JSON.stringify(updatedMessages));
    } catch (err) {
      console.error("Failed to send message to cloud:", err);
      // Fallback local-only save if offline
      const msg: ContactMessage = {
        id: `msg-${Date.now()}`,
        timestamp: timeFormatted,
        isRead: false,
        ...newMsg
      };
      const updatedMessages = [msg, ...messages];
      setMessages(updatedMessages);
      localStorage.setItem('mansour_media_messages', JSON.stringify(updatedMessages));
    }
  };

  // Safe alert and confirm dialog states in App.tsx to prevent sandboxed iframe blocks
  const [appAlert, setAppAlert] = useState<string | null>(null);
  const [appConfirm, setAppConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const handleResetData = () => {
    setAppConfirm({
      message: isAr ? "هل تود استعادة البيانات الافتراضية والمسح الكلي للتعديلات؟" : "Reset portfolio showcase to original default states?",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          setProfile(INITIAL_PROFILE);
          setProjects(INITIAL_PROJECTS);
          setSkills(INITIAL_SKILLS);
          setMessages(INITIAL_MESSAGES);
          
          localStorage.removeItem('mansour_media_profile');
          localStorage.removeItem('mansour_media_projects');
          localStorage.removeItem('mansour_media_skills');
          localStorage.removeItem('mansour_media_messages');

          // Reset Cloud Firestore as well!
          await savePortfolioData(INITIAL_PROFILE, INITIAL_PROJECTS, INITIAL_SKILLS);
          setAppAlert(isAr ? "تمت إعادة تعيين البيانات للافتراضية بنجاح!" : "Reverted safely to defaults.");
        } catch (err) {
          console.error("Failed to reset Firestore data:", err);
          setAppAlert(isAr ? "حدث خطأ أثناء الاتصال بالسيرفر لإعادة التعيين." : "Reset failed. Cloud error.");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Smooth scroll helper for contact anchors
  const scrollToContact = () => {
    const domElement = document.getElementById('contact-relations');
    if (domElement) {
      domElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gorgeous minimal screen loading spinner during cloud synchronization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="relative flex flex-col items-center gap-6">
          {/* Pulsing ring indicator */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full border border-copper-500/20 animate-ping" />
            <div className="w-12 h-12 rounded-full border-2 border-t-copper-500 border-r-copper-500 border-slate-800 animate-spin flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-copper-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase font-mono">
              {isAr ? "تحديث السحابة التفاعلية" : "Synchronizing Cloud Core"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {isAr ? "يرجى الانتظار قليلاً لمزامنة أحدث البيانات المنشورة..." : "Retrieving the latest published media profiles..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col selection:bg-copper-100 selection:text-copper-900 ${isAr ? 'arabic-text' : 'english-text'}`}>
      
      {/* 1. Header Logo & Switch Bar */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        profile={profile}
      />

      {/* 2. Main Experience Flow */}
      <main className="flex-1">
        
        {/* Profile Card Intro Capsule */}
        <Hero 
          lang={lang} 
          profile={profile} 
          onContactClick={scrollToContact} 
        />

        {/* Dynamic Project Tabs Grid */}
        <MediaShowcase 
          lang={lang} 
          projects={projects} 
        />

        {/* Skill Percent Rates */}
        <Skills 
          lang={lang} 
          skills={skills} 
        />

        {/* Secure Message Inbox Submitter */}
        <ContactForm 
          lang={lang} 
          onSendMessage={handleSendMessage} 
          profileName={profile.name}
        />

      </main>

      {/* 3. Footer Area & Secret Panel Trigger */}
      <footer className="bg-slate-950 text-slate-400 py-12 md:py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-900">
            <div>
              <div className="flex items-center gap-2 text-white mb-2 font-mono">
                <Sparkles className="w-5 h-5 text-copper-500" />
                <span className="font-bold tracking-wider text-base">
                  {isAr ? profile.name.ar : profile.name.en}
                </span>
              </div>
              <p className="text-xs max-w-sm text-slate-400 leading-relaxed font-cairo">
                {isAr 
                  ? "السجل الإعلامي ومكتب الصحافة التفاعلية المتوافق مع الهواتف الذكية ومحركات البحث المتقدمة."
                  : "Interactive public press kit and media registry for live television anchors and documentary reporting."}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold">
              <a href="#hero-section" className="hover:text-copper-500 transition-colors">
                {isAr ? "الرئيسية" : "Top"}
              </a>
              <a href="#media-showcase" className="hover:text-copper-500 transition-colors">
                {isAr ? "معرض الأعمال" : "Showcase"}
              </a>
              <a href="#professional-skills" className="hover:text-copper-500 transition-colors">
                {isAr ? "المهارات المتخصصة" : "Expertise"}
              </a>
              <a href="#contact-relations" className="hover:text-copper-500 transition-colors">
                {isAr ? "حجوزات واستشارات" : "Bookings"}
              </a>
            </div>
          </div>

          {/* Subfooter section with discrete developer login shortcuts */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs">
            <p className="text-slate-500 font-medium">
              © 2026 {isAr ? "اسراء حمد" : "Israa Hamad"}. {isAr ? "جميع الحقوق محفوظة. تم تطوير وتصميم هذا التطبيق بواسطة إسراء حمد." : "All rights reserved. Designed & Developed by Israa Hamad."}
            </p>

            {/* Discreet Management Keys */}
            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="hover:text-copper-500 flex items-center gap-1 transition-colors cursor-pointer"
                id="footer-admin-trigger"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? "بوابة الإدارة والتراخيص" : "Management Gateway"}</span>
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={handleResetData}
                  className="hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                  id="footer-reset-trigger"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? "استعادة التعيين" : "Wipe & Hard Reset"}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </footer>

      {/* 4. Interactive Live-Editing Administrator Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <AdminModal 
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            lang={lang}
            setLang={setLang}
            profile={profile}
            setProfile={setProfile}
            projects={projects}
            setProjects={setProjects}
            skills={skills}
            setSkills={setSkills}
            messages={messages}
            setMessages={setMessages}
            onSaveAll={handleSaveAll}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
          />
        )}
      </AnimatePresence>

      {/* App-level Safe Confirm Overlay */}
      <AnimatePresence>
        {appConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3.5">
                <ShieldCheck className="w-6 h-6 text-red-650" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 font-sans">
                {isAr ? "هل أنت متأكد؟" : "Are you sure?"}
              </h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                {appConfirm.message}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    appConfirm.onConfirm();
                    setAppConfirm(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? "استعادة التعيين" : "Wipe Data"}
                </button>
                <button
                  type="button"
                  onClick={() => setAppConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200"
                >
                  {isAr ? "إلغاء الأمر" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App-level Safe Alert Overlay */}
      <AnimatePresence>
        {appAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-920/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3.5">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 font-sans">
                {isAr ? "تنبيه النظام" : "Notification"}
              </h4>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                {appAlert}
              </p>
              <button
                type="button"
                onClick={() => setAppAlert(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-copper-600 text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? "موافق" : "Got it"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
