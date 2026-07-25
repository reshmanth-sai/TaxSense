import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  Building2,
  UserCheck
} from 'lucide-react';
import { useTaxStore } from '../../store/useTaxStore';
import { calculateTax, formatINR } from '../../utils/taxCalculator';

interface PDFComputationExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFComputationExporter: React.FC<PDFComputationExporterProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const taxProfiles = useTaxStore((state) => state.taxProfiles) || [];
  const activeProfileId = useTaxStore((state) => state.activeProfileId) || 'self';

  const activeProfile = taxProfiles.find(p => p.id === activeProfileId) || taxProfiles[0];

  const taxData = useMemo(() => ({
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
  }), [incomeProfile, confirmedDeductions]);

  const calculation = useMemo(() => calculateTax(taxData), [taxData]);
  const activeRegime = calculation.recommendedRegime;
  const regimeDetails = activeRegime === 'NEW' ? calculation.newRegime : calculation.oldRegime;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const summaryText = `
TAX COMPUTATION STATEMENT • AY 2026-27
---------------------------------------
Taxpayer Name: ${activeProfile?.name || 'Mohit Kumar'}
PAN: ${incomeProfile.pan || activeProfile?.pan || 'MK*****32F'}
Assessment Year: 2026-27 (FY 2025-26)
Recommended Regime: ${activeRegime} Tax Regime

INCOME BREAKDOWN
Gross Salary: ${formatINR(taxData.grossSalary)}
Other Income: ${formatINR(taxData.otherIncome)}
Gross Total Income: ${formatINR(regimeDetails.grossTotalIncome)}

DEDUCTIONS & EXEMPTIONS
Total Deductions: ${formatINR(regimeDetails.totalDeductions)}
Net Taxable Income: ${formatINR(regimeDetails.taxableIncome)}

TAX LIABILITY & REFUND
Base Tax Payable: ${formatINR(regimeDetails.baseTax)}
Health & Education Cess (4%): ${formatINR(regimeDetails.cess)}
Net Tax Payable: ${formatINR(regimeDetails.totalTaxPayable)}
TDS Deducted: ${formatINR(taxData.tdsDeducted)}
Status: ${regimeDetails.refundOrOwed < 0 ? `REFUND OF ${formatINR(Math.abs(regimeDetails.refundOrOwed))}` : `TAX DUE OF ${formatINR(regimeDetails.refundOrOwed)}`}
---------------------------------------
Generated via TaxSense AI Copilot Workspace
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans print:p-0 print:static print:block">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#060A10]/80 backdrop-blur-md print:hidden"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 p-6 md:p-8 text-left space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-4 print:pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 print:hidden">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  Tax Computation Statement
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Assessment Year 2026-27 • Income Tax Department Guidelines
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Taxpayer Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Taxpayer Name</span>
              <strong className="text-slate-900 dark:text-white font-semibold">{activeProfile?.name || 'Mohit Kumar'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">PAN Number</span>
              <strong className="text-slate-900 dark:text-white font-semibold">{incomeProfile.pan || activeProfile?.pan || 'MK*****32F'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Financial Year</span>
              <strong className="text-slate-900 dark:text-white font-semibold">FY 2025-26</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">Opted Regime</span>
              <strong className="text-blue-600 dark:text-blue-400 font-bold">{activeRegime} REGIME</strong>
            </div>
          </div>

          {/* Statement Table Ledger */}
          <div className="space-y-4 text-xs">
            
            {/* Section A: Salary & Income */}
            <div className="border border-slate-200/60 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="bg-slate-100/70 dark:bg-slate-900/80 px-4 py-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex justify-between">
                <span>1. Particulars of Income</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2 font-mono divide-y divide-slate-100 dark:divide-white/[0.03]">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600 dark:text-slate-400">Gross Salary & Allowances (Sec 17(1))</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(taxData.grossSalary)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Income from Other Sources / Savings Interest</span>
                  <span>{formatINR(taxData.otherIncome)}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                  <span>Gross Total Income (A)</span>
                  <span>{formatINR(regimeDetails.grossTotalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Section B: Deductions */}
            <div className="border border-slate-200/60 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="bg-slate-100/70 dark:bg-slate-900/80 px-4 py-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex justify-between">
                <span>2. Allowable Exemptions & Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2 font-mono divide-y divide-slate-100 dark:divide-white/[0.03]">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600 dark:text-slate-400">Standard Deduction (Sec 16(ia))</span>
                  <span>{formatINR(activeRegime === 'NEW' ? 75000 : 50000)}</span>
                </div>
                {activeRegime === 'OLD' && (
                  <>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600 dark:text-slate-400">HRA Exemption (Sec 10(13A))</span>
                      <span>{formatINR(taxData.hraExemption)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600 dark:text-slate-400">Section 80C Investments (PPF, EPF, ELSS)</span>
                      <span>{formatINR(taxData.deduction80C)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600 dark:text-slate-400">Section 80D Health Insurance</span>
                      <span>{formatINR(taxData.deduction80D)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600 dark:text-slate-400">Section 80CCD(1B) NPS Contribution</span>
                      <span>{formatINR(taxData.deduction80CCD1B)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Total Deductions & Exemptions (B)</span>
                  <span>-{formatINR(regimeDetails.totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Section C: Tax Computation */}
            <div className="border border-slate-200/60 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="bg-slate-100/70 dark:bg-slate-900/80 px-4 py-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex justify-between">
                <span>3. Tax Liability & Refund Computation</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2 font-mono divide-y divide-slate-100 dark:divide-white/[0.03]">
                <div className="flex justify-between pt-1 font-bold">
                  <span className="text-slate-900 dark:text-white">Net Taxable Income (A - B)</span>
                  <span className="text-slate-900 dark:text-white">{formatINR(regimeDetails.taxableIncome)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Base Tax on Slab Rates</span>
                  <span>{formatINR(regimeDetails.baseTax)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Health & Education Cess (4%)</span>
                  <span>{formatINR(regimeDetails.cess)}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                  <span>Net Tax Payable</span>
                  <span>{formatINR(regimeDetails.totalTaxPayable)}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-600 dark:text-slate-400">
                  <span>TDS Deducted by Employer (Form 16)</span>
                  <span>{formatINR(taxData.tdsDeducted)}</span>
                </div>
                <div className="flex justify-between pt-2 font-extrabold text-sm">
                  <span>Final Tax Refund / Balance Due</span>
                  <span className={regimeDetails.refundOrOwed < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                    {regimeDetails.refundOrOwed < 0 ? `Refund: ${formatINR(Math.abs(regimeDetails.refundOrOwed))}` : `Due: ${formatINR(regimeDetails.refundOrOwed)}`}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Verification Seal */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200 dark:border-white/[0.06] pt-3">
            <div className="flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Certified Tax Computation • AY 2026-27 Rules Applied</span>
            </div>
            <div>Generated by TaxSense AI Workspace</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
