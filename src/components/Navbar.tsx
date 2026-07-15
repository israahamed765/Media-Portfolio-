import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Lock, Sparkles, Menu, X } from 'lucide-react';

interface NavbarProps {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  profile: any;
}

export default function Navbar({ lang, setLang, onOpenAdmin, isAdminLoggedIn, profile }: NavbarProps) {
  const isAr = lang === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-50/85 backdrop-blur-md border-b border-slate-200/80">
      <div id="navbar-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - rendering the user's uploaded portrait */}
        <motion.div 
          initial={{ opacity: 0, x: isAr ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 text-start"
        >
          <div className="relative w-10 h-10 rounded-full bg-slate-100 border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            <img 
              src={(profile?.imageUrl && profile.imageUrl.trim().length > 0) ? profile.imageUrl : "/src/assets/images/journalist_portrait_1781952055223.jpg"} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="block text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-none mb-1">
              {isAr ? "ملف أعمالي" : "My Portfolio"}
            </span>
            <span className="block text-[10px] sm:text-[11px] text-copper-650 font-semibold tracking-wider uppercase">
              {isAr ? "الواجهة الشخصية والسيرة" : "Personal Press Deck"}
            </span>
          </div>
        </motion.div>

        {/* Action Buttons: Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Admin Indicator (discreet) */}
          {isAdminLoggedIn && (
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {isAr ? "التحكم نشط" : "Control Mode"}
            </motion.span>
          )}

          {/* Language Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-copper-50 text-slate-700 hover:text-copper-700 border border-slate-200/60 transition-all cursor-pointer"
            id="lang-toggle-btn"
          >
            <Languages className="w-4 h-4 text-copper-600" />
            <span>{isAr ? "English" : "عربي"}</span>
          </motion.button>

          {/* Secure Login Trigger */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-copper-700 hover:bg-copper-50/50 transition-all cursor-pointer"
            title={isAr ? "لوحة الإدارة" : "Admin Deck"}
            id="admin-navbar-trigger"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only sm:text-[11px] font-medium text-slate-400 hover:text-slate-600">
              {isAr ? "الإدارة" : "Admin"}
            </span>
          </motion.button>
        </div>

        {/* Dual Actions : Mobile View (No hamburger menu, exactly two beautiful keys next to each other) */}
        <div className="flex md:hidden items-center gap-2">
          {isAdminLoggedIn && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" title={isAr ? "التحكم نشط" : "Control Active"} />
          )}
          
          {/* 1. Language Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer shrink-0"
            id="lang-toggle-btn-mobile-header"
          >
            <Languages className="w-3.5 h-3.5 text-copper-600" />
            <span>{isAr ? "EN" : "عربي"}</span>
          </motion.button>

          {/* 2. Admin Login */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#1d293d] text-white hover:bg-[#a26838] transition-colors cursor-pointer shrink-0 shadow-sm"
            id="admin-login-btn-mobile-header"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{isAr ? "المسؤول" : "Admin"}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}

