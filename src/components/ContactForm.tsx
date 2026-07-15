import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactMessage } from '../types';
import { Mail, CheckCircle2, User, Send, AtSign, HelpCircle } from 'lucide-react';

interface ContactFormProps {
  lang: 'ar' | 'en';
  onSendMessage: (msg: Omit<ContactMessage, 'id' | 'timestamp' | 'isRead'>) => void;
  profileName?: { ar: string, en: string };
}

export default function ContactForm({ lang, onSendMessage, profileName }: ContactFormProps) {
  const isAr = lang === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    handle: '',
    purposeAr: 'استفسار عام',
    purposeEn: 'General Inquiry',
    message: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const contactPurposes = [
    { ar: 'استضافة تلفزيونية / إذاعية', en: 'TV or Radio Booking' },
    { ar: 'استشارة إعلامية وتخطيط اتصال', en: 'Media Consulting & Strategy' },
    { ar: 'إنتاج أفلام وثائقية أو مشاريع مشتركة', en: 'Docu-Production or Collaboration' },
    { ar: 'جلسات تدريب وتطوير الأداء الإعلامي', en: 'Media Performance Coaching' },
    { ar: 'استفسار عام', en: 'General Inquiry' }
  ];

  const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedText = e.target.value;
    const item = contactPurposes.find(p => p.en === selectedText || p.ar === selectedText);
    if (item) {
      setFormData(prev => ({
        ...prev,
        purposeAr: item.ar,
        purposeEn: item.en
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Checks
    if (!formData.name.trim()) {
      setErrorMsg(isAr ? 'برجاء إدخال اسمك الكريم.' : 'Please enter your polite name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg(isAr ? 'برجاء كتابة بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg(isAr ? 'برجاء كتابة تفاصيل رسالتك.' : 'Please supply some context on your message.');
      return;
    }

    try {
      onSendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        handle: formData.handle.trim() || '@',
        purpose: {
          ar: formData.purposeAr,
          en: formData.purposeEn
        },
        message: formData.message.trim()
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        handle: '',
        purposeAr: 'استفسار عام',
        purposeEn: 'General Inquiry',
        message: ''
      });

      // Show success screen for 5 seconds then resets
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);

    } catch (err) {
      setErrorMsg(isAr ? 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' : 'Unexpected issue occurred. Please retry.');
    }
  };

  return (
    <section id="contact-relations" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered clean header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-copper-600 tracking-widest uppercase">
            {isAr ? "مراسلتي المباشرة" : "Send a Message"}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight font-sans">
            {isAr ? "تواصل وتنسيق مهني" : "Professional Inquiries"}
          </h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed max-w-xl mx-auto">
            {isAr 
              ? "يسعدني تلقي رسائلكم واستفساراتكم المهنية للتنسيق والتعاون الإعلامي. يرجى ملء النموذج أدناه وسيتم الرد في أقرب وقت."
              : "I welcome your professional inquiries, interview requests, and media collaborations. Please fill out the form below and we will get back to you soon."}
          </p>
        </div>

        {/* Actual Contact Form Block */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-md">
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
                <motion.div
                  key="success-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-10 h-full"
                  id="contact-success"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-6"
                  >
                    <CheckCircle2 className="w-9 h-9" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-slate-900 font-sans">
                    {isAr ? "تم إرسال رسالتكم بنجاح" : "Message Sent Successfully"}
                  </h3>
                  
                  <p className="text-slate-500 text-sm mt-3 max-w-md leading-relaxed">
                    {isAr 
                      ? `شكراً لتواصلك مع المكتب الإعلامي لـ ${profileName?.ar || "إسراء حمد"}. تم تسليم رسالتك لصندوق التحرير بانتظام، وسنقوم بالرد عليك في أقرب وقت.`
                      : `We appreciate you writing to ${profileName?.en || "Israa Hamad"}. Your message has been safely received in our dashboard desk and we will respond shortly.`}
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 text-xs font-bold text-copper-600 hover:text-copper-800 bg-copper-50 px-4 py-2 rounded-lg border border-copper-100 transition-colors cursor-pointer"
                  >
                    {isAr ? "إرسال رسالة أخرى" : "Send Another Message"}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="active-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  id="contact-submission-form"
                >
                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs sm:text-sm border border-red-100 font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {isAr ? "الاسم الكامل" : "Full Name"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={isAr ? "الاسم الكريم" : "Your full name"}
                          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200/60 focus:outline-hidden focus:bg-white focus:border-copper-500 transition-colors"
                          id="contact-name"
                        />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {isAr ? "البريد الإلكتروني للرد" : "Direct Email"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="name@organization.com"
                          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200/60 focus:outline-hidden focus:bg-white focus:border-copper-500 transition-colors"
                          id="contact-email"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Twitter/Social link */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {isAr ? "الحساب الشخصي أو جهة العمل (اختياري)" : "Social Handle / Organization (Optional)"}
                      </label>
                      <div className="relative">
                        <AtSign className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.handle}
                          onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                          placeholder="@username"
                          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200/60 focus:outline-hidden focus:bg-white focus:border-copper-500 transition-colors"
                          id="contact-handle"
                        />
                      </div>
                    </div>

                    {/* Select Purpose Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {isAr ? "غرض الاتصال والتنسيق" : "Purpose of Contact"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HelpCircle className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <select
                          onChange={handlePurposeChange}
                          value={isAr ? formData.purposeAr : formData.purposeEn}
                          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200/60 focus:outline-hidden focus:bg-white focus:border-copper-500 transition-colors cursor-pointer appearance-none"
                          id="contact-purpose-select"
                        >
                          {contactPurposes.map((item, idx) => (
                            <option key={idx} value={isAr ? item.ar : item.en}>
                              {isAr ? item.ar : item.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message detail */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {isAr ? "تفاصيل الرسالة ومقترح التنسيق" : "Message Context & Proposals"} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={isAr 
                        ? "اكتب تفاصيل مقترحك، التواريخ المقترحة للاستضافة، الأسئلة والأمور الهامة المراد نقاشها مسبقاً..." 
                        : "Describe project details, proposed speech times, timeline of collaboration, specific interview context..."}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200/60 focus:outline-hidden focus:bg-white focus:border-copper-500 transition-colors resize-y leading-relaxed"
                      id="contact-message-body"
                    />
                  </div>

                  {/* Send Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-copper-700 text-white font-bold text-sm tracking-wide py-4.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                    id="submit-contact-btn"
                  >
                    <span>{isAr ? "إرسال الطلب الآن" : "Submit Request Securely"}</span>
                    <Send className="w-4 h-4" />
                  </motion.button>

                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>
  );
}
