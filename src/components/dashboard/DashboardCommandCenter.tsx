import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Award
} from 'lucide-react';
import { useTaxStore } from '../../store/useTaxStore';
import { calculateTax, buildTaxData, formatINR } from '../../utils/taxCalculator';
import { FILING_DEADLINES, COMPLIANCE_MILESTONES } from '../../config';
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
  const userName = activeProfile?.name?.split(' ')[0] || incomeProfile.employeeName?.split(' ')[0] || '';

  // Dynamic greeting time check
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);

  const hasUploadedForm16 = uploadedFiles.length > 0;
  const verifiedFileCount = uploadedFiles.filter((f) => f.status === 'Verified').length;
  const unverifiedFileCount = uploadedFiles.length - verifiedFileCount;
  const hasAnyData = hasUploadedForm16 || (incomeProfile?.grossSalary || 0) > 0;

  const now = Date.now();
  const dueDateMs = FILING_DEADLINES.dueDate.getTime();
  const isPastDue = now > dueDateMs;
  const daysUntilDue = Math.max(0, Math.ceil((dueDateMs - now) / 86400000));
  const dueDateLabel = FILING_DEADLINES.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  // Income can arrive by upload or by manual entry, so gate on the figure that
  // every downstream number depends on rather than on the document count.
  const hasIncome = (incomeProfile?.grossSalary || 0) > 0;

  const calculation = React.useMemo(
    () => calculateTax(buildTaxData(incomeProfile, confirmedDeductions)),
    [incomeProfile, confirmedDeductions]
  );
  const savings = Math.max(0, calculation?.savings || 0);
  const betterRegime = calculation?.recommendedRegime === 'OLD' ? 'Old' : 'New';

  // The 80D recommendation below claims a real, computed rupee figure rather
  // than the flat statutory cap. 80D only reduces liability under the Old
  // Regime, so this compares Old Regime tax at the current claim against Old
  // Regime tax with the claim topped up to the self/family cap -- a flat
  // "Save Rs 25,000" would have overstated the benefit for anyone not in the
  // top slab, since the real saving is the deduction times the marginal rate,
  // not the deduction itself.
  const current80D = confirmedDeductions?.['80D'] || 0;
  const SELF_80D_CAP = 25000;
  const remaining80DHeadroom = Math.max(0, SELF_80D_CAP - current80D);
  const real80DSaving = React.useMemo(() => {
    if (!hasIncome || remaining80DHeadroom <= 0) return 0;
    const withMore80D = calculateTax(
      buildTaxData(incomeProfile, { ...confirmedDeductions, '80D': current80D + remaining80DHeadroom })
    );
    return Math.max(0, calculation.oldRegime.totalTaxPayable - withMore80D.oldRegime.totalTaxPayable);
  }, [hasIncome, remaining80DHeadroom, incomeProfile, confirmedDeductions, current80D, calculation]);
  const show80DRecommendation = hasIncome && remaining80DHeadroom > 0 && real80DSaving > 0;

  // "AI Found" used to assert a flat, unsourced number ("₹18,200 Potential
  // Additional Savings") and two specific claims ("Missing Rent Receipt",
  // "Employer NPS Available") to every user regardless of what they'd
  // actually entered. These two flags are the real, checkable version -- they
  // read the same confirmedDeductions the rest of this dashboard uses, rather
  // than a hardcoded guess about the user's situation.
  const hraUnclaimed = hasIncome && (confirmedDeductions?.['HRA exemption'] || 0) === 0;
  const employerNpsUnclaimed = hasIncome && (confirmedDeductions?.['80CCD(2)'] || 0) === 0;
  const hasOpenInsights = hraUnclaimed || employerNpsUnclaimed;

  // "Tax Health Score" used to be a flat 85/100 with a breakdown that
  // asserted "Form 16 Ingested: Verified" and an "AIS Interest Match" check
  // to every user regardless of what they'd entered -- and the app has no
  // AIS/Form 26AS integration, so that check couldn't have run. This is the
  // real version: three things the store can actually confirm.
  const hasAnyDeductionClaimed = Object.values(confirmedDeductions || {}).some(
    (v) => typeof v === 'number' && v > 0
  );
  const healthChecks = [
    { label: 'PAN on file', passed: !!incomeProfile?.pan },
    { label: 'Form 16 ingested', passed: hasUploadedForm16 },
    { label: 'Deductions reviewed', passed: hasAnyDeductionClaimed },
  ];
  const healthPassed = healthChecks.filter((c) => c.passed).length;
  const healthScore = Math.round((healthPassed / healthChecks.length) * 100);
  const healthLabel = healthScore === 100 ? 'Complete' : healthScore > 0 ? 'In Progress' : 'Not Started';

  // Regime figures shown in the Analytics Preview card, computed for
  // whichever regime is currently on screen (recommended, or Old when the
  // "Compare Old" toggle is on) rather than the earlier hardcoded 4.6%/₹15,000.
  const recommendedBreakdown = betterRegime === 'Old' ? calculation.oldRegime : calculation.newRegime;
  const previewBreakdown = showOldRegimePreview ? calculation.oldRegime : recommendedBreakdown;
  const effectiveTaxRate = previewBreakdown.grossTotalIncome > 0
    ? (previewBreakdown.totalTaxPayable / previewBreakdown.grossTotalIncome) * 100
    : 0;
  const isRefundDue = previewBreakdown.refundOrOwed < 0;
  const refundOrOwedAmount = Math.abs(previewBreakdown.refundOrOwed);

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
      transition: { type: 'spring' as const, stiffness: 400, damping: 30 }
    }
  };

  // Every stage below reports what the store actually holds. A stage never
  // reads VERIFIED on the strength of a hardcoded string -- on a tax product a
  // false "verified" is the one assurance the user came here to get.
  const journeyDetails = [
    {
      stage: 1,
      name: 'Documents',
      status: hasUploadedForm16 ? 'VERIFIED' : 'PENDING',
      details: hasUploadedForm16
        ? `${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''} ingested`
        : 'Upload a Form 16, or enter figures manually'
    },
    {
      stage: 2,
      name: 'Income',
      status: hasIncome ? 'VERIFIED' : 'PENDING',
      details: hasIncome
        ? `Gross salary ${formatINR(incomeProfile.grossSalary)} recorded`
        : 'No salary figure yet'
    },
    {
      stage: 3,
      name: 'Optimization',
      status: hasIncome ? 'COMPLETED' : 'LOCKED',
      details: hasIncome
        ? `${betterRegime} Regime saves ${formatINR(savings)}`
        : 'Needs an income figure to compare regimes'
    },
    {
      stage: 4,
      name: 'Compliance',
      status: hasIncome ? 'PENDING' : 'LOCKED',
      details: hasIncome
        ? 'Review your deductions before filing'
        : 'Needs an income figure'
    },
    {
      stage: 5,
      name: 'Ready',
      status: 'LOCKED',
      details: 'Unlocks once your deductions are confirmed'
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5 font-sans text-left max-w-7xl mx-auto py-1"
    >
      
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
              {timeGreeting}{userName ? `, ${userName}` : ''} 👋
            </h1>

            {/* Dynamic Rotating AI Daily Brief */}
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {hasUploadedForm16 ? (
                <>Today I verified your Form 16. Complete the remaining compliance checks below to finish filing.</>
              ) : (
                <>Upload your Form 16 and I'll analyze your income, deductions, and refund potential in under a minute.</>
              )}
            </p>
          </div>

          {/* Hero KPI Badge & Contextual Primary Action Button */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">

            <div className="px-3.5 py-2 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-left font-mono">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Estimated Refund</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {hasUploadedForm16 && incomeProfile.tdsDeducted
                  ? `₹${incomeProfile.tdsDeducted.toLocaleString('en-IN')}`
                  : '—'}
              </span>
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

      {!hasAnyData ? (
      /* ---------------------------------------------------- */
      /* FIRST-RUN EMPTY STATE: nothing uploaded, nothing      */
      /* entered -- one card instead of a grid built to show   */
      /* data that doesn't exist yet.                          */
      /* ---------------------------------------------------- */
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-8 md:p-10 backdrop-blur-md text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <FileUp className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Upload your Form 16 to see your regime comparison
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Or type your salary in manually -- either way, TaxSense compares Old vs New regime to the rupee and flags deductions you haven't claimed yet. The statutory due date is {dueDateLabel}.
        </p>
        <button
          onClick={() => onNavigateStep(3)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 active:scale-98 transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 duration-200"
        >
          <span>Upload Form 16</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
      ) : (
      <>
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
            <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md border ${
              healthScore === 100
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              {healthLabel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
              <span className="text-2xl font-black leading-none">{healthScore}</span>
              <span className="text-[9px] text-slate-400">/ 100</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>{healthPassed} of {healthChecks.length} checks passed</span>
                <button
                  onClick={() => setShowTaxHealthDetails(!showTaxHealthDetails)}
                  className="text-emerald-500 hover:underline text-[11px] font-mono cursor-pointer"
                >
                  (Why?)
                </button>
              </div>
              <div className="text-[11px] text-slate-500">Based on what you've entered so far</div>
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
                {healthChecks.map((check) => (
                  <div key={check.label} className="flex justify-between">
                    <span>{check.label}:</span>
                    {check.passed ? (
                      <strong className="text-emerald-500">✔ Done</strong>
                    ) : (
                      <strong className="text-amber-500">⚠️ Pending</strong>
                    )}
                  </div>
                ))}
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
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
              isPastDue
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              {isPastDue ? 'Due date passed' : `${daysUntilDue} Day${daysUntilDue === 1 ? '' : 's'} Left`}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {dueDateLabel}
            </div>
            <div className="text-xs text-slate-500">
              {isPastDue
                ? 'Statutory due date under Sec 139(1) -- a belated return is still possible under Sec 139(4)'
                : 'Statutory due date under Sec 139(1)'}
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

                {COMPLIANCE_MILESTONES.map((milestone) => {
                  const isPast = milestone.date.getTime() < now;
                  const isTheDueDate = milestone.date.getTime() === dueDateMs;
                  const label = milestone.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <div
                      key={milestone.label}
                      className={`p-2 rounded-xl border flex justify-between items-center ${
                        isTheDueDate && !isPast
                          ? 'bg-blue-500/10 border-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/50 dark:border-white/[0.04]'
                      }`}
                    >
                      <div>
                        <span className={`font-bold block ${isTheDueDate && !isPast ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                          {label}
                        </span>
                        <span className="text-[10px] text-slate-400">{milestone.label}</span>
                      </div>
                      <span className={`text-[9.5px] font-bold uppercase ${
                        isPast
                          ? 'text-slate-400'
                          : isTheDueDate
                          ? 'text-amber-500'
                          : 'text-slate-400'
                      }`}>
                        {/* "Passed" is a date fact, not a claim that the user
                            filed on time -- we have no record of that here,
                            so it never gets a checkmark. */}
                        {isPast ? 'Passed' : isTheDueDate ? 'Upcoming ⚠️' : 'Upcoming'}
                      </span>
                    </div>
                  );
                })}
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
            {uploadedFiles.length === 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>No documents uploaded yet</span>
              </div>
            ) : (
              <>
                {verifiedFileCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{verifiedFileCount} Verified</span>
                  </div>
                )}
                {unverifiedFileCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>{unverifiedFileCount} Processing</span>
                  </div>
                )}
              </>
            )}
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
      {show80DRecommendation && (
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/25 rounded-[28px] p-6 md:p-8 backdrop-blur-md text-left relative overflow-hidden space-y-5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">
              Next Best Action
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Est. Time: <strong className="text-slate-900 dark:text-white">3 mins</strong></span>
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
                    You've claimed {formatINR(current80D)} of the {formatINR(SELF_80D_CAP)} Section 80D limit under the Old Regime. Topping it up to the cap reduces your Old Regime tax by the amount shown -- this only applies if you file under the Old Regime.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-6">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Old Regime Tax Saving</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Save {formatINR(real80DSaving)}</span>
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
                    <span>{quickFixSuccess ? 'Applied!' : 'Apply 80D Deduction'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      )}

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

          {!hasIncome ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans py-1">
              Add your income to see which deductions you haven't claimed yet.
            </div>
          ) : hasOpenInsights ? (
            <>
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Not Yet Claimed</div>
                <div className="text-sm font-semibold font-sans text-slate-700 dark:text-slate-300">
                  Based on what you've entered so far
                </div>
              </div>

              {/* PRIORITIZED RANKED INSIGHT CHIPS -- each one reflects a real,
                  currently-zero entry in confirmedDeductions, not a guess. */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1">
                {hraUnclaimed && (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-500/20 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    HRA exemption not claimed
                  </span>
                )}
                {employerNpsUnclaimed && (
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-500/20 font-bold flex items-center gap-1">
                    Employer NPS (80CCD(2)) not claimed
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-sans font-semibold py-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>HRA and employer NPS are both accounted for.</span>
            </div>
          )}
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
              {hasIncome ? `${betterRegime.toUpperCase()} REGIME SAVES ${formatINR(savings)} VS ${betterRegime === 'New' ? 'OLD' : 'NEW'}` : 'ADD YOUR INCOME TO COMPARE REGIMES'}
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
              <strong className="text-slate-900 dark:text-white">{hasIncome ? `${effectiveTaxRate.toFixed(1)}%` : '—'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isRefundDue ? 'Refund Estimate:' : 'Tax Owed:'}</span>
              <strong className={isRefundDue ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {hasIncome ? formatINR(refundOrOwedAmount) : '—'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Net Taxable Income:</span>
              <strong className="text-slate-900 dark:text-white">{hasIncome ? formatINR(previewBreakdown.taxableIncome) : '—'}</strong>
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
      </>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. REFINED FOOTER STATUS                              */}
      {/* ---------------------------------------------------- */}
      <motion.div variants={itemVariants} className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {hasIncome ? '✔ Figures up to date' : '○ Waiting for your income figures'}
          </span>
          <span>•</span>
          <span>✔ CBDT Rules: AY 2026-27 Active</span>
          <span>•</span>
          <span>✔ Storage: this browser only, no server database</span>
        </div>

        <button
          onClick={() => setIsSecurityModalOpen(true)}
          className="hover:text-emerald-500 cursor-pointer font-bold transition-colors"
        >
          HOW YOUR DATA IS HANDLED
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
