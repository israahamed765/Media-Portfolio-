import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileData, ProjectData, SkillData, ContactMessage, MediaCategory } from '../types';
import { 
  X, Lock, Unlock, Save, Plus, Trash2, Edit2, Check, AlertCircle, Menu, Languages,
  Tv, Mic, Search, FileText, Edit3, Volume2, Award, Users, Mail, Eye, Key, Layers, Upload
} from 'lucide-react';
import { deleteMessageFromFirestore, updateMessageReadStatus } from '../lib/firebase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
  profile: ProfileData;
  setProfile: (p: ProfileData) => void;
  projects: ProjectData[];
  setProjects: (p: ProjectData[]) => void;
  skills: SkillData[];
  setSkills: (s: SkillData[]) => void;
  messages: ContactMessage[];
  setMessages: (m: ContactMessage[]) => void;
  onSaveAll: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export default function AdminModal({
  isOpen,
  onClose,
  lang,
  setLang,
  profile,
  setProfile,
  projects,
  setProjects,
  skills,
  setSkills,
  messages,
  setMessages,
  onSaveAll,
  isAdminLoggedIn,
  setIsAdminLoggedIn
}: AdminModalProps) {
  const isAr = lang === 'ar';
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom dialogs to prevent sandboxed iframe blocks
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [alertModal, setAlertModal] = useState<string | null>(null);

  // Helper to load files directly from computer as Base64 strings
  const handleFileAsBase64 = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Active Management Tab inside Dashboard
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'bio' | 'projects' | 'skills' | 'inbox' | 'backup'>('basic');
  const [isMobileTabsOpen, setIsMobileTabsOpen] = useState(false);

  // Local creation states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Omit<ProjectData, 'id'>>({
    category: 'video',
    title: { ar: '', en: '' },
    publisher: { ar: '', en: '' },
    description: { ar: '', en: '' },
    link: '',
    date: '',
    imageUrl: ''
  });

  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<Omit<SkillData, 'id'>>({
    name: { ar: '', en: '' },
    level: 90,
    iconName: 'Tv',
    category: { ar: 'الأداء والتقديم', en: 'Presentation' }
  });

  if (!isOpen) return null;

  // Handle Log In Check
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Core built-in passcode is 'admin123'
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      setPassword('');
    } else {
      setLoginError(isAr ? 'خطأ في كلمة المرور! حاول مرة أخرى.' : 'Incorrect passcode! Try again.');
    }
  };

  // Profile Edit Callback
  const handleProfileFieldChange = (
    section: 'name' | 'title' | 'bio', 
    fieldLang: 'ar' | 'en', 
    value: string
  ) => {
    const updated = { ...profile };
    updated[section][fieldLang] = value;
    setProfile(updated);
  };

  const [cvError, setCvError] = useState<string | null>(null);

  const handleCvUrlChange = (value: string) => {
    const updated = { ...profile };
    updated.cvUrl = value;
    setProfile(updated);
  };

  const handleCvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 7 * 1024 * 1024) {
      setCvError(isAr 
        ? "حجم الملف كبير جداً. يرجى اختيار ملف سيرة ذاتية أصغر من 7 ميجابايت." 
        : "File is too large. Please select a CV file smaller than 7MB."
      );
      return;
    }

    setCvError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleCvUrlChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Profile Metrics Edit Callback
  const handleMetricValueChange = (metricId: string, value: string) => {
    const updated = { ...profile };
    updated.metrics = updated.metrics.map(m => m.id === metricId ? { ...m, value } : m);
    setProfile(updated);
  };

  const handleMetricLabelChange = (metricId: string, labelLang: 'ar' | 'en', value: string) => {
    const updated = { ...profile };
    updated.metrics = updated.metrics.map(m => m.id === metricId ? {
      ...m,
      label: { ...m.label, [labelLang]: value }
    } : m);
    setProfile(updated);
  };

  const handleMetricLinkChange = (metricId: string, link: string) => {
    const updated = { ...profile };
    updated.metrics = updated.metrics.map(m => m.id === metricId ? { ...m, link } : m);
    setProfile(updated);
  };

  // Add/Edit Project Action
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.ar.trim() || !projectForm.title.en.trim()) {
      setAlertModal(isAr ? "برجاء كتابة عنوان المقال باللغتين." : "Please fill in project titles first.");
      return;
    }

    if (editingProjectId) {
      // Editing
      const updated = projects.map(p => p.id === editingProjectId ? { ...p, ...projectForm } : p);
      setProjects(updated);
      setEditingProjectId(null);
    } else {
      // Adding new
      const newItem: ProjectData = {
        id: `proj-${Date.now()}`,
        ...projectForm
      };
      setProjects([newItem, ...projects]);
    }

    // Reset Form
    setProjectForm({
      category: 'video',
      title: { ar: '', en: '' },
      publisher: { ar: '', en: '' },
      description: { ar: '', en: '' },
      link: '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: ''
    });
  };

  const handleStartEditProject = (proj: ProjectData) => {
    setEditingProjectId(proj.id);
    setProjectForm({
      category: proj.category,
      title: { ...proj.title },
      publisher: { ...proj.publisher },
      description: { ...proj.description },
      link: proj.link,
      date: proj.date,
      imageUrl: proj.imageUrl || ''
    });
  };

  const handleDeleteProject = (id: string) => {
    setConfirmModal({
      message: isAr ? "هل أنت متأكد من حذف هذه المادة التحريرية؟" : "Confirm deleting this showcase item?",
      onConfirm: () => {
        setProjects(projects.filter(p => p.id !== id));
        if (editingProjectId === id) {
          setEditingProjectId(null);
        }
      }
    });
  };

  // Add/Edit Skill Action
  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.ar.trim() || !skillForm.name.en.trim()) {
      setAlertModal(isAr ? 'برجاء ملء مسمى المهارة باللغتين.' : 'Please add skill text.');
      return;
    }

    if (editingSkillId) {
      const updated = skills.map(s => s.id === editingSkillId ? { ...s, ...skillForm } : s);
      setSkills(updated);
      setEditingSkillId(null);
    } else {
      const newItem: SkillData = {
        id: `skill-${Date.now()}`,
        ...skillForm
      };
      setSkills([...skills, newItem]);
    }

    // Reset Form
    setSkillForm({
      name: { ar: '', en: '' },
      level: 90,
      iconName: 'Tv',
      category: { ar: 'الأداء والتقديم', en: 'Presentation' }
    });
  };

  const handleStartEditSkill = (skill: SkillData) => {
    setEditingSkillId(skill.id);
    setSkillForm({
      name: { ...skill.name },
      level: skill.level,
      iconName: skill.iconName,
      category: { ...skill.category }
    });
  };

  const handleDeleteSkill = (id: string) => {
    setConfirmModal({
      message: isAr ? "حذف هذه المهارة المتخصصة؟" : "Delete this skill card?",
      onConfirm: () => {
        setSkills(skills.filter(s => s.id !== id));
        if (editingSkillId === id) {
          setEditingSkillId(null);
        }
      }
    });
  };

  // Visitor Message Inbox Ops
  const toggleMessageRead = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    const newReadStatus = !msg.isRead;
    const updated = messages.map(m => m.id === id ? { ...m, isRead: newReadStatus } : m);
    setMessages(updated);
    
    try {
      await updateMessageReadStatus(id, newReadStatus);
    } catch (err) {
      console.error("Cloud status update failed:", err);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setConfirmModal({
      message: isAr ? "مسح هذه الرسالة بشكل دائم؟" : "Delete this guest message permanently?",
      onConfirm: async () => {
        const originalMessages = [...messages];
        setMessages(messages.filter(m => m.id !== id));
        
        try {
          await deleteMessageFromFirestore(id);
        } catch (err) {
          console.error("Cloud message deletion failed:", err);
          // Rollback on failure
          setMessages(originalMessages);
          setAlertModal(isAr ? "فشل حذف الرسالة من السيرفر." : "Failed to delete message from cloud.");
        }
      }
    });
  };

  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex flex-col font-sans" id="admin-workspace-layer">
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative bg-slate-50 w-full min-h-screen flex flex-col"
        id="admin-dashboard-container"
      >
        
        {/* Top Header controls - For Login state, or Mobile View of Dashboard only */}
        {!isAdminLoggedIn ? (
          <div className="bg-slate-900 text-slate-50 p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Unlock className="w-4.5 h-4.5 text-copper-500" />
              <span className="text-xs font-bold tracking-wider uppercase">
                {isAr ? "مدخل الإدارة الآمن" : "Secure Gatekeeper"}
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 bg-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              id="admin-modal-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Sticky Header Bar for Desktop & Mobile - Matches design requirements EXACTLY */
          <div className="bg-white border-b border-slate-250/60 p-3.5 flex items-center justify-between sticky top-0 z-30" id="admin-sticky-header-bar">
            {/* Save button in top navbar */}
            <button
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onSaveAll();
                  setAlertModal(isAr ? "تم حفظ كافة التعديلات بنجاح في قاعدة البيانات السحابية!" : "All updates saved successfully to the cloud database!");
                } catch (err) {
                  console.error(err);
                  setAlertModal(isAr 
                    ? "عذراً، فشل حفظ البيانات في السحابة. يرجى مراجعة اتصال الإنترنت الخاص بك. في حال استمرار المشكلة، قد يكون حجم الملفات المرفقة كبيراً جداً." 
                    : "Sorry, saving to the cloud failed. Please check your internet connection. If this persists, it could be due to attachment file sizes being too large.");
                } finally {
                  setIsSaving(false);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#a26838] hover:bg-[#8b552c] text-white text-[12px] font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              id="mobile-quick-save-btn"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isAr ? "حفظ" : "Save"}</span>
                </>
              )}
            </button>

            {/* Center: Status badge "لوحة الإدارة" with green checkmark pill */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full shadow-3xs" id="mobile-status-badge">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                {isAr ? "لوحة الإدارة" : "Dashboard Active"}
              </span>
            </div>

            {/* Right Side: Language Switcher, Hamburger button, and Close button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLang(isAr ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] sm:text-[11px] font-bold border border-slate-200/60 cursor-pointer"
                id="admin-lang-toggle-btn-mobile"
              >
                <Languages className="w-3.5 h-3.5 text-copper-600" />
                <span>{isAr ? "EN" : "عربي"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileTabsOpen(true)}
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer transition-colors border border-slate-200/60"
                id="mobile-tabs-hamburger-btn"
              >
                <Menu className="w-3.5 h-3.5 text-slate-600" />
                <span className="sr-only">Menu</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-00 hover:text-red-650 transition-colors text-[11px] font-bold cursor-pointer border border-slate-200/60"
                id="admin-desktop-top-close-btn"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isAr ? "إغلاق" : "Close"}</span>
              </button>
            </div>
          </div>
        )}

        {/* LOG IN SCREEN (If not authenticated yet) */}
        {!isAdminLoggedIn ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 max-w-sm mx-auto flex flex-col justify-center items-center">
            <div className="w-14 h-14 rounded-full bg-copper-50 text-copper-600 flex items-center justify-center border border-copper-100 mb-5">
              <Lock className="w-6 h-6" />
            </div>
            
            <h4 className="text-base font-bold text-slate-950 mb-1 text-center">
              {isAr ? "تسجيل الدخول - قسم الإدارة" : "Administration Panel Login"}
            </h4>
            
            <p className="text-[11px] text-slate-500 mb-5 text-center leading-relaxed">
              {isAr 
                ? "الرجاء إدخال كلمة المرور لتفعيل خيارات التعديل والمزامنة لملفات معرض الأعمال والمهارات الشخصية." 
                : "Please enter your administrative password to verify owner credentials."}
            </p>

            <form onSubmit={handleLoginSubmit} className="w-full space-y-4 shadow-sm bg-white p-5 rounded-2xl border border-slate-200" id="admin-login-form">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-650 text-[11px] font-bold border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isAr ? "كلمة مرور النظام" : "System Password"}
                </label>
                <div className="relative">
                  <Key className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:bg-white focus:border-copper-500 transition-colors"
                    id="admin-password-input"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-copper-600 text-white font-extrabold text-xs tracking-wide shadow-xs transition-colors cursor-pointer"
                id="admin-login-button"
              >
                {isAr ? "تحقق ودخول" : "Authenticate & Open"}
              </motion.button>
            </form>
          </div>
        ) : (
          /* FULL CONTROL PANEL DASHBOARD (Once Admin is Logged In) */
          <div className={`flex-1 flex flex-col ${isAr ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-0 relative`}>
            
            {/* Mobile Drawer Overlay & Sliding Side Drawer */}
            <AnimatePresence>
              {isMobileTabsOpen && (
                <div className="fixed inset-0 z-50 md:hidden" id="mobile-drawer-layer">
                  {/* Backdrop Overlay with separate clean fade */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
                    onClick={() => setIsMobileTabsOpen(false)}
                    id="mobile-drawer-backdrop"
                  />

                  {/* Sliding Side Drawer explicitly anchored to right-0 for Arabic and left-0 for English */}
                  <motion.div
                    initial={{ x: isAr ? '100%' : '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: isAr ? '100%' : '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className={`fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} w-[285px] h-full bg-white flex flex-col p-5 shadow-2xl z-10`}
                    onClick={(e) => e.stopPropagation()}
                    id="mobile-drawer-content"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-1.5 px-0.5">
                        <Unlock className="w-3.5 h-3.5 text-copper-600" />
                        <span className="text-[12px] font-black text-slate-800 tracking-tight">
                          {isAr ? "قائمة تبويبات لوحة التحكم" : "Control Hub Tabs"}
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsMobileTabsOpen(false)}
                        className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                        id="mobile-drawer-close-btn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mobile Drawer Navigation Lists */}
                    <div className="flex flex-col gap-1.5 flex-grow" id="mobile-drawer-tabs-stack">
                      <button
                        onClick={() => { setActiveSubTab('basic'); setIsMobileTabsOpen(false); }}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          activeSubTab === 'basic' 
                            ? 'bg-copper-50 text-copper-750 border-r-4 border-[#a26838]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        id="mb-tab-basic"
                      >
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>{isAr ? "الواجهة الأساسية" : "Home Settings"}</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('bio'); setIsMobileTabsOpen(false); }}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          activeSubTab === 'bio' 
                            ? 'bg-copper-50 text-copper-750 border-r-4 border-[#a26838]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        id="mb-tab-bio"
                      >
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>{isAr ? "نبذة وتواصل" : "Biography Settings"}</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('skills'); setIsMobileTabsOpen(false); }}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          activeSubTab === 'skills' 
                            ? 'bg-copper-50 text-copper-750 border-r-4 border-[#a26838]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        id="mb-tab-skills"
                      >
                        <Award className="w-4 h-4 text-slate-500" />
                        <span>{isAr ? "تعديل المهارات" : "Capabilities Panel"}</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('projects'); setIsMobileTabsOpen(false); }}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          activeSubTab === 'projects' 
                            ? 'bg-copper-50 text-copper-750 border-r-4 border-[#a26838]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        id="mb-tab-projects"
                      >
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>{isAr ? "لوحة المشاريع" : "Project Showcase"}</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('inbox'); setIsMobileTabsOpen(false); }}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          activeSubTab === 'inbox' 
                            ? 'bg-copper-50 text-copper-750 border-r-4 border-[#a26838]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        id="mb-tab-inbox"
                      >
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span>{isAr ? "صندوق الرسائل" : "Visitor Mailbox"}</span>
                        </span>
                        {unreadMessagesCount > 0 && (
                          <span className="bg-copper-600 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-5">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('backup'); setIsMobileTabsOpen(false); }}
                        className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          activeSubTab === 'backup' 
                            ? 'bg-copper-50 text-copper-750 border-r-4 border-[#a26838]' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        id="mb-tab-backup"
                      >
                        <Key className="w-4 h-4 text-slate-500" />
                        <span>{isAr ? "نسخ احتياطي" : "Data Backup Hub"}</span>
                      </button>
                    </div>

                    {/* Dual Action Logout in mobile drawer template bottom */}
                    <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-2" id="mobile-drawer-bottom-logout">
                      <button
                        onClick={() => {
                          setIsAdminLoggedIn(false);
                          setIsMobileTabsOpen(false);
                        }}
                        className="w-full text-center py-2 rounded-xl bg-red-100 text-red-650 hover:bg-red-250 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        id="mb-drawer-btn-signout"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isAr ? "قفل لوحة التحكم" : "Sign Out / Lock"}</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            
            {/* Desktop Side Navigation Panel - Matches the First Screenshot EXACTLY */}
            <div className={`hidden md:flex w-64 bg-slate-100/90 border-${isAr ? 'l' : 'r'} border-slate-200 flex-col gap-1 p-4 shrink-0`} id="desktop-sidebar-nav">
              
              {/* Executive Profile Card top box - Matches "إدارة المهندس" */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-3xs text-center flex flex-col items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  {isAr ? `إدارة: ${profile.name.ar}` : `Admin: ${profile.name.en}`}
                </span>
              </div>

              {/* Sidebar Menu elements */}
              <div className="flex flex-col gap-1 flex-grow">
                <button
                  onClick={() => setActiveSubTab('basic')}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeSubTab === 'basic' 
                      ? `bg-copper-50 text-copper-750 font-black shadow-3xs border-${isAr ? 'l' : 'r'}-4 border-[#a26838]` 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id="subtab-basic-nav-btn"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? "الواجهة الأساسية" : "Home Settings"}</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('bio')}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeSubTab === 'bio' 
                      ? `bg-copper-50 text-copper-750 font-black shadow-3xs border-${isAr ? 'l' : 'r'}-4 border-[#a26838]` 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id="subtab-bio-nav-btn"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? "نبذة وتواصل" : "Biography Settings"}</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('skills')}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeSubTab === 'skills' 
                      ? `bg-copper-50 text-copper-750 font-black shadow-3xs border-${isAr ? 'l' : 'r'}-4 border-[#a26838]` 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id="subtab-skills-nav-btn"
                >
                  <Award className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? "تعديل المهارات" : "Capabilities Master"}</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('projects')}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeSubTab === 'projects' 
                      ? `bg-copper-50 text-copper-750 font-black shadow-3xs border-${isAr ? 'l' : 'r'}-4 border-[#a26838]` 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id="subtab-projects-nav-btn"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? "لوحة المشاريع" : "Project Showcase"}</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('inbox')}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    activeSubTab === 'inbox' 
                      ? `bg-copper-50 text-copper-750 font-black shadow-3xs border-${isAr ? 'l' : 'r'}-4 border-[#a26838]` 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id="subtab-inbox-nav-btn"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{isAr ? "صندوق الرسائل" : "Visitor Mailbox"}</span>
                  </span>
                  
                  {unreadMessagesCount > 0 && (
                    <span className="bg-copper-600 text-[10px] text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-3xs">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSubTab('backup')}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeSubTab === 'backup' 
                      ? `bg-copper-50 text-copper-750 font-black shadow-3xs border-${isAr ? 'l' : 'r'}-4 border-[#a26838]` 
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id="subtab-backup-nav-btn"
                >
                  <Key className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? "نسخ احتياطي" : "Data Backup Hub"}</span>
                </button>
              </div>

              {/* Sidebar Action Footer buttons: "خروج" and "عرض الموقع" */}
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
                
                {/* Two side by side actions: "خروج" & "عرض الموقع" */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="py-2.5 rounded-xl bg-[#fbe8eb] text-[#d64156] hover:bg-[#fadce1] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    id="admin-sidebar-logout-col"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAr ? "خروج" : "Lock"}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 rounded-xl bg-white text-slate-800 border border-slate-250 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-3xs"
                    id="admin-sidebar-back-col"
                  >
                    <span>{isAr ? "عرض الموقع" : "Browse"}</span>
                  </button>
                </div>

              </div>
            </div>


            {/* Editing Field Workspace */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 min-h-0 bg-slate-50/50">
              
              {/* Page title inside main editing container - Matches the First Screenshot EXACTLY */}
              <div className="mb-6 text-start border-b border-slate-200/80 pb-5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {isAr ? "لوحة تحكم إشرافية" : "Administrative Dashboard"}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                  {isAr 
                    ? "تعديل كامل نصوص وقوالب معرض الأعمال، وبطاقات المهارات والمشاريع." 
                    : "Full text customization, expertise cards, and media showcase configuration hub."}
                </p>
              </div>

              {/* TAB 1: Basic Info Settings (الواجهة الأساسية) */}
              {activeSubTab === 'basic' && (
                <div className="space-y-6 text-start" id="panel-basic">
                  
                  {/* Container with light blue-tinted background and 24px rounded corners */}
                  <div className="bg-[#f4f8fc] border border-[#e3eef8] p-5 sm:p-7 rounded-[24px] space-y-6">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 border-b border-sky-100 pb-2">
                      {isAr ? "عناوين وكلمات الترحيب الكبرى" : "Main Greeting Identifiers"}
                    </h4>

                    {/* Portrait Settings (المعرف البصري والصورة الشخصية) */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {isAr ? "معرف الصورة الشخصية" : "Visual Brand Portrait Artwork"}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div className="md:col-span-3 flex flex-col items-center gap-2">
                          <img
                            src={profile.imageUrl || "/src/assets/images/journalist_portrait_1781952055223.jpg"}
                            alt="Personal Thumbnail"
                            className="w-24 h-24 rounded-2xl object-cover border-4 border-copper-100 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          {profile.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setProfile({ ...profile, imageUrl: '' })}
                              className="text-[10px] text-red-500 hover:underline cursor-pointer"
                            >
                              {isAr ? "إعادة الضبط للتلقائي" : "Reset to Default"}
                            </button>
                          )}
                        </div>
                        <div className="md:col-span-9 space-y-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">
                              {isAr ? "رفع صورة شخصية مباشرة من جهازك:" : "Upload profile picture directly from device:"}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 800 * 1024) {
                                  setAlertModal(isAr 
                                    ? "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 800 كيلوبايت لضمان توافقها السحابي وسرعة تحميل الصفحة." 
                                    : "Image file is too large. Please select an image under 800KB to ensure cloud compatibility and faster page loading.");
                                  e.target.value = '';
                                  return;
                                }
                                handleFileAsBase64(e, (base64) => setProfile({ ...profile, imageUrl: base64 }));
                              }}
                              className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-copper-50 file:text-copper-700 hover:file:bg-copper-100 cursor-pointer bg-slate-50 rounded-xl p-1 border border-slate-250"
                              id="profile-portrait-upload-node"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-400">
                              {isAr ? "أو ضع هنا رابط الصورة الشخصية:" : "Or specify portrait image URL link:"}
                            </label>
                            <input
                              type="text"
                              value={profile.imageUrl}
                              onChange={(e) => setProfile({ ...profile, imageUrl: e.target.value })}
                              placeholder={isAr ? "مثال: https://images.unsplash.com/..." : "e.g. https://images.unsplash.com/..."}
                              className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:bg-white"
                              id="input-imageUrl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Names & Careers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Name Arabic */}
                      <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500">{isAr ? "الاسم الشخصي بالعربية" : "Arabic Personal Name"}</label>
                        <input
                          type="text"
                          required
                          value={profile.name.ar}
                          onChange={(e) => handleProfileFieldChange('name', 'ar', e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white"
                          id="profile-name-ar"
                        />
                      </div>

                      {/* Name English */}
                      <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500">{isAr ? "الاسم الشخصي بالإنجليزية" : "English Personal Name"}</label>
                        <input
                          type="text"
                          required
                          value={profile.name.en}
                          onChange={(e) => handleProfileFieldChange('name', 'en', e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white"
                          id="profile-name-en"
                        />
                      </div>

                      {/* Creative Title Arabic */}
                      <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500">{isAr ? "المسمى المهني بالعربية" : "Arabic Creative Title"}</label>
                        <input
                          type="text"
                          required
                          value={profile.title.ar}
                          onChange={(e) => handleProfileFieldChange('title', 'ar', e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white"
                          id="profile-title-ar"
                        />
                      </div>

                      {/* Creative Title English */}
                      <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500">{isAr ? "المسمى المهني بالإنجليزية" : "English Creative Title"}</label>
                        <input
                          type="text"
                          required
                          value={profile.title.en}
                          onChange={(e) => handleProfileFieldChange('title', 'en', e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white"
                          id="profile-title-en"
                        />
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Biography & Metadata Settings (نبذة وتواصل) */}
              {activeSubTab === 'bio' && (
                <div className="space-y-6 text-start" id="panel-bio">
                  
                  {/* Container with light blue-tinted background and 24px rounded corners */}
                  <div className="bg-[#f4f8fc] border border-[#e3eef8] p-5 sm:p-7 rounded-[24px] space-y-6">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 border-b border-sky-100 pb-2">
                      {isAr ? "نبذة وتواصل ورسائل الهيدر" : "Biography Texts & Contacts"}
                    </h4>

                    {/* Long Bios Arabic & English */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Bio in Arabic */}
                      <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500">{isAr ? "نبذة الهيدر القصيرة بالعربية (Bio)" : "Arabic Executive Biography"}</label>
                        <textarea
                          rows={4}
                          required
                          value={profile.bio.ar}
                          onChange={(e) => handleProfileFieldChange('bio', 'ar', e.target.value)}
                          className="w-full text-xs sm:text-sm p-3 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white leading-relaxed"
                          id="profile-bio-ar"
                        />
                      </div>

                      {/* Bio in English */}
                      <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500">{isAr ? "نبذة الهيدر القصيرة بالإنجليزية (Bio)" : "English Executive Biography"}</label>
                        <textarea
                          rows={4}
                          required
                          value={profile.bio.en}
                          onChange={(e) => handleProfileFieldChange('bio', 'en', e.target.value)}
                          className="w-full text-xs sm:text-sm p-3 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white leading-relaxed"
                          id="profile-bio-en"
                        />
                      </div>

                      {/* CV Download File / URL Input */}
                      <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 md:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {isAr ? "ملف السيرة الذاتية (CV)" : "Curriculum Vitae (CV)"}
                          </label>
                          {profile.cvUrl && profile.cvUrl.startsWith('data:') && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {isAr ? "ملف سيرة ذاتية مرفوع" : "Direct File Uploaded"}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* File Upload Box */}
                          <div className="space-y-2">
                            <span className="block text-[11px] font-bold text-slate-400">
                              {isAr ? "الخيار الأول: رفع ملف السيرة الذاتية مباشرة" : "Option 1: Upload CV file directly"}
                            </span>
                            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-copper-500/50 hover:bg-slate-50/50 transition-all text-center flex flex-col items-center justify-center min-h-[120px]">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleCvFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="cv-file-input"
                              />
                              <Upload className="w-7 h-7 text-slate-400 mb-2" />
                              <p className="text-xs font-bold text-slate-600">
                                {isAr ? "اضغط هنا لرفع الملف أو اسحبه" : "Click to upload or drag & drop"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {isAr ? "يدعم PDF, DOC, DOCX حتى 7 ميجابايت" : "Supports PDF, DOC, DOCX up to 7MB"}
                              </p>
                            </div>
                            {cvError && (
                              <p className="text-xs text-red-600 font-bold flex items-center gap-1.5 mt-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {cvError}
                              </p>
                            )}
                          </div>

                          {/* Link Option */}
                          <div className="space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="block text-[11px] font-bold text-slate-400">
                                {isAr ? "الخيار الثاني: أو ضع رابطاً خارجياً (مثال: Google Drive)" : "Option 2: Or provide an external URL link"}
                              </span>
                              <input
                                type="text"
                                value={profile.cvUrl && !profile.cvUrl.startsWith('data:') ? profile.cvUrl : ''}
                                onChange={(e) => handleCvUrlChange(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg bg-slate-50/50 border border-slate-200 focus:outline-hidden focus:bg-white font-mono text-slate-600"
                                id="profile-cv-url"
                              />
                            </div>

                            {profile.cvUrl ? (
                              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileText className="w-5 h-5 text-copper-600 shrink-0" />
                                  <div className="truncate text-left">
                                    <p className="text-[11px] font-bold text-slate-700 truncate">
                                      {profile.cvUrl.startsWith('data:') 
                                        ? (isAr ? "ملف السيرة الذاتية المرفوع" : "Uploaded CV File")
                                        : (isAr ? "رابط خارجي مفعّل" : "Active External Link")}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-mono truncate">
                                      {profile.cvUrl.startsWith('data:') ? `${Math.round(profile.cvUrl.length * 0.75 / 1024)} KB` : profile.cvUrl}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCvUrlChange('')}
                                  className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                  title={isAr ? "حذف الملف" : "Delete CV"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center p-3 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                                {isAr ? "لا توجد سيرة ذاتية مرفوعة حالياً" : "No CV uploaded or linked yet"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Quantitative Metrics Row Editing */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200/60 space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        {isAr ? "روابط منصات التواصل الاجتماعي ومؤشرات السحابة" : "Social & Cloud Connect Metrics"}
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {profile.metrics && profile.metrics.map((metric) => (
                          <div key={metric.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 animate-fadeIn space-y-3" id={`edit-metric-${metric.id}`}>
                            <div className="flex gap-2 items-center justify-between">
                              <span className="text-xs font-bold text-copper-750 font-mono capitalize">{metric.id}:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">{isAr ? "الحالة/النص:" : "Value:"}</span>
                                <input
                                  type="text"
                                  value={metric.value}
                                  onChange={(e) => handleMetricValueChange(metric.id, e.target.value)}
                                  className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-bold"
                                  id={`input-metric-value-${metric.id}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-400">Label (Ar)</label>
                                <input
                                  type="text"
                                  value={metric.label.ar}
                                  onChange={(e) => handleMetricLabelChange(metric.id, 'ar', e.target.value)}
                                  className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded"
                                  id={`input-metric-label-ar-${metric.id}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-400">Label (En)</label>
                                <input
                                  type="text"
                                  value={metric.label.en}
                                  onChange={(e) => handleMetricLabelChange(metric.id, 'en', e.target.value)}
                                  className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded"
                                  id={`input-metric-label-en-${metric.id}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">{isAr ? "رابط التوجيه (URL)" : "Redirect Link (URL)"}</label>
                              <input
                                type="text"
                                value={metric.link || ''}
                                onChange={(e) => handleMetricLinkChange(metric.id, e.target.value)}
                                className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded font-mono text-slate-600"
                                placeholder="https://..."
                                id={`input-metric-link-${metric.id}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB: Backup Control & Storage Format Settings (نسخ احتياطي) */}
              {activeSubTab === 'backup' && (
                <div className="space-y-6 text-start" id="panel-backup">
                  
                  {/* Container with light blue-tinted background and 24px rounded corners */}
                  <div className="bg-[#f4f8fc] border border-[#e3eef8] p-5 sm:p-7 rounded-[24px] space-y-6">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 border-b border-sky-100 pb-2">
                      {isAr ? "تحميل نسخ احتياطية واستعادة البيانات" : "System Storage Snapshot & Formatting"}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr 
                        ? "تفادياً لضياع مجهودات التعديل والتلقي، يمكنك تحميل نسخة احتياطية كاملة لبيانات معارض الأعمال والردود وحفظها كملف خارجي بجهازك، أو استعادة ملف محفوظ مسبقاً، أو إعادة التهيئة المبدئية والافتراضية." 
                        : "To avoid loss of modified local fields, export a JSON snap-file of your dataset, reload an existing copy, or clear caches to restore defaults."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Export Button Block */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                        <div>
                          <h5 className="text-xs font-black text-slate-900 mb-1">
                            {isAr ? "1. تصدير للكمبيوتر" : "1. Export Schema Snap (JSON)"}
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            {isAr ? "تنزيل كافة بيانات ونصوص ورسائل المنصة وحفظها كملف بجهازك." : "Collect and download local dynamic state database to a single local file."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const stateSnap = {
                              profile,
                              projects,
                              skills,
                              messages
                            };
                            const value = JSON.stringify(stateSnap, null, 2);
                            const blob = new Blob([value], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `esraa_hamad_portfolio_snap_${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            setAlertModal(isAr ? "تم تصدير وحفظ ملف النسخ الاحتياطي بنجاح!" : "Snapshot exported successfully!");
                          }}
                          className="w-full py-2 bg-slate-950 hover:bg-[#a26838] hover:text-white text-white font-bold text-xs rounded-xl cursor-pointer shadow-3xs transition-colors flex items-center justify-center gap-1"
                          id="backup-btn-export"
                        >
                          <Save className="w-3.5 h-3.5 text-white" />
                          <span>{isAr ? "تصدير البيانات الآن" : "Export Snapshot"}</span>
                        </button>
                      </div>

                      {/* Import Section */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                        <div>
                          <h5 className="text-xs font-black text-slate-900 mb-1">
                            {isAr ? "2. استيراد ملف سابق" : "2. Import Schema Snap (JSON)"}
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            {isAr ? "رفع ملف نسخ احتياطي محفوظ لديك مسبقاً وتطبيقه للبيئات فوراً." : "Select previously downloaded backup configuration to inject back."}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <input
                            type="file"
                            accept="application/json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                try {
                                  const parsed = JSON.parse(evt.target?.result as string);
                                  if (parsed.profile) setProfile(parsed.profile);
                                  if (parsed.projects) setProjects(parsed.projects);
                                  if (parsed.skills) setSkills(parsed.skills);
                                  if (parsed.messages) setMessages(parsed.messages);
                                  setAlertModal(isAr ? "تم استعادة كافة البيانات وحقنها بنجاح!" : "System state restored and loaded!");
                                } catch (err) {
                                  setAlertModal(isAr ? "عذراً، الملف المرفوع غير صالح للتهيئة." : "Error reading or parsing chosen snap file.");
                                }
                              };
                              reader.readAsText(file);
                            }}
                            className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-800 cursor-pointer"
                            id="backup-import-file-node"
                          />
                        </div>
                      </div>

                      {/* Revert defaults Factory button */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                        <div>
                          <h5 className="text-xs font-black text-red-650 mb-1">
                            {isAr ? "3. إعادة تهيئة المصنع" : "3. Reset Default System"}
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            {isAr ? "مسح التغييرات فوراً وإرجاع بيانات السيرة والأعمال للتصميم الأولي." : "Wipe any saved override logs and revert back to template setup."}
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              message: isAr ? "تحذير: هل أنتِ متأكدة من مسح كل تعديلاتك وإرجاع المنصة للحالة الافتراضية؟" : "Warning: Wipe all changes and reload defaults?",
                              onConfirm: () => {
                                localStorage.clear();
                                window.location.reload();
                              }
                            });
                          }}
                          className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl cursor-pointer shadow-3xs transition-colors flex items-center justify-center gap-1"
                          id="backup-btn-factory-reset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? "بدء الإلغاء والتهيئة" : "Reset System"}</span>
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Managing Projects */}
              {activeSubTab === 'projects' && (
                <div className="space-y-8" id="panel-projects">
                  
                  {/* Create / Edit Project Form */}
                  <form onSubmit={handleSaveProject} className="bg-white p-5 rounded-2xl border border-slate-200/60 space-y-4" id="project-editor-form">
                    <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>{editingProjectId ? (isAr ? "تعديل المادة التحريرية الحالية" : "Modify Selected Item") : (isAr ? "إضافة عمل إعلامي جديد للمعرض" : "Add New Showcase Entry")}</span>
                      {editingProjectId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProjectId(null);
                            setProjectForm({
                              category: 'video',
                              title: { ar: '', en: '' },
                              publisher: { ar: '', en: '' },
                              description: { ar: '', en: '' },
                              link: '',
                              date: '',
                              imageUrl: ''
                            });
                          }}
                          className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                          {isAr ? "إلغاء التعديل" : "Cancel Edit"}
                        </button>
                      )}
                    </h4>

                    {/* Form Layout options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "نوع المحتوى" : "Category type"}</label>
                        <select
                          value={projectForm.category}
                          onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as MediaCategory })}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                          id="pf-category"
                        >
                          <option value="video">{isAr ? "مرئي (تلفزيون وفيديو)" : "Video & Broadcasting"}</option>
                          <option value="audio">{isAr ? "مسموع (بودكاست وصوت)" : "Audio / Voiceover"}</option>
                          <option value="written">{isAr ? "مكتوب (مقالات وتقارير)" : "Written Articles"}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "موقع النشر / الناشر (عربي)" : "Publisher (Arabic)"}</label>
                        <input
                          type="text"
                          required
                          value={projectForm.publisher.ar}
                          onChange={(e) => setProjectForm({
                            ...projectForm,
                            publisher: { ...projectForm.publisher, ar: e.target.value }
                          })}
                          placeholder={isAr ? "مثال: الجزيرة، التلفزيون العربي" : "e.g. Al Jazeera"}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="pf-publisher-ar"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "موقع النشر / الناشر (إنجليزي)" : "Publisher (English)"}</label>
                        <input
                          type="text"
                          required
                          value={projectForm.publisher.en}
                          onChange={(e) => setProjectForm({
                            ...projectForm,
                            publisher: { ...projectForm.publisher, en: e.target.value }
                          })}
                          placeholder="e.g. BBC, Substack"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="pf-publisher-en"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "العنوان باللغة العربية" : "Title (Arabic)"}</label>
                        <input
                          type="text"
                          required
                          value={projectForm.title.ar}
                          onChange={(e) => setProjectForm({
                            ...projectForm,
                            title: { ...projectForm.title, ar: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="pf-title-ar"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "العنوان باللغة الإنجليزية" : "Title (English)"}</label>
                        <input
                          type="text"
                          required
                          value={projectForm.title.en}
                          onChange={(e) => setProjectForm({
                            ...projectForm,
                            title: { ...projectForm.title, en: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="pf-title-en"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "الوصف المختصر المثير للاهتمام (عربي)" : "Description brief (Arabic)"}</label>
                        <textarea
                          rows={2}
                          required
                          value={projectForm.description.ar}
                          onChange={(e) => setProjectForm({
                            ...projectForm,
                            description: { ...projectForm.description, ar: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200"
                          id="pf-desc-ar"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "الوصف المختصر المثير للاهتمام (إنجليزي)" : "Description brief (English)"}</label>
                        <textarea
                          rows={2}
                          required
                          value={projectForm.description.en}
                          onChange={(e) => setProjectForm({
                            ...projectForm,
                            description: { ...projectForm.description, en: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200"
                          id="pf-desc-en"
                        />
                      </div>

                    </div>

                    {/* Media Upload and Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      
                      {/* Left side: Date & Content Cover Image */}
                      <div className="md:col-span-6 space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">{isAr ? "تاريخ النشر" : "Publish Date"}</label>
                          <input
                            type="date"
                            required
                            value={projectForm.date}
                            onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 cursor-pointer text-slate-755 bg-white"
                            id="pf-date"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">{isAr ? "صورة غلاف العمل" : "Cover Thumbnail Image"}</label>
                          <div className="space-y-1.5">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 800 * 1024) {
                                  setAlertModal(isAr 
                                    ? "حجم غلاف الصورة كبير جداً. يرجى اختيار غلاف أصغر من 800 كيلوبايت." 
                                    : "Cover image is too large. Please select an image under 800KB.");
                                  e.target.value = '';
                                  return;
                                }
                                handleFileAsBase64(e, (base64) => setProjectForm({ ...projectForm, imageUrl: base64 }));
                              }}
                              className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-copper-50 file:text-copper-700 hover:file:bg-copper-100 cursor-pointer bg-white rounded-xl p-1 border border-slate-250"
                              id="pf-imageUrl-file"
                            />
                            <input
                              type="text"
                              value={projectForm.imageUrl || ''}
                              onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                              placeholder={isAr ? "أو الصق رابط الصورة اختياري..." : "Or paste image URL link (Optional)..."}
                              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-250 bg-white"
                              id="pf-imageUrl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right side: File Source/Video File Tracker (Optional YouTube link) */}
                      <div className="md:col-span-6 space-y-3.5">
                        
                        {(projectForm.category === 'video' || projectForm.category === 'audio') ? (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">
                              {projectForm.category === 'video' 
                                ? (isAr ? "اختر ملف فيديو للتنزيل من جهازك مباشرة:" : "Pick a video file from your computer:") 
                                : (isAr ? "اختر ملف صوتي (بودكاست) من جهازك مباشرة:" : "Pick an audio file from your computer:")
                              }
                            </label>
                            
                            <input
                              type="file"
                              accept={projectForm.category === 'video' ? "video/*" : "audio/*"}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 800 * 1024) {
                                  setAlertModal(isAr 
                                    ? "حجم الملف كبير جداً. قاعدة البيانات السحابية تدعم ملفات حتى 800 كيلوبايت كحد أقصى لتسريع التصفح والتحميل. لملفات الفيديو أو الصوت الكبيرة، يرجى استخدام روابط خارجية (مثل يوتيوب أو ساوند كلاود)." 
                                    : "File is too large. Cloud database supports files up to 800KB max to ensure fast loading times. For large video or audio, please use external links like YouTube or SoundCloud.");
                                  e.target.value = '';
                                  return;
                                }
                                handleFileAsBase64(e, (base64) => setProjectForm({ ...projectForm, link: base64 }));
                              }}
                              className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-copper-50 file:text-copper-700 hover:file:bg-copper-100 cursor-pointer bg-white rounded-xl p-1 border border-slate-250"
                              id="pf-media-file"
                            />

                            <div className="space-y-1 pt-1.5">
                              <label className="text-[11px] font-semibold text-slate-500">
                                {isAr ? "أو الصق رابط يوتيوب / رابط سحابي خارجي (اختياري):" : "Or use an external YouTube / cloud link (Optional):"}
                              </label>
                              <input
                                type="text"
                                value={projectForm.link.startsWith('data:') ? '' : projectForm.link}
                                onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white"
                                id="pf-link"
                              />
                            </div>

                            {projectForm.link && projectForm.link.startsWith('data:') && (
                              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 p-2 rounded-lg border border-emerald-100 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {isAr ? "✓ تم إدخال ملف محلي بنجاح! سيتم حفظه مع المقال" : "✓ Local file attached successfully! Stored directly."}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">{isAr ? "رابط المقال التحريري المكتوب" : "Written Feature Article Link"}</label>
                            <input
                              type="url"
                              required
                              value={projectForm.link}
                              onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                              placeholder="https://example.com/article"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white"
                              id="pf-link-written"
                            />
                          </div>
                        )}

                      </div>

                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-copper-600 hover:bg-copper-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        id="pf-save-btn"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingProjectId ? (isAr ? "تحديث التعديل" : "Update Project") : (isAr ? "إضافة للمعرض حركياً" : "Insert to Showcase")}</span>
                      </button>
                    </div>

                  </form>

                  {/* Active Projects List */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isAr ? "المواد الحالية المسجلة في المعرض" : "Currently Registered Portfolio Items"}
                    </h5>
                    
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {projects.map((proj) => (
                        <div 
                          key={proj.id} 
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                          id={`dash-project-${proj.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* tiny image indicator */}
                            <div className="w-10 h-10 rounded-lg bg-copper-50 text-copper-600 flex items-center justify-center text-xs shrink-0">
                              {proj.category === 'video' ? 'Video' : proj.category === 'audio' ? 'Audio' : 'Article'}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-slate-800 truncate">
                                {isAr ? proj.title.ar : proj.title.en}
                              </span>
                              <span className="block text-[10px] text-slate-400 capitalize">
                                {proj.category} • {isAr ? proj.publisher.ar : proj.publisher.en}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartEditProject(proj)}
                              className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit"
                              id={`edit-proj-btn-${proj.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete"
                              id={`delete-proj-btn-${proj.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: Managing Skills */}
              {activeSubTab === 'skills' && (
                <div className="space-y-8" id="panel-skills">
                  
                  {/* Create / Edit Skill Form */}
                  <form onSubmit={handleSaveSkill} className="bg-white p-5 rounded-2xl border border-slate-200/60 space-y-4" id="skill-editor-form">
                    <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>{editingSkillId ? (isAr ? "تعديل المهارة الحالية" : "Edit Competency") : (isAr ? "إضافة مهارة واحترافية صحفية جديدة" : "Add New Experience Track")}</span>
                      {editingSkillId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSkillId(null);
                            setSkillForm({
                              name: { ar: '', en: '' },
                              level: 90,
                              iconName: 'Tv',
                              category: { ar: 'الأداء والتقديم', en: 'Presentation' }
                            });
                          }}
                          className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                          {isAr ? "إلغاء التعديل" : "Cancel Edit"}
                        </button>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "مسمى المهارة (عربي)" : "Skill Title (Arabic)"}</label>
                        <input
                          type="text"
                          required
                          value={skillForm.name.ar}
                          onChange={(e) => setSkillForm({
                            ...skillForm,
                            name: { ...skillForm.name, ar: e.target.value }
                          })}
                          placeholder="التقديم التلفزيوني المباشر"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="sk-name-ar"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "مسمى المهارة (إنجليزي)" : "Skill Title (English)"}</label>
                        <input
                          type="text"
                          required
                          value={skillForm.name.en}
                          onChange={(e) => setSkillForm({
                            ...skillForm,
                            name: { ...skillForm.name, en: e.target.value }
                          })}
                          placeholder="Live Anchoring"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="sk-name-en"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "التصنيف والفرع (عربي)" : "Category (Arabic)"}</label>
                        <input
                          type="text"
                          required
                          value={skillForm.category.ar}
                          onChange={(e) => setSkillForm({
                            ...skillForm,
                            category: { ...skillForm.category, ar: e.target.value }
                          })}
                          placeholder="الأداء والتقديم، التحرير، التخطيط..."
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="sk-cat-ar"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "التصنيف والفرع (إنجليزي)" : "Category (English)"}</label>
                        <input
                          type="text"
                          required
                          value={skillForm.category.en}
                          onChange={(e) => setSkillForm({
                            ...skillForm,
                            category: { ...skillForm.category, en: e.target.value }
                          })}
                          placeholder="Presentation, Writing & Research ..."
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                          id="sk-cat-en"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">
                          {isAr ? "نسبة التمكين والمهارة (%):" : "Skill Intensity Percentage (0-100):"} {skillForm.level}%
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={skillForm.level}
                          onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                          className="w-full h-2 rounded-lg bg-slate-250 cursor-pointer accent-copper-600"
                          id="sk-level"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">{isAr ? "الأيقونة الرمزية" : "Visual Icon Symbol"}</label>
                        <select
                          value={skillForm.iconName}
                          onChange={(e) => setSkillForm({ ...skillForm, iconName: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                          id="sk-icon"
                        >
                          <option value="Tv">Tv - تلفزيون</option>
                          <option value="Mic">Mic - ميكروفون حواري</option>
                          <option value="Search">Search - بحث وتدقيق</option>
                          <option value="FileText">FileText - نصوص وسكريبت</option>
                          <option value="Edit3">Edit3 - تحرير ونشر</option>
                          <option value="Volume2">Volume2 - تعليق مسموع</option>
                          <option value="Award">Award - جوائز واعتماد</option>
                          <option value="Users">Users - حوارات ووفود</option>
                        </select>
                      </div>

                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-copper-600 hover:bg-copper-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        id="sk-save-btn"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingSkillId ? (isAr ? "تحديث المهارة" : "Update Skill") : (isAr ? "إرسال المهارة للمنصة" : "Append Capable Skill")}</span>
                      </button>
                    </div>

                  </form>

                  {/* Active Skills List */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isAr ? "المهارات المعروضة حالياً" : "Current Skills List"}
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                      {skills.map((skill) => (
                        <div 
                          key={skill.id} 
                          className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                          id={`dash-skill-${skill.id}`}
                        >
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-800 truncate">
                              {isAr ? skill.name.ar : skill.name.en}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {skill.level}% • {isAr ? skill.category.ar : skill.category.en}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditSkill(skill)}
                              className="w-7 h-7 rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                              id={`edit-skill-btn-${skill.id}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center cursor-pointer"
                              id={`delete-skill-btn-${skill.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: Visitor Messages Inbox */}
              {activeSubTab === 'inbox' && (
                <div className="space-y-4" id="panel-inbox">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase">
                      {isAr ? "صندوق وارد مراسلات الموقع" : "Visitor Connections Inbox"}
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                      {isAr ? `المجموع: ${messages.length} رسالة` : `${messages.length} inquiries total`}
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200" id="inbox-empty-view">
                      <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <h5 className="text-slate-500 text-xs font-bold">
                        {isAr ? "صندوق الرسائل فارغ تماماً حالياً!" : "Your visitor mailbox is perfectly empty"}
                      </h5>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            msg.isRead 
                              ? 'bg-white border-slate-200' 
                              : 'bg-copper-50/40 border-copper-200 shadow-xs'
                          }`}
                          id={`dash-msg-${msg.id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-slate-900">{msg.name}</span>
                                {!msg.isRead && (
                                  <span className="text-[9px] bg-copper-600 text-white font-extrabold px-1.5 py-0.5 rounded-sm">
                                    {isAr ? "غير مقروءة" : "New"}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 font-mono block sm:inline">
                                {msg.email} | {msg.handle}
                              </span>
                            </div>

                            <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-lg bg-slate-200/50 text-slate-700 font-semibold self-start sm:self-center">
                              {isAr ? msg.purpose.ar : msg.purpose.en}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-3.5">
                            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                              {msg.message}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                            <span className="font-mono text-[10px]">{msg.timestamp}</span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleMessageRead(msg.id)}
                                className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border transition-colors cursor-pointer ${
                                  msg.isRead 
                                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200' 
                                    : 'bg-copper-100 hover:bg-copper-200 text-copper-800 border-copper-200'
                                }`}
                                id={`mark-read-btn-${msg.id}`}
                              >
                                {msg.isRead ? (isAr ? "تحديد كغير مقروءة" : "Mark Unread") : (isAr ? "تحديد كمقروءة" : "Mark Read")}
                              </button>

                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center cursor-pointer"
                                title="Delete Inquire"
                                id={`delete-msg-btn-${msg.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}



        {/* Safe Confirm Modal overlay */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center"
              >
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 font-sans">
                  {isAr ? "هل أنت متأكد؟" : "Are you sure?"}
                </h4>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {confirmModal.message}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {isAr ? "تأكيد الحذف" : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200/80"
                  >
                    {isAr ? "إلغاء الأمر" : "Cancel"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Safe Notify Alert Modal overlay */}
        <AnimatePresence>
          {alertModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 font-sans">
                  {isAr ? "تنبيه النظام" : "Notification"}
                </h4>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  {alertModal}
                </p>
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-copper-600 text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? "موافق" : "Got it"}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
