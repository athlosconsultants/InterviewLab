'use client';

import { Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const MOTIVATIONAL_FACTS = [
  "After three practice interviews, your chances of receiving a job offer increase to 51%",
  "70% of hiring managers say being unprepared is the most common interview mistake",
  "Only 7 seconds to make a first impression - but you can master it with practice",
  "86% of hiring managers say a thank-you note influences their decision",
  "47% of candidates fail interviews due to insufficient company research",
  "78% of employers say a positive attitude makes all the difference in an interview",
  "75% of hiring managers say nervousness is a common mistake - practice helps manage it",
  "Morning interviews (9-11 AM) have 61% higher success rates with hiring managers",
  "The average interview is 40 minutes - make every minute count",
  "93% of job seekers experience interview anxiety - you're not alone, practice helps",
];

const ICONS = [Lightbulb, Sparkles, Target, TrendingUp];

export function MotivationalInsight() {
  const [fact, setFact] = useState('');
  const [iconIndex, setIconIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const randomFact = MOTIVATIONAL_FACTS[Math.floor(Math.random() * MOTIVATIONAL_FACTS.length)];
    const randomIconIndex = Math.floor(Math.random() * ICONS.length);
    
    setFact(randomFact);
    setIconIndex(randomIconIndex);
    
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  if (!fact) return null;

  const IconComponent = ICONS[iconIndex];

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      role="complementary"
      aria-label="Motivational insight"
    >
      {/* Mobile In-App Browser (ultra-minimal, no card) */}
      <div className="block sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          <IconComponent 
            className="h-4 w-4 text-cyan-600 opacity-50 flex-shrink-0" 
            strokeWidth={2}
            aria-hidden="true"
          />
          <h3 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
            Did you know?
          </h3>
        </div>
        <p className="text-[13px] text-slate-700 leading-[1.5]">
          {fact}
        </p>
      </div>

      {/* Mobile Safari (subtle left border accent) */}
      <div className="hidden sm:block md:hidden pl-3 border-l-[3px] border-cyan-500 py-4 bg-cyan-50/5">
        <div className="flex items-center gap-2 mb-1.5">
          <IconComponent 
            className="h-[18px] w-[18px] text-cyan-600 opacity-60 flex-shrink-0" 
            strokeWidth={2}
            aria-hidden="true"
          />
          <h3 className="text-[11px] font-semibold text-cyan-700 opacity-60 uppercase tracking-wide">
            Did you know?
          </h3>
        </div>
        <p className="text-sm text-slate-700 leading-[1.5]">
          {fact}
        </p>
      </div>

      {/* Desktop (full card treatment with hover) */}
      <div className="hidden md:block relative rounded-xl border border-slate-200 bg-slate-50/30 p-5 shadow-sm transition-shadow duration-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent 
              className="h-5 w-5 text-cyan-600 opacity-60" 
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1.5">
              Did you know?
            </h3>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              {fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

