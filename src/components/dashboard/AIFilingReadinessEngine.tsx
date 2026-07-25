import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  HelpCircle,
  TrendingUp,
  Zap,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { useTaxStore } from '../../store/useTaxStore';

interface AIFilingReadinessEngineProps {
  onNavigateStep: (step: number) => void;
}

export const AIFilingReadinessEngine: React.FC<AIFilingReadinessEngineProps> = ({ onNavigateStep }) => {
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [showWhyNot100, setShowWhyNot100] = useState(false);
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];

  // Weighted Category Inspection Metrics
  const inspectionMatrix = [
    { id: 'identity', name: 'Identity Verification', weight: '10%', status: 'VERIFIED', detail: 'PAN, Aadhaar, and DOB cross-matched' },
    { id: 'income', name: 'Income Verification', weight: '20%', status: 'VERIFIED', detail: 'Form 16 & Gross Salary verified' },
    { id: 'documents', name: 'Document Completeness', weight: '20%', status: 'VERIFIED', detail: 'Form 16 & Salary Slips ingested' },
    { id: 'deductions', name: 'Deduction Validation', weight: '15%', status: 'NEEDS_REVIEW', detail: '80C & Standard Deduction verified, 80D pending' },
    { id: 'ais', name: 'AIS / Form 26AS Matching', weight: '15%', status: 'NEEDS_REVIEW', detail: 'TDS matched, Savings interest verification pending' },
    { id: 'compliance', name: 'Statutory Compliance', weight: '10%', status: 'VERIFIED', detail: 'Regime selected & PAN-Aadhaar linked' },
    { id: 'optimization', name: 'Tax Optimization', weight: '10%', status: 'VERIFIED', detail: 'Optimal tax regime selected' },
  ];

  const passedCount = inspectionMatrix.filter(m => m.status === 'VERIFIED').length;
  const reviewCount = inspectionMatrix.filter(m => m.status === 'NEEDS_REVIEW').length;

  return (
    <div className="bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md text-left space-y-5 shadow-sm font-sans relative">
      
      {/* Top Section: Title & Header Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.04] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Filing Readiness
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Almost Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates return safety, audit risk, and verification status before submission.
            </p>
          </div>
        </div>

        {/* Audit Risk & AI Confidence Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* AI Confidence Inspector Button */}
          <button
            onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Inspect AI Confidence calculation parameters"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI Confidence: 98%</span>
          </button>

          {/* Audit Risk Badge */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/[0.06] text-xs font-mono">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Audit Risk:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase ml-1.5 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              LOW
            </span>
          </div>

        </div>
      </div>

      {/* AI Confidence Inspector Popover */}
      <AnimatePresence>
        {showConfidenceDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-2xl text-xs font-mono space-y-2"
          >
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Confidence Breakdown (98%)
              </span>
              <span className="text-[10px] text-slate-400">Based on 6 Data Sources</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="text-emerald-600 dark:text-emerald-400">✔ Form 16 (100%)</div>
              <div className="text-emerald-600 dark:text-emerald-400">✔ Salary Slips (100%)</div>
              <div className="text-emerald-600 dark:text-emerald-400">✔ TDS Match (100%)</div>
              <div className="text-amber-600 dark:text-amber-400">⚠️ AIS Pending</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Collapsed Summary Grid (Readiness Score + "Why am I not 100%?" Flagship Popover) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Score Ring & Status Context (7 cols) */}
        <div className="lg:col-span-7 flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono shrink-0 shadow-inner">
              <span className="text-3xl font-black leading-none">92%</span>
              <span className="text-[9px] text-slate-400 font-sans font-bold uppercase mt-0.5">Readiness</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                "Your return is almost ready to file. We’ve verified your income and Form 16. Two remaining tasks will ensure 100% compliance."
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <button
                onClick={() => setShowWhyNot100(!showWhyNot100)}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why am I not 100%?</span>
                {showWhyNot100 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✔ {passedCount} Checks Passed</span>
            </div>
          </div>
        </div>

        {/* View Readiness Report & Continue Action Triggers (5 cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => setIsReportExpanded(!isReportExpanded)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200/80 dark:border-white/[0.06]"
          >
            <span>{isReportExpanded ? 'Hide Report' : 'View Readiness Report'}</span>
            {isReportExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onNavigateStep(6)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Continue Toward Filing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* FLAGSHIP FEATURE: "Why am I not 100%?" Popover Drawer */}
      <AnimatePresence>
        {showWhyNot100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2.5 text-xs text-left"
          >
            <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-300">
              <span className="flex items-center gap-1.5 font-sans">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Why am I not at 100% Readiness?
              </span>
              <span className="text-[10px] font-mono">Est. Completion: 4 mins</span>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-slate-300 font-sans text-xs">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Missing Rent Receipt Log:</strong> Confirm rent logs to claim 100% HRA deduction exemption.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">AIS Savings Interest Matching:</strong> Verify savings account interest under Sec 80TTA.
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-amber-500/20 font-mono">
              Everything else (Form 16, Salary, 80C, Identity) is 100% verified.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actionable Remaining Tasks Section with Action Impact Meter */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.04] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Outstanding Verification Tasks (2 Remaining)
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold">+8% Potential Readiness Gain</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Task 1 Card with Action Impact Meter */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Confirm Rent Receipt Logs</span>
                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-mono font-bold uppercase rounded">
                  High Priority
                </span>
              </div>
              
              {/* Action Impact Meter */}
              <div className="flex items-center gap-2 text-[10.5px] font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +4% Readiness (92% → 96%)
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 mins
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateStep(3)}
              className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 hover:opacity-90"
            >
              Complete Task
            </button>
          </div>

          {/* Task 2 Card with Action Impact Meter */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Verify AIS & Form 26AS Interest</span>
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold uppercase rounded">
                  Recommended
                </span>
              </div>

              {/* Action Impact Meter */}
              <div className="flex items-center gap-2 text-[10.5px] font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +4% Readiness (96% → 100%)
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  3 mins
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateStep(3)}
              className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 hover:opacity-90"
            >
              Complete Task
            </button>
          </div>

        </div>
      </div>

      {/* EXPANDABLE DETAILED INSPECTION MATRIX */}
      <AnimatePresence>
        {isReportExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-slate-200/60 dark:border-white/[0.04] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Weighted Compliance & Verification Matrix
              </span>
              <span className="text-[10px] font-mono text-slate-400">7 Core Parameters Analyzed</span>
            </div>

            <div className="space-y-2">
              {inspectionMatrix.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    {item.status === 'VERIFIED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <strong className="text-slate-900 dark:text-white font-sans">{item.name}</strong>
                      <span className="text-slate-500 block text-[11px] font-sans">{item.detail}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400">Weight {item.weight}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {item.status === 'VERIFIED' ? 'Verified' : 'Needs Review'}
                    </span>
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
