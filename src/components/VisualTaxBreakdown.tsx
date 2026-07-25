import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Info, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Award
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';

interface VisualTaxBreakdownProps {
  className?: string;
}

export const VisualTaxBreakdown: React.FC<VisualTaxBreakdownProps> = ({ className = '' }) => {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);

  // Compute tax calculations for both regimes
  const taxData = useMemo(() => {
    return {
      assessmentYear: '2026-27',
      grossSalary: incomeProfile.grossSalary || 850000,
      basicSalary: incomeProfile.basicSalary || Math.round((incomeProfile.grossSalary || 850000) * 0.4),
      hraExemption: confirmedDeductions['HRA exemption'] || 0,
      ltaExemption: 0,
      standardDeductionOld: 50000,
      standardDeductionNew: 75000,
      otherIncome: incomeProfile.otherIncome || 0,
      deduction80C: confirmedDeductions['80C'] || 0,
      deduction80D: confirmedDeductions['80D'] || 0,
      deduction80TTA: 10000,
      deduction80G: 0,
      section24b: confirmedDeductions['section24b'] || 0,
      deduction80CCD1B: confirmedDeductions['80CCD(1B)'] || 0,
      tdsDeducted: incomeProfile.tdsDeducted || 15000,
      stcg: incomeProfile.stcg || 0,
      ltcg: incomeProfile.ltcg || 0,
    };
  }, [incomeProfile, confirmedDeductions]);

  const calculation = useMemo(() => calculateTax(taxData), [taxData]);
  const [selectedRegime, setSelectedRegime] = useState<'NEW' | 'OLD'>(calculation.recommendedRegime as 'NEW' | 'OLD');
  const [activeSegmentHover, setActiveSegmentHover] = useState<string | null>(null);

  const activeBreakdown = selectedRegime === 'NEW' ? calculation.newRegime : calculation.oldRegime;

  const grossIncome = activeBreakdown.grossTotalIncome || 850000;
  const totalDeductions = activeBreakdown.totalDeductions || 0;
  const taxableIncome = activeBreakdown.taxableIncome || 0;
  const netTaxPayable = activeBreakdown.totalTaxPayable || 0;
  const tdsDeducted = taxData.tdsDeducted || 0;
  const refundOrOwed = netTaxPayable - tdsDeducted;

  // Percentage shares
  const deductionsPct = Math.min(100, Math.max(0, Math.round((totalDeductions / grossIncome) * 100)));
  const taxPct = Math.min(100, Math.max(0, parseFloat(((netTaxPayable / grossIncome) * 100).toFixed(1))));
  const netRetainedPct = Math.max(0, 100 - taxPct - deductionsPct);
  const effectiveTaxRate = ((netTaxPayable / grossIncome) * 100).toFixed(1);

  // SVG Donut Chart Calculation
  const donutRadius = 70;
  const circumference = 2 * Math.PI * donutRadius;
  
  // Segment lengths
  const deductionsLength = (deductionsPct / 100) * circumference;
  const taxLength = (taxPct / 100) * circumference;
  const netRetainedLength = Math.max(0, circumference - deductionsLength - taxLength);

  return (
    <div className={`bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md text-left space-y-6 ${className}`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.04] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Visual Income & Tax Breakdown
              </h3>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-indigo-500/20">
                Visual Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive visualization showing how your gross income flows into exemptions, taxable slabs, and net tax.
            </p>
          </div>
        </div>

        {/* Regime Visual Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-white/[0.05] shrink-0">
          <button
            onClick={() => setSelectedRegime('NEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRegime === 'NEW'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>New Regime</span>
            {calculation.recommendedRegime === 'NEW' && (
              <span className="px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 text-[9px] font-extrabold rounded">Best</span>
            )}
          </button>
          <button
            onClick={() => setSelectedRegime('OLD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRegime === 'OLD'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Old Regime</span>
            {calculation.recommendedRegime === 'OLD' && (
              <span className="px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 text-[9px] font-extrabold rounded">Best</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: SVG Donut Chart + Effective Rate Gauge & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Interactive SVG Donut Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-white/[0.03] relative overflow-hidden">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              {/* Background Track */}
              <circle
                cx="90"
                cy="90"
                r={donutRadius}
                stroke="currentColor"
                strokeWidth="18"
                className="text-slate-200/60 dark:text-slate-800/60 fill-none"
              />

              {/* Segment 1: Net Take-Home Salary (Blue) */}
              <motion.circle
                cx="90"
                cy="90"
                r={donutRadius}
                stroke="#3B82F6"
                strokeWidth="18"
                strokeDasharray={`${netRetainedLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="fill-none cursor-pointer transition-all duration-300 hover:opacity-80"
                onMouseEnter={() => setActiveSegmentHover('takehome')}
                onMouseLeave={() => setActiveSegmentHover(null)}
              />

              {/* Segment 2: Exemptions & Deductions (Emerald) */}
              <motion.circle
                cx="90"
                cy="90"
                r={donutRadius}
                stroke="#10B981"
                strokeWidth="18"
                strokeDasharray={`${deductionsLength} ${circumference}`}
                strokeDashoffset={-netRetainedLength}
                strokeLinecap="round"
                className="fill-none cursor-pointer transition-all duration-300 hover:opacity-80"
                onMouseEnter={() => setActiveSegmentHover('deductions')}
                onMouseLeave={() => setActiveSegmentHover(null)}
              />

              {/* Segment 3: Net Tax Payable (Purple) */}
              <motion.circle
                cx="90"
                cy="90"
                r={donutRadius}
                stroke="#8B5CF6"
                strokeWidth="18"
                strokeDasharray={`${taxLength} ${circumference}`}
                strokeDashoffset={-(netRetainedLength + deductionsLength)}
                strokeLinecap="round"
                className="fill-none cursor-pointer transition-all duration-300 hover:opacity-80"
                onMouseEnter={() => setActiveSegmentHover('tax')}
                onMouseLeave={() => setActiveSegmentHover(null)}
              />
            </svg>

            {/* Donut Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {activeSegmentHover === 'deductions' 
                  ? 'Tax Saved' 
                  : activeSegmentHover === 'tax' 
                  ? 'Net Tax' 
                  : activeSegmentHover === 'takehome' 
                  ? 'Take-Home' 
                  : 'Effective Tax'}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {activeSegmentHover === 'deductions' 
                  ? formatINR(totalDeductions) 
                  : activeSegmentHover === 'tax' 
                  ? formatINR(netTaxPayable) 
                  : activeSegmentHover === 'takehome' 
                  ? formatINR(grossIncome - netTaxPayable) 
                  : `${effectiveTaxRate}%`}
              </span>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {activeSegmentHover ? 'Hovering Segment' : `of ${formatINR(grossIncome)} Gross`}
              </span>
            </div>
          </div>

          {/* Chart Legend Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-[11px] font-semibold">
            <div 
              onMouseEnter={() => setActiveSegmentHover('takehome')}
              onMouseLeave={() => setActiveSegmentHover(null)}
              className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Net Take-Home ({netRetainedPct}%)</span>
            </div>
            <div 
              onMouseEnter={() => setActiveSegmentHover('deductions')}
              onMouseLeave={() => setActiveSegmentHover(null)}
              className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Deductions ({deductionsPct}%)</span>
            </div>
            <div 
              onMouseEnter={() => setActiveSegmentHover('tax')}
              onMouseLeave={() => setActiveSegmentHover(null)}
              className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Net Tax ({taxPct}%)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Waterfall Step Ledger & Effective Rate Gauge (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Effective Tax Rate Gauge Badge */}
          <div className="p-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent border border-blue-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Effective Tax Rate Gauge
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                You pay <strong className="text-slate-900 dark:text-white font-bold">{effectiveTaxRate}%</strong> of your total salary as income tax under {selectedRegime} Regime.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {effectiveTaxRate}%
              </span>
              <span className="text-[9.5px] font-bold text-emerald-500 block uppercase tracking-wider">
                {parseFloat(effectiveTaxRate) <= 10 ? 'Low Tax Burden' : parseFloat(effectiveTaxRate) <= 20 ? 'Moderate Tax' : 'High Slab Tax'}
              </span>
            </div>
          </div>

          {/* Waterfall Flow Ledger Steps */}
          <div className="space-y-2.5">
            {/* Step 1: Gross Total Income */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold flex items-center justify-center">1</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Gross Annual Income</div>
                  <div className="text-[10.5px] text-slate-500">Base salary + other income sources</div>
                </div>
              </div>
              <div className="font-mono font-bold text-slate-900 dark:text-white">
                {formatINR(grossIncome)}
              </div>
            </div>

            {/* Step 2: Exemptions & Deductions */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold flex items-center justify-center">2</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Tax-Free Exemptions & Deductions</div>
                  <div className="text-[10.5px] text-slate-500">
                    {selectedRegime === 'NEW' ? 'Standard Deduction ₹75,000' : 'HRA, 80C, 80D, NPS & Standard Deduction'}
                  </div>
                </div>
              </div>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                -{formatINR(totalDeductions)}
              </div>
            </div>

            {/* Step 3: Taxable Income Slabs */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold flex items-center justify-center">3</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Net Taxable Income</div>
                  <div className="text-[10.5px] text-slate-500">Income subject to slab rates</div>
                </div>
              </div>
              <div className="font-mono font-bold text-slate-900 dark:text-white">
                {formatINR(taxableIncome)}
              </div>
            </div>

            {/* Step 4: Net Tax Payable */}
            <div className="p-3 bg-purple-500/[0.04] border border-purple-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold flex items-center justify-center">4</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Net Tax Payable (Incl. 4% Cess)</div>
                  <div className="text-[10.5px] text-slate-500">Total tax liability computed</div>
                </div>
              </div>
              <div className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {formatINR(netTaxPayable)}
              </div>
            </div>

            {/* Step 5: TDS & Refund Status */}
            <div className="p-3 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold flex items-center justify-center">5</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">TDS Deducted vs Final Status</div>
                  <div className="text-[10.5px] text-slate-500">TDS: {formatINR(tdsDeducted)}</div>
                </div>
              </div>
              <div>
                {refundOrOwed < 0 ? (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg font-mono font-bold text-xs">
                    Refund: {formatINR(Math.abs(refundOrOwed))}
                  </span>
                ) : refundOrOwed > 0 ? (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg font-mono font-bold text-xs">
                    Due: {formatINR(refundOrOwed)}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg font-mono font-bold text-xs">
                    Zero Due
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
