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
  const [Icon, setIcon] = useState(Lightbulb);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Select random fact and icon on mount
    const randomFact = MOTIVATIONAL_FACTS[Math.floor(Math.random() * MOTIVATIONAL_FACTS.length)];
    const randomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
    
    setFact(randomFact);
    setIcon(randomIcon);
    
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  if (!fact) return null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border border-cyan-500/20 
        bg-gradient-to-br from-cyan-50/50 to-blue-50/30 
        p-4 shadow-sm
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      role="complementary"
      aria-label="Motivational insight"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon 
            className="h-5 w-5 text-cyan-600" 
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1.5">
            Did you know?
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {fact}
          </p>
        </div>
      </div>
    </div>
  );
}

