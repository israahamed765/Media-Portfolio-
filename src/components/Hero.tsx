import { motion } from 'motion/react';
import { ProfileData } from '../types';
import { Award, Mail, Calendar, Sparkles, Facebook, Linkedin, MessageCircle, Share2, ExternalLink, Download, Instagram } from 'lucide-react';

interface HeroProps {
  lang: 'ar' | 'en';
  profile: ProfileData;
  onContactClick: () => void;
}

const getMetricIcon = (id: string) => {
  const normalized = id.toLowerCase();
  if (normalized.includes('instagram') || normalized.includes('insta')) return <Instagram className="w-5 h-5 text-pink-600" />;
  if (normalized.includes('gmail') || normalized.includes('email') || normalized.includes('mail')) return <Mail className="w-5 h-5 text-red-500" />;
  if (normalized.includes('facebook')) return <Facebook className="w-5 h-5 text-blue-600" />;
  if (normalized.includes('linkedin')) return <Linkedin className="w-5 h-5 text-blue-700" />;
  if (normalized.includes('whatsapp')) return <MessageCircle className="w-5 h-5 text-green-500" />;
  return <Share2 className="w-5 h-5 text-copper-500" />;
};

export default function Hero({ lang, profile, onContactClick }: HeroProps) {
  const isAr = lang === 'ar';

  // Use the generated portrait URL as default if imageUrl is blank
  const defaultPortrait = "/src/assets/images/journalist_portrait_1781952055223.jpg";
  const avatarUrl = profile.imageUrl && profile.imageUrl.trim().length > 0 
    ? profile.imageUrl 
    : defaultPortrait;

  return (
    <section id="hero-section" className="py-12 md:py-20 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Portrait & Media Badge Frame */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="relative w-72 h-72 sm:w-85 sm:h-85 lg:w-96 lg:h-96"
            >
              {/* Copper Ambient Glow ring */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-b from-copper-500 via-copper-200 to-slate-300 opacity-60 blur-md animate-pulse" />
              
              {/* Main Portrait Wrapper */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-200 border-x-4 border-b-6 border-slate-50 shadow-2xl">
                <img
                  src={avatarUrl}
                  alt={isAr ? `صورة ${profile.name.ar}` : `${profile.name.en} Portrait`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay live indicator */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-xl text-slate-50 flex items-center justify-between border border-slate-200/20">
                  <span className="text-[10px] sm:text-xs text-copper-100 font-medium tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-copper-500 inline-block animate-ping" />
                    {isAr ? "نشط حالياً للاستشارات" : "Active for Consulting"}
                  </span>
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-copper-500/30 text-copper-200 uppercase tracking-widest font-mono">
                    {isAr ? "بث مباشر" : "Live Broad"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Text Summary & Professional Hook */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Elegant Subheadings */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-copper-50 text-copper-700 text-xs font-semibold mb-5 border border-copper-100"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? "ملف الصحافة الرسمي • 2026" : "Official Press Kit • 2026"}</span>
            </motion.div>

            {/* Journalist Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
            >
              {isAr ? profile.name.ar : profile.name.en}
            </motion.h1>

            {/* Title / Specialized Focus */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl font-semibold text-copper-600 mt-2.5 font-cairo"
            >
              {isAr ? profile.title.ar : profile.title.en}
            </motion.p>

            {/* Highly persuasive introductory capsule */}
            <motion.blockquote 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-slate-600 leading-relaxed text-base sm:text-lg border-s-4 border-copper-500 ps-4 italic"
            >
              {isAr ? profile.bio.ar : profile.bio.en}
            </motion.blockquote>

            {/* CTA Interaction Row */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 mt-8"
            >
              <button
                onClick={onContactClick}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-copper-600 to-copper-700 hover:from-copper-700 hover:to-copper-800 text-slate-50 font-bold text-sm tracking-wide shadow-lg hover:shadow-copper-600/15 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Mail className="w-4.5 h-4.5" />
                <span>{isAr ? "احجز حواراً أو اطلب استشارة" : "Book Interview / Consulting"}</span>
              </button>

              <a
                href="#media-showcase"
                className="px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-all flex items-center gap-2"
              >
                <span>{isAr ? "عرض شبكة الأعمال" : "Browse Portfolio"}</span>
              </a>

              <a
                href={profile.cvUrl || "#"}
                target={profile.cvUrl?.startsWith('data:') ? undefined : "_blank"}
                rel="noopener noreferrer"
                download={profile.cvUrl?.startsWith('data:') ? (isAr ? "السيرة_الذاتية.pdf" : "Curriculum_Vitae.pdf") : undefined}
                className="px-6 py-3.5 rounded-xl bg-copper-50/80 hover:bg-copper-100 text-copper-800 font-bold text-sm border border-copper-200/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-copper-600 animate-bounce" style={{ animationDuration: '3s' }} />
                <span>{isAr ? "تنزيل السيرة الذاتية" : "Download CV"}</span>
              </a>
            </motion.div>

            {/* Dynamic Interactive Social Connect Icons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12"
            >
              <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
                <span className="h-[1px] w-8 bg-copper-500/30" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-copper-800 font-mono">
                  {isAr ? "تابعني وتواصل معي" : "Follow & Contact Me"}
                </h4>
                <span className="h-[1px] w-8 bg-copper-500/30" />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
                {profile.metrics && profile.metrics.map((metric) => {
                  const isLink = !!metric.link;
                  const normalizedId = metric.id.toLowerCase();
                  
                  let hoverStyle = "hover:bg-slate-100 hover:text-slate-900 border-slate-200 hover:border-slate-400";
                  let brandColor = "text-slate-600";
                  let icon = <Share2 className="w-6 h-6" />;

                  if (normalizedId.includes('instagram') || normalizedId.includes('insta')) {
                    hoverStyle = "hover:bg-pink-50 hover:text-pink-650 hover:border-pink-300 focus:ring-pink-200";
                    brandColor = "text-pink-650";
                    icon = <Instagram className="w-6 h-6" />;
                  } else if (normalizedId.includes('gmail') || normalizedId.includes('email') || normalizedId.includes('mail')) {
                    hoverStyle = "hover:bg-red-50 hover:text-red-500 hover:border-red-300 focus:ring-red-200";
                    brandColor = "text-red-500";
                    icon = <Mail className="w-6 h-6" />;
                  } else if (normalizedId.includes('facebook')) {
                    hoverStyle = "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 focus:ring-blue-200";
                    brandColor = "text-blue-600";
                    icon = <Facebook className="w-6 h-6" />;
                  } else if (normalizedId.includes('linkedin')) {
                    hoverStyle = "hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 focus:ring-sky-200";
                    brandColor = "text-sky-700";
                    icon = <Linkedin className="w-6 h-6" />;
                  } else if (normalizedId.includes('whatsapp')) {
                    hoverStyle = "hover:bg-green-50 hover:text-green-600 hover:border-green-300 focus:ring-green-200";
                    brandColor = "text-green-600";
                    icon = <MessageCircle className="w-6 h-6" />;
                  }

                  const tooltipText = `${isAr ? metric.label.ar : metric.label.en}${metric.value ? ` - ${metric.value}` : ''}`;

                  const iconButton = (
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center border bg-white/80 backdrop-blur-sm shadow-xs transition-all duration-300 outline-hidden ${brandColor} ${hoverStyle}`}
                      title={tooltipText}
                    >
                      {icon}
                    </div>
                  );

                  if (isLink) {
                    return (
                      <motion.a 
                        key={metric.id}
                        href={metric.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -4, scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="block select-none"
                        id={`metric-${metric.id}`}
                      >
                        {iconButton}
                      </motion.a>
                    );
                  }

                  return (
                    <div key={metric.id} className="block select-none" id={`metric-${metric.id}`}>
                      {iconButton}
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
