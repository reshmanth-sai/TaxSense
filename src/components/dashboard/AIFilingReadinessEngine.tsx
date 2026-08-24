import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTaxStore } from '../../store/useTaxStore';
import { calculateTax, buildTaxData } from '../../utils/taxCalculator';

interface AIFilingReadinessEngineProps {
  onNavigateStep: (step: number) => void;
}

interface ReadinessCheck {
  id: string;
  name: string;
  detail: string;
  verified: boolean;
  step: number;
}

export const AIFilingReadinessEngine: React.FC<AIFilingReadinessEngineProps> = ({ onNavigateStep }) => {
  const [isReportExpanded, setIsReportExpanded] = useState(false);

  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);

  const calculation = React.useMemo(
    () => calculateTax(buildTaxData(incomeProfile, confirmedDeductions)),
    [incomeProfile, confirmedDeductions]
  );

  const hasDeduction = Object.values(confirmedDeductions || {}).some(
    (value) => typeof value === 'number' && value > 0
  );

  const checks: ReadinessCheck[] = [
    {
      id: 'identity',
      name: 'Identity Details',
      detail: incomeProfile?.pan ? `PAN on file: ${incomeProfile.pan}` : 'PAN not yet provided',
      verified: !!incomeProfile?.pan,
      step: 1,
    },
    {
      id: 'income',
      name: 'Income Details',
      detail: incomeProfile?.grossSalary > 0 && incomeProfile?.employerName
        ? `${incomeProfile.employerName} — gross salary captured`
        : 'Gross salary and employer not yet captured',
      verified: incomeProfile?.grossSalary > 0 && !!incomeProfile?.employerName,
      step: 1,
    },
    {
      id: 'documents',
      name: 'Supporting Documents',
      detail: uploadedFiles.length > 0
        ? `${uploadedFiles.length} document${uploadedFiles.length === 1 ? '' : 's'} uploaded`
        : 'No documents uploaded yet',
      verified: uploadedFiles.length > 0,
      step: 2,
    },
    {
      id: 'deductions',
      name: 'Deductions Reviewed',
      detail: hasDeduction ? 'At least one deduction confirmed' : 'No deductions confirmed yet',
      verified: hasDeduction,
      step: 3,
    },
    {
      id: 'tds',
      name: 'TDS Recorded',
      detail: incomeProfile?.tdsDeducted > 0 ? 'TDS amount captured from Form 16' : 'TDS not yet recorded',
      verified: incomeProfile?.tdsDeducted > 0,
      step: 1,
    },
    {
      id: 'regime',
      name: 'Regime Comparison',
      detail: calculation
        ? `${calculation.recommendedRegime === 'OLD' ? 'Old' : 'New'} regime evaluated as lower tax`
        : 'Regime comparison not available yet',
      verified: !!calculation,
      step: 6,
    },
  ];

  const passedCount = checks.filter((c) => c.verified).length;
  const readinessPct = Math.round((passedCount / checks.length) * 100);
  const outstanding = checks.filter((c) => !c.verified);

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
                Filing Readiness
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md border flex items-center gap-1 ${
                readinessPct === 100
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${readinessPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {readinessPct === 100 ? 'Ready to File' : 'Almost Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracks which parts of your return are filled in and verified before submission.
            </p>
          </div>
        </div>
      </div>

      {/* Main Summary: Readiness Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

        <div className="lg:col-span-7 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono shrink-0 shadow-inner">
            <span className="text-3xl font-black leading-none">{readinessPct}%</span>
            <span className="text-[9px] text-slate-400 font-sans font-bold uppercase mt-0.5">Readiness</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {readinessPct === 100
                ? 'Your return is fully filled in and ready to file.'
                : `${passedCount} of ${checks.length} checks passed. Complete the remaining items below.`}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✔ {passedCount} Checks Passed</span>
            </div>
          </div>
        </div>

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

      {/* Outstanding tasks, derived from the same real checks */}
      {outstanding.length > 0 && (
        <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.04] space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Outstanding Items ({outstanding.length} Remaining)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outstanding.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between gap-3 text-left"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                  <div className="text-[10.5px] font-mono text-slate-500">{item.detail}</div>
                </div>
                <button
                  onClick={() => onNavigateStep(item.step)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 hover:opacity-90"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable full check list */}
      <AnimatePresence>
        {isReportExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-slate-200/60 dark:border-white/[0.04] space-y-3"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Readiness Checklist
            </span>

            <div className="space-y-2">
              {checks.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    {item.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <strong className="text-slate-900 dark:text-white font-sans">{item.name}</strong>
                      <span className="text-slate-500 block text-[11px] font-sans">{item.detail}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase self-start sm:self-center ${
                    item.verified
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.verified ? 'Verified' : 'Needs Review'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
