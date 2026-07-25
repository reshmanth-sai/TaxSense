import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Gift,
  Coins
} from 'lucide-react';
import { useTaxStore } from '../../store/useTaxStore';
import { formatINR } from '../../utils/taxCalculator';

interface CTCEfficiencyScorecardProps {
  className?: string;
  onOpenWhatIf?: () => void;
}

export const CTCEfficiencyScorecard: React.FC<CTCEfficiencyScorecardProps> = ({ 
  className = '',
  onOpenWhatIf 
}) => {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);

  const grossSalary = incomeProfile.grossSalary || 850000;
  const basicSalary = incomeProfile.basicSalary || Math.round(grossSalary * 0.4);
  const employerNPS = confirmedDeductions['80CCD(2)'] || 0;

  // Compute CTC Efficiency Metrics
  const analysis = useMemo(() => {
    let score = 70;
    const tips = [];

    // 1. Basic Salary Ratio Check (Ideal 40-50%)
    const basicRatio = (basicSalary / grossSalary) * 100;
    if (basicRatio >= 40 && basicRatio <= 50) {
      score += 15;
    } else if (basicRatio < 40) {
      tips.push({
        id: 'basic_low',
        title: 'Increase Basic Salary to 40% of CTC',
        taxSaving: 'Unlocks higher HRA & PF match',
        detail: `Your Basic is currently ${basicRatio.toFixed(1)}% of CTC. Restructuring to 40% increases your HRA exemption eligibility.`
      });
    }

    // 2. Employer NPS Sec 80CCD(2) Check (100% Tax Free in New Regime!)
    const maxNPSAllowed = Math.round(basicSalary * 0.14);
    if (employerNPS > 0) {
      score += 15;
    } else {
      const potentialNpsSaving = Math.round(maxNPSAllowed * 0.312); // 30% tax bracket
      tips.push({
        id: 'nps_80ccd2',
        title: 'Opt for Employer NPS (Sec 80CCD(2)) via HR',
        taxSaving: `Save up to ${formatINR(potentialNpsSaving)} tax`,
        detail: `Under Union Budget rules, Employer NPS contribution up to 14% of Basic (${formatINR(maxNPSAllowed)}) is 100% tax-free in BOTH Old & New Regimes!`
      });
    }

    // 3. Flexible Benefit Plan (FBP) Meal Coupons
    tips.push({
      id: 'fbp_meals',
      title: 'Claim Tax-Free Meal Vouchers (₹2,200/mo)',
      taxSaving: 'Save ₹8,200 tax/year',
      detail: 'Ask HR to reallocate Special Allowance into Sodexo/Zomato tax-free meal passes (₹26,400 annually tax-exempt).'
    });

    return {
      score: Math.min(100, score),
      basicRatio: basicRatio.toFixed(1),
      maxNPSAllowed,
      tips
    };
  }, [grossSalary, basicSalary, employerNPS]);

  return (
    <div className={`bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md text-left space-y-6 ${className}`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.04] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                CTC & Employer Tax Efficiency
              </h3>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-purple-500/20">
                Salary Restructuring
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates how tax-efficient your corporate CTC structure is for AY 2026-27 rules.
            </p>
          </div>
        </div>

        {/* Score Ring / Gauge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tax Efficiency Score
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
              <span>{analysis.score}/100</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                analysis.score >= 85 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {analysis.score >= 85 ? 'Optimized' : 'Restructure HR CTC'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended HR Restructuring Cards */}
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Actionable HR CTC Optimization Tips
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.tips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 rounded-2xl bg-purple-500/[0.03] border border-purple-500/20 text-left space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {tip.title}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold rounded-md shrink-0">
                  {tip.taxSaving}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-normal">
                {tip.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
