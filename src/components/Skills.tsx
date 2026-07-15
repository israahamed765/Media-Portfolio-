import { motion } from 'motion/react';
import { SkillData } from '../types';
import * as LucideIcons from 'lucide-react';

interface SkillsProps {
  lang: 'ar' | 'en';
  skills: SkillData[];
}

export default function Skills({ lang, skills }: SkillsProps) {
  const isAr = lang === 'ar';

  // Helper to dynamically resolve lucide-react icons safely
  const getIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name];
    if (IconComponent) return <IconComponent className="w-5.5 h-5.5 text-copper-600" />;
    return <LucideIcons.Award className="w-5.5 h-5.5 text-copper-600" />; // Fallback
  };

  // Grouping skills by category dynamically based on language
  const categoriesMap = skills.reduce((acc, skill) => {
    const key = isAr ? skill.category.ar : skill.category.en;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(skill);
    return acc;
  }, {} as Record<string, SkillData[]>);

  return (
    <section id="professional-skills" className="py-16 md:py-24 bg-gradient-to-b from-slate-100 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-copper-600 tracking-widest uppercase">
            {isAr ? "المهارات الصحفية التخصصية" : "Expert Capabilities"}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight font-sans">
            {isAr ? "الكفاءات والتمكين المهني" : "Professional Competencies"}
          </h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-base">
            {isAr 
              ? "مجموعة متوازنة من المهارات التلفزيونية والتحريرية المصقولة عبر سنوات من العمل الميداني والإنتاج المستمر."
              : "A performance-tested skill set compiled through years of television hosting, investigative reporting, and content coaching."}
          </p>
        </div>

        {/* Categories Network */}
        <div className="space-y-12">
          {Object.entries(categoriesMap).map(([categoryName, groupSkills]) => (
            <div key={categoryName} className="space-y-6" id={`skill-category-${categoryName.replace(/\s+/g, '-').toLowerCase()}`}>
              {/* Category Subtitle */}
              <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                <div className="w-2.5 h-5 bg-copper-600 rounded-sm" />
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                  {categoryName}
                </h3>
                <span className="text-xs bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                  {groupSkills.length}
                </span>
              </div>

              {/* Grid of skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow"
                    id={`skill-card-${skill.id}`}
                  >
                    {/* Icon Base */}
                    <div className="w-12 h-12 rounded-xl bg-copper-50 flex items-center justify-center shrink-0 border border-copper-100">
                      {getIcon(skill.iconName)}
                    </div>

                    {/* Skill Meta & Percentage Track */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {isAr ? skill.name.ar : skill.name.en}
                        </span>
                        <span className="text-xs font-extrabold text-copper-700 font-mono">
                          {skill.level}%
                        </span>
                      </div>

                      {/* Line Bar Track */}
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-copper-500 to-copper-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
