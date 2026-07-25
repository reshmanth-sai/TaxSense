import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  ArrowRight, 
  Zap,
  Check,
  Send,
  MessageSquare
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { TaxData } from '../types';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to parse numbers from strings like "1.5 lakhs", "50k", "2L", "2,50,000"
const parseAmountFromString = (text: string): number | null => {
  const matchLakh = text.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lakh|l)\b/i);
  if (matchLakh) return parseFloat(matchLakh[1]) * 100000;

  const matchK = text.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/i);
  if (matchK) return parseFloat(matchK[1]) * 1000;

  const matchRaw = text.match(/\b(\d{1,3}(?:,\d{2,3})*|\d+)\b/);
  if (matchRaw) {
    const rawVal = parseFloat(matchRaw[1].replace(/,/g, ''));
    if (rawVal >= 100) return rawVal;
  }

  return null;
};

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({ isOpen, onClose }) => {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const setIncomeProfile = useTaxStore((state) => state.setIncomeProfile);
  const updateDeduction = useTaxStore((state) => state.updateDeduction);

  // Baseline Tax Data derived from current store state
  const baselineData: TaxData = useMemo(() => {
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

  // Baseline calculation
  const baselineCalculation = useMemo(() => calculateTax(baselineData), [baselineData]);

  // Simulation Delta State
  const [simSalaryDelta, setSimSalaryDelta] = useState<number>(0);
  const [sim80CDelta, setSim80CDelta] = useState<number>(0);
  const [sim80DDelta, setSim80DDelta] = useState<number>(0);
  const [simNPSDelta, setSimNPSDelta] = useState<number>(0);
  const [simSec24bDelta, setSimSec24bDelta] = useState<number>(0);
  const [simRentDelta, setSimRentDelta] = useState<number>(0);
  const [appliedToast, setAppliedToast] = useState(false);

  // AI Prompt Bar State
  const [promptInput, setPromptInput] = useState('');
  const [aiParsedNotice, setAiParsedNotice] = useState<string | null>(null);

  // Reset all simulation sliders
  const handleReset = () => {
    setSimSalaryDelta(0);
    setSim80CDelta(0);
    setSim80DDelta(0);
    setSimNPSDelta(0);
    setSimSec24bDelta(0);
    setSimRentDelta(0);
    setAiParsedNotice(null);
    setPromptInput('');
  };

  // Smart Intent Parser Function
  const parseAndApplyPrompt = (text: string) => {
    if (!text.trim()) return;

    let newSalaryDelta = 0;
    let new80CDelta = 0;
    let new80DDelta = 0;
    let newNPSDelta = 0;
    let newSec24bDelta = 0;
    let newRentDelta = 0;
    const parsedChanges: string[] = [];

    // 1. Percentage Salary Hike e.g. "15% hike", "20% salary increase"
    const pctMatch = text.match(/(\d+(?:\.\d+)?)\%\s*(?:salary|hike|increase|increment|bonus)?/i);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      newSalaryDelta = Math.round(baselineData.grossSalary * (pct / 100));
      parsedChanges.push(`Salary +${pct}% (${formatINR(newSalaryDelta)})`);
    } else {
      // Lump sum salary hike
      const salMatch = text.match(/(?:salary|income|hike|bonus|increment)\s*(?:by|of|is)?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*(?:lakhs?|lakh|l|k|thousand)?)/i);
      if (salMatch) {
        const amt = parseAmountFromString(salMatch[1]);
        if (amt) {
          newSalaryDelta = amt;
          parsedChanges.push(`Salary +${formatINR(amt)}`);
        }
      }
    }

    // 2. NPS 80CCD(1B) e.g. "50k nps", "nps 50,000", "max nps"
    if (/nps|80ccd/i.test(text)) {
      const npsMatch = text.match(/(?:nps|80ccd)\s*(?:of|by|with)?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*(?:lakhs?|lakh|l|k|thousand)?)/i);
      if (npsMatch) {
        const amt = parseAmountFromString(npsMatch[1]);
        if (amt) newNPSDelta = Math.min(50000, amt);
      } else {
        newNPSDelta = 50000; // default max NPS
      }
      parsedChanges.push(`NPS +${formatINR(newNPSDelta)}`);
    }

    // 3. Section 80C e.g. "80c 1.5 lakh", "max out 80c", "ppf 1.5l"
    if (/80c|elss|ppf|lic/i.test(text)) {
      const cMatch = text.match(/(?:80c|elss|ppf|lic)\s*(?:of|by)?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*(?:lakhs?|lakh|l|k|thousand)?)/i);
      if (cMatch) {
        const amt = parseAmountFromString(cMatch[1]);
        if (amt) new80CDelta = Math.min(150000, amt);
      } else {
        new80CDelta = Math.max(0, 150000 - baselineData.deduction80C);
      }
      parsedChanges.push(`80C +${formatINR(new80CDelta)}`);
    }

    // 4. Section 80D Health Insurance e.g. "25k health insurance", "80d 25k", "parents insurance 50k"
    if (/80d|health|medical|insurance/i.test(text)) {
      const dMatch = text.match(/(?:80d|health|medical|insurance)\s*(?:of|by)?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*(?:lakhs?|lakh|l|k|thousand)?)/i);
      if (dMatch) {
        const amt = parseAmountFromString(dMatch[1]);
        if (amt) new80DDelta = Math.min(75000, amt);
      } else {
        new80DDelta = 25000;
      }
      parsedChanges.push(`80D Health +${formatINR(new80DDelta)}`);
    }

    // 5. Home Loan Sec 24b e.g. "1.5l home loan", "home loan interest 2 lakhs"
    if (/home loan|housing loan|sec 24|24b/i.test(text)) {
      const homeMatch = text.match(/(?:home loan|housing loan|sec 24|24b)\s*(?:interest)?\s*(?:of|by)?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*(?:lakhs?|lakh|l|k|thousand)?)/i);
      if (homeMatch) {
        const amt = parseAmountFromString(homeMatch[1]);
        if (amt) newSec24bDelta = Math.min(200000, amt);
      } else {
        newSec24bDelta = 150000;
      }
      parsedChanges.push(`Home Loan Sec 24b +${formatINR(newSec24bDelta)}`);
    }

    // 6. Rent / HRA e.g. "25k monthly rent", "rent 25000"
    if (/rent|hra/i.test(text)) {
      const rentMatch = text.match(/(?:rent|hra)\s*(?:of|by|paid)?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*(?:lakhs?|lakh|l|k|thousand|pm|per month)?)/i);
      if (rentMatch) {
        const amt = parseAmountFromString(rentMatch[1]);
        if (amt) {
          // If monthly rent specified (e.g. 25k pm), scale to annual hra delta estimate
          newRentDelta = amt < 50000 ? Math.round(amt * 12 * 0.4) : amt;
          parsedChanges.push(`HRA Rent +${formatINR(newRentDelta)}`);
        }
      }
    }

    // Apply Parsed Deltas
    setSimSalaryDelta(newSalaryDelta);
    setSim80CDelta(new80CDelta);
    setSim80DDelta(new80DDelta);
    setSimNPSDelta(newNPSDelta);
    setSimSec24bDelta(newSec24bDelta);
    setSimRentDelta(newRentDelta);

    if (parsedChanges.length > 0) {
      setAiParsedNotice(`✨ AI Parsed: ${parsedChanges.join(', ')} — Sliders updated!`);
    } else {
      setAiParsedNotice(`✨ AI analyzed prompt. Sliders updated based on your scenario.`);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parseAndApplyPrompt(promptInput);
  };

  const handleChipClick = (chipText: string) => {
    setPromptInput(chipText);
    parseAndApplyPrompt(chipText);
  };

  // Preset Handlers
  const handleApplyPreset = (preset: 'nps' | 'hike' | 'health' | 'home') => {
    handleReset();
    if (preset === 'nps') {
      setSimNPSDelta(50000);
      setAiParsedNotice('✨ Applied Preset: +₹50,000 NPS 80CCD(1B)');
    } else if (preset === 'hike') {
      const hikeAmt = Math.round((incomeProfile.grossSalary || 850000) * 0.2);
      setSimSalaryDelta(hikeAmt);
      setAiParsedNotice(`✨ Applied Preset: +20% Salary Hike (${formatINR(hikeAmt)})`);
    } else if (preset === 'health') {
      setSim80DDelta(25000);
      setAiParsedNotice('✨ Applied Preset: +₹25,000 Parents 80D Health Insurance');
    } else if (preset === 'home') {
      setSimSec24bDelta(150000);
      setAiParsedNotice('✨ Applied Preset: +₹1,50,000 Home Loan Interest (Sec 24b)');
    }
  };

  // Simulated Tax Data
  const simulatedData: TaxData = useMemo(() => {
    const newGross = Math.max(0, baselineData.grossSalary + simSalaryDelta);
    const new80C = Math.min(150000, Math.max(0, baselineData.deduction80C + sim80CDelta));
    const new80D = Math.min(75000, Math.max(0, baselineData.deduction80D + sim80DDelta));
    const newNPS = Math.min(50000, Math.max(0, (baselineData.deduction80CCD1B || 0) + simNPSDelta));
    const newSec24b = Math.min(200000, Math.max(0, baselineData.section24b + simSec24bDelta));
    const newHRA = Math.max(0, baselineData.hraExemption + simRentDelta);

    return {
      ...baselineData,
      grossSalary: newGross,
      deduction80C: new80C,
      deduction80D: new80D,
      deduction80CCD1B: newNPS,
      section24b: newSec24b,
      hraExemption: newHRA,
    };
  }, [baselineData, simSalaryDelta, sim80CDelta, sim80DDelta, simNPSDelta, simSec24bDelta, simRentDelta]);

  // Simulated Calculation
  const simulatedCalculation = useMemo(() => calculateTax(simulatedData), [simulatedData]);

  // Tax Difference Comparison
  const baselineLowestTax = Math.min(baselineCalculation.oldRegime.totalTaxPayable, baselineCalculation.newRegime.totalTaxPayable);
  const simulatedLowestTax = Math.min(simulatedCalculation.oldRegime.totalTaxPayable, simulatedCalculation.newRegime.totalTaxPayable);
  const taxDifference = baselineLowestTax - simulatedLowestTax; // Positive means savings, negative means higher tax

  // Apply simulated changes to active profile
  const handleApplyToProfile = () => {
    setIncomeProfile({
      ...incomeProfile,
      grossSalary: simulatedData.grossSalary,
    });
    updateDeduction('80C', simulatedData.deduction80C);
    updateDeduction('80D', simulatedData.deduction80D);
    updateDeduction('80CCD(1B)', simulatedData.deduction80CCD1B || 0);
    updateDeduction('section24b', simulatedData.section24b);
    updateDeduction('HRA exemption', simulatedData.hraExemption);

    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#060A10]/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 my-8 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    “What-If” Tax Simulator
                  </h2>
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-500/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                    AI Copilot Powered
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Type natural scenarios or use sliders to simulate tax impact without mutating your draft return.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset sliders"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI Natural Language Prompt Assistant Bar */}
          <div className="p-4 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-transparent border-b border-purple-500/15 space-y-2.5">
            <form onSubmit={handlePromptSubmit} className="relative flex items-center">
              <div className="absolute left-3.5 text-purple-500 dark:text-purple-400 flex items-center pointer-events-none">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask AI: e.g. 'What if I get a 15% salary hike and invest ₹50k in NPS?'"
                className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-900/90 border border-purple-500/25 dark:border-purple-500/30 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-medium transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1"
              >
                <span>Simulate</span>
                <Send className="w-3 h-3" />
              </button>
            </form>

            {/* Clickable Suggestion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500/80 shrink-0 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Try Prompting:
              </span>
              {[
                'What if I get a 15% salary hike and invest ₹50k in NPS?',
                'What if I pay ₹25,000 monthly rent and max out 80C?',
                'What if I claim ₹25k parents health insurance?',
                'Simulate ₹1.5L home loan interest deduction'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 bg-white/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20 hover:border-purple-500/50 text-purple-950 dark:text-purple-200 text-[10.5px] font-medium rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs hover:scale-102"
                >
                  💬 {chip}
                </button>
              ))}
            </div>

            {/* AI Parsed Notice Banner */}
            {aiParsedNotice && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-950 dark:text-purple-200 text-[11px] font-semibold rounded-lg flex items-center justify-between"
              >
                <span>{aiParsedNotice}</span>
                <button
                  onClick={() => setAiParsedNotice(null)}
                  className="text-purple-400 hover:text-purple-200 text-[10px] cursor-pointer ml-2"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </div>

          {/* Modal Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[calc(85vh-220px)] overflow-y-auto">
            {/* Left Column: Interactive Sliders (7 cols) */}
            <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.06]">
              {/* Quick Presets Row */}
              <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-none border-b border-slate-200/60 dark:border-white/[0.04]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Presets:
                </span>
                <button
                  onClick={() => handleApplyPreset('nps')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  +₹50k NPS
                </button>
                <button
                  onClick={() => handleApplyPreset('hike')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  +20% Salary
                </button>
                <button
                  onClick={() => handleApplyPreset('health')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  +₹25k 80D
                </button>
                <button
                  onClick={() => handleApplyPreset('home')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  +₹1.5L Home Loan
                </button>
              </div>

              {/* Slider 1: Gross Salary Hike/Decrease */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">Gross Salary Change</span>
                  <span className={`font-mono font-bold ${simSalaryDelta > 0 ? 'text-emerald-500' : simSalaryDelta < 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {simSalaryDelta >= 0 ? `+${formatINR(simSalaryDelta)}` : formatINR(simSalaryDelta)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-300000}
                  max={1000000}
                  step={25000}
                  value={simSalaryDelta}
                  onChange={(e) => setSimSalaryDelta(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-₹3 Lakhs</span>
                  <span>Baseline: {formatINR(baselineData.grossSalary)}</span>
                  <span>+₹10 Lakhs</span>
                </div>
              </div>

              {/* Slider 2: Additional 80C Deductions */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">Section 80C Additional Investment</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    +{formatINR(sim80CDelta)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, 150000 - baselineData.deduction80C)}
                  step={5000}
                  value={sim80CDelta}
                  onChange={(e) => setSim80CDelta(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Current: {formatINR(baselineData.deduction80C)}</span>
                  <span>Max Cap: ₹1,50,000</span>
                </div>
              </div>

              {/* Slider 3: Section 80D Health Insurance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">Section 80D Health Insurance</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    +{formatINR(sim80DDelta)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, 75000 - baselineData.deduction80D)}
                  step={5000}
                  value={sim80DDelta}
                  onChange={(e) => setSim80DDelta(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Current: {formatINR(baselineData.deduction80D)}</span>
                  <span>Max Cap: ₹75,000</span>
                </div>
              </div>

              {/* Slider 4: NPS 80CCD(1B) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">NPS Sec 80CCD(1B) Contribution</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    +{formatINR(simNPSDelta)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, 50000 - (baselineData.deduction80CCD1B || 0))}
                  step={5000}
                  value={simNPSDelta}
                  onChange={(e) => setSimNPSDelta(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Current: {formatINR(baselineData.deduction80CCD1B || 0)}</span>
                  <span>Max Cap: ₹50,000</span>
                </div>
              </div>

              {/* Slider 5: Section 24b Home Loan Interest */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">Home Loan Interest (Sec 24b)</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    +{formatINR(simSec24bDelta)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, 200000 - baselineData.section24b)}
                  step={10000}
                  value={simSec24bDelta}
                  onChange={(e) => setSimSec24bDelta(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Current: {formatINR(baselineData.section24b)}</span>
                  <span>Max Cap: ₹2,00,000</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Live Tax Results (5 cols) */}
            <div className="lg:col-span-5 p-6 bg-slate-50/70 dark:bg-[#070b13] flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Simulation Outcome
                  </span>
                  {taxDifference > 0 ? (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <TrendingDown className="w-3.5 h-3.5" /> Saves {formatINR(taxDifference)}
                    </span>
                  ) : taxDifference < 0 ? (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <TrendingUp className="w-3.5 h-3.5" /> +{formatINR(Math.abs(taxDifference))} Tax
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">No Change</span>
                  )}
                </div>

                {/* Primary Tax Impact Card */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    Simulated Lowest Tax Payable
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    {formatINR(simulatedLowestTax)}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Regime:</span>
                    <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold rounded text-[10px] uppercase tracking-wider border border-blue-500/20">
                      {simulatedCalculation.recommendedRegime} REGIME BEST
                    </span>
                  </div>
                </div>

                {/* Side-by-side Regime Comparison Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/[0.04] rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Old Regime</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatINR(simulatedCalculation.oldRegime.totalTaxPayable)}
                    </div>
                    <div className="text-[9.5px] text-slate-400">
                      Baseline: {formatINR(baselineCalculation.oldRegime.totalTaxPayable)}
                    </div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/[0.04] rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">New Regime</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatINR(simulatedCalculation.newRegime.totalTaxPayable)}
                    </div>
                    <div className="text-[9.5px] text-slate-400">
                      Baseline: {formatINR(baselineCalculation.newRegime.totalTaxPayable)}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Banner */}
                <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Copilot Insight</span>
                  </div>
                  <p className="text-[11px] text-purple-900 dark:text-purple-200 leading-relaxed font-normal">
                    {simulatedCalculation.recommendedRegime === 'OLD'
                      ? `In this simulated scenario, claiming extra deductions makes Old Regime cheaper by ${formatINR(simulatedCalculation.newRegime.totalTaxPayable - simulatedCalculation.oldRegime.totalTaxPayable)}.`
                      : `Even with simulated changes, New Regime remains more beneficial by ${formatINR(simulatedCalculation.oldRegime.totalTaxPayable - simulatedCalculation.newRegime.totalTaxPayable)}.`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleApplyToProfile}
                  disabled={appliedToast}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {appliedToast ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>Updated Active Profile!</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Scenario to Active Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Keep Sandbox Only (Close)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
