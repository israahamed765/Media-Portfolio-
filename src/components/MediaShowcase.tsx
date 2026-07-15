import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectData, MediaCategory } from '../types';
import { Video, Headphones, FileText, Search, Calendar, ArrowUpRight, Globe, X, Play, AlertCircle } from 'lucide-react';

interface MediaShowcaseProps {
  lang: 'ar' | 'en';
  projects: ProjectData[];
}

export default function MediaShowcase({ lang, projects }: MediaShowcaseProps) {
  const isAr = lang === 'ar';
  const [activeCategory, setActiveCategory] = useState<MediaCategory>('video');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for active media lightbox player
  const [activeMedia, setActiveMedia] = useState<ProjectData | null>(null);

  // Helper to extract YouTube video ID and build secure embed route
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (!url) return null;
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    } catch {
      return null;
    }
  };

  // Define tab headers
  const categories: { id: MediaCategory; labelAr: string; labelEn: string; icon: any }[] = [
    { id: 'video', labelAr: 'الصحافة المرئية والتلفزيون', labelEn: 'Video & TV Broadcasts', icon: Video },
    { id: 'audio', labelAr: 'البودكاست والتعليق الصوتي', labelEn: 'Podcasts & Voice-over', icon: Headphones },
    { id: 'written', labelAr: 'المقالات والتقارير المكتوبة', labelEn: 'Articles & Written Reports', icon: FileText }
  ];

  // Filtering projects based on active category and search input
  const filteredProjects = projects.filter(proj => {
    const matchesCategory = proj.category === activeCategory;
    const matchText = searchQuery.trim().toLowerCase();
    
    if (!matchText) return matchesCategory;

    const titleMatch = (proj.title.ar + proj.title.en).toLowerCase().includes(matchText);
    const publisherMatch = (proj.publisher.ar + proj.publisher.en).toLowerCase().includes(matchText);
    const descMatch = (proj.description.ar + proj.description.en).toLowerCase().includes(matchText);

    return matchesCategory && (titleMatch || publisherMatch || descMatch);
  });

  return (
    <section id="media-showcase" className="py-16 md:py-24 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-copper-600 tracking-widest uppercase"
          >
            {isAr ? "معرض الأعمال الرقمي" : "Digital Showcase"}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight font-sans"
          >
            {isAr ? "المعرض المرئي والمسموع" : "Media Showcase & Press Work"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-500 mt-3.5 text-sm sm:text-base leading-relaxed"
          >
            {isAr 
              ? "استكشف التغطيات الحية، البرامج الحوارية التلفزيونية، اللقاءات الإذاعية والمقالات التحليلية التي تشكل مسيرتي المهنية."
              : "Discover dynamic live reporting, prime-time television broadcasts, podcast debates, and strategic columns published globally."}
          </motion.p>
        </div>

        {/* Tab Selector & Instant Search Deck */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
          
          {/* Custom Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery(''); // Reset search on tab switch
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-copper-600 to-copper-700 text-slate-50 shadow-md'
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                  id={`tab-${cat.id}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-50' : 'text-slate-500'}`} />
                  <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar inside showcase */}
          <div className="relative w-full md:w-80">
            <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? "بحث في معرض الأعمال..." : "Search showcase..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-200 focus:outline-hidden focus:border-copper-500 transition-colors"
              id="showcase-search-input"
            />
          </div>

        </div>

        {/* Media Grid Cards Container */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
              id="no-projects-view"
            >
              <div className="inline-flex w-12 h-12 rounded-full bg-slate-100 items-center justify-center text-slate-400 mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-slate-700 font-bold text-sm">
                {isAr ? "عذراً، لم نجد أي أعمال تطابق بحثك" : "No media files found matching your search"}
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                {isAr ? "جرب تبديل الكلمات أو فئة البحث" : "Try changing keyword or selecting another tab"}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              id="projects-grid"
            >
              {filteredProjects.map((proj, idx) => {
                
                // Audio/Video or Written fallback colors and illustrations
                const hasThumbnail = !!proj.imageUrl;
                const defaultImage = proj.category === 'video'
                  ? "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80"
                  : proj.category === 'audio'
                  ? "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"
                  : "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80";

                const displayImage = hasThumbnail ? proj.imageUrl : defaultImage;

                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-copper-500/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                    id={`project-card-${proj.id}`}
                  >
                    {/* Media Thumbnail/Header banner */}
                    <div 
                      onClick={() => {
                        if (proj.category === 'video' || proj.category === 'audio') {
                          setActiveMedia(proj);
                        } else if (proj.link) {
                          window.open(proj.link, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="relative aspect-video w-full overflow-hidden bg-slate-200 cursor-pointer"
                    >
                      <img
                        src={displayImage}
                        alt={isAr ? proj.title.ar : proj.title.en}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Gradient mask */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                      
                      {/* Floating Category Indicator */}
                      <div className="absolute top-3.5 right-3.5 bg-slate-900/80 backdrop-blur-md text-white border border-slate-100/10 px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase">
                        {proj.category === 'video' && <Video className="w-3 h-3 text-copper-300" />}
                        {proj.category === 'audio' && <Headphones className="w-3 h-3 text-copper-300" />}
                        {proj.category === 'written' && <FileText className="w-3 h-3 text-copper-300" />}
                        <span>
                          {proj.category === 'video' ? (isAr ? 'مرئي' : 'Video') :
                           proj.category === 'audio' ? (isAr ? 'بودكاست' : 'Podcast') :
                           (isAr ? 'مقال رأي' : 'Article')}
                        </span>
                      </div>

                      {/* Overlap Play Icon on video or audio */}
                      {(proj.category === 'video' || proj.category === 'audio') && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-copper-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            {proj.category === 'video' ? <Video className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Source Tag and Date */}
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2.5 font-semibold">
                          <span className="flex items-center gap-1.5 text-copper-700">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{isAr ? proj.publisher.ar : proj.publisher.en}</span>
                          </span>
                          
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{proj.date}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-slate-950 group-hover:text-copper-700 transition-colors line-clamp-2 leading-snug">
                          {isAr ? proj.title.ar : proj.title.en}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 leading-relaxed mt-2.5 line-clamp-3">
                          {isAr ? proj.description.ar : proj.description.en}
                        </p>
                      </div>

                      {/* Action Button Linkout */}
                      <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-end">
                        {(proj.category === 'video' || proj.category === 'audio') ? (
                          <button
                            type="button"
                            onClick={() => setActiveMedia(proj)}
                            className="text-xs font-bold text-copper-600 hover:text-copper-850 flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 outline-hidden"
                          >
                            <span>{isAr ? "تشغيل المادة الآن" : "Play Broadcast Now"}</span>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </button>
                        ) : (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-copper-600 group-hover:text-copper-800 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>{isAr ? "تصفح المادة كاملة" : "View Entire Feature"}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Immersive Lightbox Modal Media Player */}
        <AnimatePresence>
          {activeMedia && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md"
              id="showcase-lightbox-backdrop"
              onClick={() => setActiveMedia(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                id="showcase-lightbox-panel"
              >
                {/* Header line */}
                <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-copper-500 uppercase tracking-wide">
                      {activeMedia.category === 'video' ? (isAr ? "بث مرئي" : "Video Broadcast") : (isAr ? "ملف بودكاست" : "Audio Podcast")}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                      {isAr ? activeMedia.title.ar : activeMedia.title.en}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setActiveMedia(null)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    id="close-lightbox-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Media stage screen */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-850 shadow-inner">
                  {activeMedia.category === 'video' ? (
                    activeMedia.link && activeMedia.link.startsWith('data:') ? (
                      <video
                        src={activeMedia.link}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        id="html5-local-video-player"
                      ></video>
                    ) : getYouTubeEmbedUrl(activeMedia.link) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(activeMedia.link) || ''}
                        title="Embedded Broadcast Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        id="embedded-youtube-iframe"
                      ></iframe>
                    ) : activeMedia.link ? (
                      <video
                        src={activeMedia.link}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        id="html5-external-video-player"
                      ></video>
                    ) : (
                      <div className="text-center p-6 text-slate-500" id="video-empty-state">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-650" />
                        <p className="text-xs">{isAr ? "لم يتم رفع ملف فيديو صالح" : "No valid playable video payload found"}</p>
                      </div>
                    )
                  ) : (
                    /* Audio Podcast View */
                    <div className="flex flex-col items-center justify-center p-6 text-center w-full max-w-md" id="podcast-immersive-deck">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl mb-5 border-2 border-copper-500/20">
                        <img 
                          src={activeMedia.imageUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"} 
                          alt="Podcast Artwork" 
                          className="w-full h-full object-cover animate-[spin_30s_linear_infinite]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                          <Headphones className="w-8 h-8 text-white/80 drop-shadow-md" />
                        </div>
                      </div>
                      
                      <span className="text-[11px] bg-copper-900/60 text-copper-300 font-extrabold px-2.5 py-0.5 rounded-full border border-copper-700/30 mb-2">
                        {activeMedia.publisher.en}
                      </span>
                      
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-sm px-4 leading-relaxed mb-6">
                        {isAr ? activeMedia.description.ar : activeMedia.description.en}
                      </p>

                      {activeMedia.link && activeMedia.link.startsWith('data:') ? (
                        <audio
                          src={activeMedia.link}
                          controls
                          autoPlay
                          className="w-full"
                          id="html5-local-audio-player"
                        ></audio>
                      ) : activeMedia.link ? (
                        <audio
                          src={activeMedia.link}
                          controls
                          autoPlay
                          className="w-full"
                          id="html5-external-audio-player"
                        ></audio>
                      ) : (
                        <div className="text-center p-2 text-slate-500" id="audio-empty-state">
                          <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-650" />
                          <p className="text-[11px]">{isAr ? "لم يتم إرفاق ملف صوتي مسموع" : "No playable audio segment attached"}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer and Info metadata */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-450">
                  <span className="font-mono text-[10px] text-slate-400">
                    {isAr ? `تاريخ النشر: ${activeMedia.date}` : `Published: ${activeMedia.date}`}
                  </span>
                  
                  {activeMedia.link && !activeMedia.link.startsWith('data:') && (
                    <a
                      href={activeMedia.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-copper-400 hover:text-copper-300 font-bold flex items-center gap-1"
                    >
                      <span>{isAr ? "عرض المصدر الخارجي (يوتيوب/سحابة)" : "Open original external link"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
