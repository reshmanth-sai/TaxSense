import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ExternalLink, 
  BellRing, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FilingDeadlineBarProps {
  className?: string;
}

interface MilestoneItem {
  id: string;
  title: string;
  dueDateStr: string;
  targetDate: Date;
  sectionRef: string;
  description: string;
  isPrimary?: boolean;
}

export const FilingDeadlineBar: React.FC<FilingDeadlineBarProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update current time every second for smooth countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Primary ITR-1/ITR-2 Filing Deadline: July 31, 2026 23:59:59
  const itrDeadline = useMemo(() => new Date('2026-07-31T23:59:59'), []);

  // Compute countdown time remaining
  const countdown = useMemo(() => {
    const totalMs = itrDeadline.getTime() - now.getTime();
    if (totalMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
    const seconds = Math.floor((totalMs / 1000) % 60);

    return { days, hours, minutes, seconds, isPassed: false };
  }, [now, itrDeadline]);

  // Statutory Tax Milestone Calendar for AY 2026-27
  const milestones: MilestoneItem[] = useMemo(() => [
    {
      id: 'itr_due',
      title: 'ITR-1 / ITR-2 Income Tax Return Filing',
      dueDateStr: 'July 31, 2026',
      targetDate: new Date('2026-07-31T23:59:59'),
      sectionRef: 'Sec 139(1)',
      description: 'Primary statutory due date for non-audit individual taxpayers to file return without penalty.',
      isPrimary: true
    },
    {
      id: 'adv_q2',
      title: 'Advance Tax Instalment 2 (45%)',
      dueDateStr: 'September 15, 2026',
      targetDate: new Date('2026-09-15T23:59:59'),
      sectionRef: 'Sec 211',
      description: 'Pay at least 45% of total estimated annual tax liability to avoid Sec 234C interest.'
    },
    {
      id: 'adv_q3',
      title: 'Advance Tax Instalment 3 (75%)',
      dueDateStr: 'December 15, 2026',
      targetDate: new Date('2026-12-15T23:59:59'),
      sectionRef: 'Sec 211',
      description: 'Cumulative 75% advance tax payment due for taxpayers with tax liability > ₹10,000.'
    },
    {
      id: 'revised_itr',
      title: 'Belated / Revised Return Deadline',
      dueDateStr: 'December 31, 2026',
      targetDate: new Date('2026-12-31T23:59:59'),
      sectionRef: 'Sec 139(4) / 139(5)',
      description: 'Final deadline to file a belated ITR or revise errors in your original filed return.'
    },
    {
      id: 'adv_q4',
      title: 'Advance Tax Instalment 4 (100%)',
      dueDateStr: 'March 15, 2027',
      targetDate: new Date('2027-03-15T23:59:59'),
      sectionRef: 'Sec 211',
      description: 'Final 100% advance tax instalment for FY 2026-27.'
    }
  ], []);

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent('TaxSense: ITR Filing Deadline (AY 2026-27)');
    const details = encodeURIComponent('File Income Tax Return for AY 2026-27 on incometax.gov.in before July 31 deadline.');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20260731T043000Z/20260731T183000Z&details=${details}&location=e-Filing+Portal+incometax.gov.in`;
  };

  return (
    <div className={`bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-5 backdrop-blur-md text-left transition-all ${className}`}>
      {/* Top Main Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Section: Icon, Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                ITR Filing Deadline: July 31, 2026
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                AY 2026-27 Compliance
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Statutory due date under Sec 139(1) for AY 2026-27 salaried & individual returns.
            </p>
          </div>
        </div>

        {/* Right Section: Countdown Ticker & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Live Countdown Ticker */}
          <div className="flex items-center gap-1.5 font-mono">
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.06] rounded-xl text-center">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{countdown.days}</span>
              <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Days</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">:</span>
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.06] rounded-xl text-center">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Hrs</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">:</span>
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.06] rounded-xl text-center">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Min</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">:</span>
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.06] rounded-xl text-center">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Sec</span>
            </div>
          </div>

          {/* Action Buttons */}
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all border border-slate-200/60 dark:border-white/10 cursor-pointer flex items-center gap-1.5"
            title="Add July 31 deadline to Google Calendar"
          >
            <BellRing className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Add to Calendar</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1 hover:scale-102 active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Calendar' : 'Milestones'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Inline Compliance Timeline */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-200/60 dark:border-white/[0.04] mt-4 pt-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                AY 2026-27 Statutory Tax Timeline
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Income Tax Department Calendar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {milestones.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.isPrimary
                      ? 'bg-blue-500/[0.04] dark:bg-blue-500/[0.05] border-blue-500/30'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/[0.04]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded border border-blue-500/20">
                        {item.sectionRef}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                        {item.dueDateStr}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
