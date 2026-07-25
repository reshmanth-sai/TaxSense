import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  FileUp, 
  BrainCircuit, 
  History, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ExternalLink,
  PieChart,
  SlidersHorizontal,
  Printer,
  MessageSquare,
  TrendingUp,
  Command,
  Plus,
  Check,
  Zap,
  HelpCircle,
  Award,
  RotateCcw
} from 'lucide-react';
import { useTaxStore } from '../../store/useTaxStore';
import { SecurityInspectorModal } from '../security/SecurityInspectorModal';
import { AIFilingReadinessEngine } from './AIFilingReadinessEngine';

interface DashboardCommandCenterProps {
  onNavigateStep: (step: number) => void;
  onOpenWhatIf?: () => void;
  onOpenPdf?: () => void;
  onOpenCommandPalette?: () => void;
}

export const DashboardCommandCenter: React.FC<DashboardCommandCenterProps> = ({
  onNavigateStep,
  onOpenWhatIf,
  onOpenPdf,
  onOpenCommandPalette
}) => {
  const [showTaxHealthDetails, setShowTaxHealthDetails] = useState(false);
  const [showOldRegimePreview, setShowOldRegimePreview] = useState(false);
  const [showMilestonesDrawer, setShowMilestonesDrawer] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [showActionReason, setShowActionReason] = useState(false);
  const [hoveredJourneyStage, setHoveredJourneyStage] = useState<number | null>(null);

  // 1-Click Quick-Fix Section 80D State
  const [isQuickFixOpen, setIsQuickFixOpen] = useState(false);
  const [medicalAmountInput, setMedicalAmountInput] = useState('25000');
  const [quickFixSuccess, setQuickFixSuccess] = useState(false);

  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const updateDeduction = useTaxStore((state) => state.updateDeduction);
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];
  const taxProfiles = useTaxStore((state) => state.taxProfiles) || [];
  const activeProfileId = useTaxStore((state) => state.activeProfileId) || 'self';

  const activeProfile = taxProfiles.find(p => p.id === activeProfileId) || taxProfiles[0];
  const userName = activeProfile?.name?.split(' ')[0] || incomeProfile.employeeName?.split(' ')[0] || 'Mohit';

  // Dynamic greeting time check
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const hasUploadedForm16 = uploadedFiles.length > 0;

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent('TaxSense: ITR Filing Deadline (AY 2026-27)');
    const details = encodeURIComponent('File Income Tax Return for AY 2026-27 on incometax.gov.in before July 31 deadline.');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20260731T043000Z/20260731T183000Z&details=${details}&location=e-Filing+Portal+incometax.gov.in`;
  };

  const handleApplyQuickFix80D = () => {
    const val = parseInt(medicalAmountInput, 10) || 25000;
    updateDeduction('80D', val);
    setQuickFixSuccess(true);
    setTimeout(() => {
      setQuickFixSuccess(false);
      setIsQuickFixOpen(false);
    }, 1500);
  };

  // Staggered Motion Physics Variants (<200ms transitions)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    }
  };

  const journeyDetails = [
    { stage: 1, name: 'Documents', status: 'VERIFIED', details: 'Form 16 & Salary slips ingested' },
    { stage: 2, name: 'Income', status: 'VERIFIED', details: 'Gross salary & TDS cross-matched' },
    { stage: 3, name: 'Optimization', status: 'COMPLETED', details: 'Regime comparison analyzed (New Regime saves ₹18,240)' },
    { stage: 4, name: 'Compliance', status: 'PENDING', details: '2 tasks remaining: Verify AIS & Rent Receipt Log' },
    { stage: 5, name: 'Ready', status: 'LOCKED', details: 'Requires 100% compliance verification' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5 font-sans text-left max-w-7xl mx-auto py-1"
    >
      
      {/* AI PERSISTENT TASK MEMORY BANNER */}
      <motion.div variants={itemVariants} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Last Session Memory:</strong> You were working on <em>Rent Receipt Verification</em>.
          </span>
        </div>
        <button
          onClick={() => onNavigateStep(3)}
          className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Continue →</span>
        </button>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION (15-20% Reduced Height + Compact Padding) */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600/[0.05] via-indigo-600/[0.02] to-slate-900/40 border border-slate-200/80 dark:border-white/[0.06] rounded-[24px] p-4 sm:p-5 md:p-6 backdrop-blur-md relative overflow-hidden space-y-4 shadow-sm">
        
        {/* Top Greeting & Living AI Daily Brief */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest font-mono">
                AI Daily Brief • AY 2026-27
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {timeGreeting}, {userName} 👋
            </h1>
            
            {/* Dynamic Rotating AI Daily Brief */}
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Today I verified your Form 16. Return is <strong className="text-blue-600 dark:text-blue-400 font-bold">72% Complete</strong>. Only two compliance checks remain before submission.
            </p>
          </div>

          {/* Hero KPI Badge & Contextual Primary Action Button */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            
            <div className="px-3.5 py-2 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-left font-mono">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Estimated Refund</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹15,000</span>
            </div>

            <button
              onClick={() => onNavigateStep(6)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>{hasUploadedForm16 ? 'Resume Filing' : 'Upload Form 16'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 5-Column Grid Filing Journey Timeline Bar (Zero Scrollbars) */}
        <div className="p-2.5 sm:p-3 bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl grid grid-cols-5 gap-1 sm:gap-2 text-[11px] sm:text-xs font-mono relative shadow-xs overflow-hidden">
          {journeyDetails.map((item) => (
            <div
              key={item.stage}
              className="relative group cursor-pointer col-span-1 flex items-center justify-center"
              onMouseEnter={() => setHoveredJourneyStage(item.stage)}
              onMouseLeave={() => setHoveredJourneyStage(null)}
            >
              <div className={`flex items-center gap-1 sm:gap-1.5 font-bold truncate px-1 py-0.5 rounded-lg ${
                item.status === 'VERIFIED' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' :
                item.status === 'COMPLETED' ? 'text-purple-700 dark:text-purple-400 bg-purple-500/10' :
                item.status === 'PENDING' ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10' : 'text-slate-600 dark:text-slate-400'
              }`}>
                {item.status === 'VERIFIED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> :
                 item.status === 'COMPLETED' ? <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" /> :
                 item.status === 'PENDING' ? <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" /> :
                 <span className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[8px] font-mono shrink-0">{item.stage}</span>}
                <span className="truncate">{item.stage}. {item.name}</span>
              </div>

              {/* Hover Popover */}
              <AnimatePresence>
                {hoveredJourneyStage === item.stage && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-48 p-2.5 bg-slate-900 text-white border border-white/10 rounded-xl shadow-2xl z-40 text-[11px] font-sans text-center pointer-events-none"
                  >
                    <div className="font-bold font-mono text-emerald-400">{item.stage}. {item.name}</div>
                    <div className="text-slate-200 text-[10.5px] mt-0.5">{item.details}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 2. CONTEXTUAL QUICK ACTIONS ROW                     */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigateStep(3)}
          className="p-3 bg-white/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/[0.04] hover:border-blue-500/40 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Upload Document</div>
            <div className="text-[10px] text-slate-400">Add Form 16 / Rent</div>
          </div>
        </button>

        <button
          onClick={() => onOpenWhatIf && onOpenWhatIf()}
          className="p-3 bg-white/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/[0.04] hover:border-purple-500/40 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">What-If Simulator</div>
            <div className="text-[10px] text-slate-400">Simulate Scenarios</div>
          </div>
        </button>

        <button
          onClick={() => onOpenPdf && onOpenPdf()}
          className="p-3 bg-white/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/[0.04] hover:border-emerald-500/40 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Generate PDF</div>
            <div className="text-[10px] text-slate-400">Tax Statement</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateStep(4)}
          className="p-3 bg-white/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/[0.04] hover:border-indigo-500/40 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Ask AI Copilot</div>
            <div className="text-[10px] text-slate-400">Instant Guidance</div>
          </div>
        </button>

        <button
          onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
          className="p-3 bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 text-left flex items-center gap-2.5 cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Command className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">⌘K Command</div>
            <div className="text-[10px] text-slate-400">Quick Palette</div>
          </div>
        </button>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 3. STATUS OVERVIEW GRID: Health + Deadline + Docs    */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tax Health Score Card with Interactive "Why?" */}
        <div className="bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] hover:border-emerald-500/30 rounded-[24px] p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg space-y-4 text-left group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Tax Health Score
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-md border border-emerald-500/20">
              Excellent
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
              <span className="text-2xl font-black leading-none">85</span>
              <span className="text-[9px] text-slate-400">/ 100</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Low Audit Risk</span>
                <button
                  onClick={() => setShowTaxHealthDetails(!showTaxHealthDetails)}
                  className="text-emerald-500 hover:underline text-[11px] font-mono cursor-pointer"
                >
                  (Why?)
                </button>
              </div>
              <div className="text-[11px] text-slate-500">80C & Form 16 cross-verified</div>
            </div>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            onClick={() => setShowTaxHealthDetails(!showTaxHealthDetails)}
            className="w-full pt-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-between border-t border-slate-200/60 dark:border-white/[0.04] cursor-pointer"
          >
            <span>{showTaxHealthDetails ? 'Hide Explanation' : 'See Score Breakdown →'}</span>
            {showTaxHealthDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showTaxHealthDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono"
              >
                <div className="flex justify-between"><span>PAN Cross-Match:</span> <strong className="text-emerald-500">✔ Matched</strong></div>
                <div className="flex justify-between"><span>Form 16 Ingested:</span> <strong className="text-emerald-500">✔ Verified</strong></div>
                <div className="flex justify-between"><span>AIS Interest Match:</span> <strong className="text-amber-500">⚠️ Pending</strong></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compact Deadline Card with Statutory Milestones Drawer */}
        <div className="bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] hover:border-amber-500/30 rounded-[24px] p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg space-y-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              ITR Filing Deadline
            </span>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold rounded-md">
              12 Days Left
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              31 July 2026
            </div>
            <div className="text-xs text-slate-500">
              Statutory due date under Sec 139(1)
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between flex-wrap gap-2 text-xs">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={() => setShowMilestonesDrawer(!showMilestonesDrawer)}
              className="font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Statutory Milestones</span>
              {showMilestonesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Statutory Milestones Expanded Timeline Drawer */}
          <AnimatePresence>
            {showMilestonesDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.04] text-[11px] font-mono"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-sans block mb-1">
                  AY 2026-27 Compliance Calendar
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-white/[0.04] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">15 June 2026</span>
                    <span className="text-[10px] text-slate-400">Employer Form 16 Cutoff</span>
                  </div>
                  <span className="text-[9.5px] text-emerald-500 font-bold uppercase">Completed ✔</span>
                </div>

                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 block">31 July 2026</span>
                    <span className="text-[10px] text-slate-400">Salaried ITR Filing Cutoff (Sec 139(1))</span>
                  </div>
                  <span className="text-[9.5px] text-amber-500 font-bold uppercase">Upcoming ⚠️</span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-white/[0.04] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">15 Sept 2026</span>
                    <span className="text-[10px] text-slate-400">Q2 Advance Tax Cutoff (45%)</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-bold uppercase">Upcoming</span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-white/[0.04] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">31 Dec 2026</span>
                    <span className="text-[10px] text-slate-400">Belated / Revised Return Cutoff</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-bold uppercase">Upcoming</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Document Status Preview Card */}
        <div className="bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] hover:border-blue-500/30 rounded-[24px] p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg space-y-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Documents Ready
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold rounded-md">
              100% Secure
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5 Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>2 Missing</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
            <button
              onClick={() => onNavigateStep(3)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 4. CENTERPIECE: AI NEXT BEST ACTION + COLLAPSIBLE WHY*/}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/25 rounded-[28px] p-6 md:p-8 backdrop-blur-md text-left relative overflow-hidden space-y-5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">
              AI Next Best Action
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Est. Time: <strong className="text-slate-900 dark:text-white">3 mins</strong></span>
            <span>•</span>
            <span>Confidence: <strong className="text-emerald-500">96%</strong></span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Claim Health Insurance (Section 80D)
              </h3>
            </div>
            
            {/* COLLAPSIBLE AI REASON BADGE */}
            <div className="space-y-1 font-sans">
              <button
                onClick={() => setShowActionReason(!showActionReason)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
              >
                <span>Why this recommendation?</span>
                {showActionReason ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {showActionReason && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-sans"
                  >
                    We detected zero medical insurance claims under Section 80D. Premium receipts for self or senior citizen parents reduce taxable income by up to ₹25,000.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-6">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Expected Tax Saving</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Save ₹25,000</span>
            </div>

            <button
              onClick={() => setIsQuickFixOpen(!isQuickFixOpen)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>{isQuickFixOpen ? 'Close Quick Fix' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1-CLICK INLINE QUICK-FIX DRAWER */}
        <AnimatePresence>
          {isQuickFixOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-blue-500/20 space-y-3 font-sans"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-blue-500/30">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Instant Section 80D Claim Entry</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Enter health insurance premium paid for FY 2025-26:
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">₹</span>
                    <input
                      type="number"
                      value={medicalAmountInput}
                      onChange={(e) => setMedicalAmountInput(e.target.value)}
                      className="pl-7 pr-3 py-2 w-32 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleApplyQuickFix80D}
                    disabled={quickFixSuccess}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {quickFixSuccess ? <Check className="w-4 h-4 text-white" /> : null}
                    <span>{quickFixSuccess ? 'Applied!' : 'Apply ₹25,000 Saving'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 5. PRIORITIZED INSIGHTS & ANALYTICS PREVIEW         */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Merged AI Copilot & Insights Card (7 cols) with Priority Ranking */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.04] pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Prioritized AI Insights
              </h4>
            </div>
            <button
              onClick={() => onNavigateStep(4)}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">AI Found</div>
            <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              ₹18,200 <span className="text-sm font-normal text-slate-600 dark:text-slate-300 font-sans">Potential Additional Savings</span>
            </div>
          </div>

          {/* PRIORITIZED RANKED INSIGHT CHIPS */}
          <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1">
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-500/20 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              HIGH PRIORITY: Missing Rent Receipt
            </span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-500/20 font-bold flex items-center gap-1">
              MEDIUM: Employer NPS Available
            </span>
          </div>
        </div>

        {/* Analytics Preview Card (5 cols) with Sparkline Trend Badge */}
        <div className="lg:col-span-5 bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.04] pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Analytics Preview
              </h4>
            </div>
            <button
              onClick={() => onNavigateStep(5)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Regime Delta Comparison Math Pill */}
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              NEW REGIME SAVES ₹18,240 VS OLD
            </span>
            <button 
              onClick={() => setShowOldRegimePreview(!showOldRegimePreview)}
              className="text-[9.5px] underline cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {showOldRegimePreview ? 'Hide Old' : 'Compare Old'}
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Effective Tax Rate:</span>
              <strong className="text-slate-900 dark:text-white">{showOldRegimePreview ? '7.2%' : '4.6%'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Refund Estimate:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{showOldRegimePreview ? '₹0' : '₹15,000'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Net Taxable Income:</span>
              <strong className="text-slate-900 dark:text-white">₹7,27,000</strong>
            </div>
          </div>
        </div>

      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 6. FLAGSHIP FEATURE: AI FILING READINESS ENGINE      */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <AIFilingReadinessEngine onNavigateStep={onNavigateStep} />
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 7. REFINED FOOTER STATUS                              */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ✔ AI Analysis Updated: 2 mins ago
          </span>
          <span>•</span>
          <span>✔ CBDT Rules: AY 2026-27 Active</span>
          <span>•</span>
          <span>✔ Data Encryption: AES-256 Client-Side</span>
        </div>

        <button
          onClick={() => setIsSecurityModalOpen(true)}
          className="hover:text-emerald-500 cursor-pointer font-bold transition-colors"
        >
          SECURE LOCAL SANDBOX (Inspect)
        </button>
      </motion.div>

      {/* Security Inspector Modal */}
      <SecurityInspectorModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

    </motion.div>
  );
};
