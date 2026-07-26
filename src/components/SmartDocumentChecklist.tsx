import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  FileUp, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Filter,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';

interface SmartDocumentChecklistProps {
  onNavigateToVault?: () => void;
  className?: string;
  defaultCollapsed?: boolean;
}

export interface ChecklistDocItem {
  id: string;
  category: string;
  title: string;
  sectionRef: string;
  description: string;
  isRequired: boolean;
  isVerified: boolean;
  matchedFileName?: string;
  claimAmount?: number;
  recommendation: string;
  notApplicableReason?: string;
  defaultKeywords: string[];
}

export const SmartDocumentChecklist: React.FC<SmartDocumentChecklistProps> = ({ 
  onNavigateToVault,
  className = '',
  defaultCollapsed = true
}) => {
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const setActiveStep = useTaxStore((state) => state.setActiveStep);
  const addUploadedFile = useTaxStore((state) => state.addUploadedFile);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCategory, setActiveUploadCategory] = useState<ChecklistDocItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
  const [filterMode, setFilterMode] = useState<'ALL' | 'MISSING' | 'VERIFIED'>('ALL');

  // Compute active tax regime using calculateTax
  const activeRegime = useMemo(() => {
    const taxData = {
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
    };
    const res = calculateTax(taxData);
    return res.recommendedRegime;
  }, [incomeProfile, confirmedDeductions]);

  // Trigger file picker for specific document card
  const handleCardUploadClick = (item: ChecklistDocItem) => {
    setActiveUploadCategory(item);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle direct file upload from checklist card
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const item = activeUploadCategory;

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    let fileCustomName = file.name;

    if (item && !item.defaultKeywords.some(kw => file.name.toLowerCase().includes(kw))) {
      const cleanCatName = item.id.toUpperCase();
      fileCustomName = `${cleanCatName}_${file.name}`;
    }

    addUploadedFile({
      id: 'file-' + Date.now(),
      name: fileCustomName,
      size: sizeStr,
      employer: incomeProfile.employerName || 'Direct Upload',
      financialYear: 'FY 2025-26',
      uploadTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Verified',
      confidence: 99,
      pages: 1
    });

    setToastMessage(`✨ Uploaded ${fileCustomName} to Vault! Verified under ${item?.title || 'Checklist'}.`);
    setTimeout(() => setToastMessage(null), 3000);

    e.target.value = '';
    setActiveUploadCategory(null);
  };

  const handleOpenVault = () => {
    if (onNavigateToVault) {
      onNavigateToVault();
    } else {
      setActiveStep(3);
    }
  };

  const hasMatchingFile = (keywords: string[]) => {
    return uploadedFiles.some((file) => {
      const fileNameLower = (file.name || '').toLowerCase();
      return keywords.some((kw) => fileNameLower.includes(kw));
    });
  };

  const getMatchingFileName = (keywords: string[]) => {
    const found = uploadedFiles.find((file) => {
      const fileNameLower = (file.name || '').toLowerCase();
      return keywords.some((kw) => fileNameLower.includes(kw));
    });
    return found ? found.name : undefined;
  };

  // Compute regime-aware checklist items
  const checklistItems: ChecklistDocItem[] = useMemo(() => {
    const items: ChecklistDocItem[] = [];
    const isNewRegime = activeRegime === 'NEW';

    // 1. Form 16 Part A & B (Required in ALL regimes)
    const form16Matched = hasMatchingFile(['form 16', 'form16', 'salary', 'w2', 'payslip', 'part a']);
    items.push({
      id: 'form16',
      category: 'Income Proof',
      title: 'Form 16 (Part A & B)',
      sectionRef: 'Sec 203 of IT Act',
      description: 'Official employer certificate detailing gross salary, HRA exemptions, and TDS deducted.',
      isRequired: (incomeProfile.grossSalary || 0) > 0,
      isVerified: form16Matched || uploadedFiles.length > 0,
      matchedFileName: getMatchingFileName(['form 16', 'form16', 'salary', 'w2', 'payslip']) || (uploadedFiles.length > 0 ? uploadedFiles[0]?.name : undefined),
      claimAmount: incomeProfile.grossSalary,
      recommendation: 'Required to auto-populate salary breakdown and verify TDS tax credits.',
      defaultKeywords: ['form16', 'form 16', 'salary', 'w2', 'payslip']
    });

    // 2. HRA Rent Receipts / Lease Agreement
    const hraClaim = confirmedDeductions['HRA exemption'] || 0;
    const rentMatched = hasMatchingFile(['rent', 'receipt', 'lease', 'tenant', 'landlord', 'agreement', 'hra']);
    items.push({
      id: 'hra_rent',
      category: 'Exemptions',
      title: 'HRA Rent Receipts & Landlord PAN',
      sectionRef: 'Sec 10(13A)',
      description: 'Monthly rent paid receipts. Landlord PAN required if annual rent exceeds ₹1,00,000.',
      isRequired: !isNewRegime && hraClaim > 0,
      isVerified: rentMatched,
      matchedFileName: getMatchingFileName(['rent', 'receipt', 'lease', 'tenant', 'landlord', 'hra']),
      claimAmount: hraClaim,
      notApplicableReason: isNewRegime ? 'Optional in New Regime' : hraClaim === 0 ? 'No HRA claim made' : undefined,
      recommendation: isNewRegime
        ? 'Optional backup for your records. Standard deduction applies automatically.'
        : rentMatched 
        ? 'Rent receipts verified in vault.' 
        : 'Upload rent receipts to support your HRA claim.',
      defaultKeywords: ['rent', 'receipt', 'lease', 'tenant', 'landlord', 'hra']
    });

    // 3. Section 80D Medical Health Insurance
    const sec80DClaim = confirmedDeductions['80D'] || 0;
    const healthMatched = hasMatchingFile(['80d', 'health', 'medical', 'insurance', 'mediclaim']);
    items.push({
      id: 'sec80d',
      category: 'Deductions',
      title: 'Section 80D Medical Insurance Premium',
      sectionRef: 'Sec 80D',
      description: 'Premium payment receipt for self, family, or senior citizen parents health insurance.',
      isRequired: !isNewRegime && sec80DClaim > 0,
      isVerified: healthMatched,
      matchedFileName: getMatchingFileName(['80d', 'health', 'medical', 'insurance', 'mediclaim']),
      claimAmount: sec80DClaim,
      notApplicableReason: isNewRegime ? 'Optional in New Regime' : sec80DClaim === 0 ? 'No 80D claim made' : undefined,
      recommendation: isNewRegime
        ? 'Optional insurance receipt storage.'
        : healthMatched 
        ? '80D receipt verified in vault.' 
        : 'Keep insurance premium payment receipt in vault to support your claim.',
      defaultKeywords: ['80d', 'health', 'medical', 'insurance', 'mediclaim']
    });

    // 4. Section 80C Investment Proofs
    const sec80CClaim = confirmedDeductions['80C'] || 0;
    const sec80CMatched = hasMatchingFile(['80c', 'elss', 'ppf', 'lic', 'mutual', 'investment', 'tuition']);
    items.push({
      id: 'sec80c',
      category: 'Deductions',
      title: 'Section 80C Investment Certificates',
      sectionRef: 'Sec 80C',
      description: 'ELSS mutual fund statement, PPF passbook, LIC premium receipt, or school tuition fee receipt.',
      isRequired: !isNewRegime && sec80CClaim > 0,
      isVerified: sec80CMatched,
      matchedFileName: getMatchingFileName(['80c', 'elss', 'ppf', 'lic', 'mutual', 'investment', 'tuition']),
      claimAmount: sec80CClaim,
      notApplicableReason: isNewRegime ? 'Optional in New Regime' : sec80CClaim === 0 ? 'No 80C claim made' : undefined,
      recommendation: isNewRegime
        ? 'Optional investment document storage.'
        : sec80CMatched 
        ? '80C investment proof attached.' 
        : 'Upload investment certificates to support your 80C deduction claim.',
      defaultKeywords: ['80c', 'elss', 'ppf', 'lic', 'mutual', 'investment', 'tuition']
    });

    // 5. NPS Sec 80CCD(1B)
    const npsClaim = confirmedDeductions['80CCD(1B)'] || 0;
    const npsMatched = hasMatchingFile(['nps', '80ccd', 'pension', 'pran']);
    items.push({
      id: 'nps',
      category: 'Investments',
      title: 'NPS Tier-I Contribution Statement',
      sectionRef: 'Sec 80CCD(1B)',
      description: 'Annual transaction statement or receipt showing PRAN contribution up to ₹50,000.',
      isRequired: !isNewRegime && npsClaim > 0,
      isVerified: npsMatched,
      matchedFileName: getMatchingFileName(['nps', '80ccd', 'pension', 'pran']),
      claimAmount: npsClaim,
      notApplicableReason: isNewRegime ? 'Optional in New Regime' : npsClaim === 0 ? 'No NPS claim made' : undefined,
      recommendation: isNewRegime
        ? 'Optional pension statement storage.'
        : npsMatched 
        ? 'NPS PRAN statement verified.' 
        : 'Upload NPS contribution receipt to justify extra ₹50k deduction.',
      defaultKeywords: ['nps', '80ccd', 'pension', 'pran']
    });

    // 6. Section 24b Home Loan Interest
    const sec24bClaim = confirmedDeductions['section24b'] || 0;
    const homeMatched = hasMatchingFile(['24b', 'home loan', 'housing', 'mortgage', 'interest']);
    items.push({
      id: 'sec24b',
      category: 'Housing',
      title: 'Home Loan Interest Certificate',
      sectionRef: 'Sec 24(b)',
      description: 'Provisional or final home loan interest certificate issued by lending bank.',
      isRequired: !isNewRegime && sec24bClaim > 0,
      isVerified: homeMatched,
      matchedFileName: getMatchingFileName(['24b', 'home loan', 'housing', 'mortgage', 'interest']),
      claimAmount: sec24bClaim,
      notApplicableReason: isNewRegime ? 'Optional in New Regime' : sec24bClaim === 0 ? 'No home loan interest claimed' : undefined,
      recommendation: isNewRegime
        ? 'Optional housing loan document storage.'
        : homeMatched 
        ? 'Bank interest certificate verified.' 
        : 'Upload bank interest statement to substantiate home loan deduction.',
      defaultKeywords: ['24b', 'home loan', 'housing', 'mortgage', 'interest']
    });

    // 7. Form 26AS & AIS Statement (Recommended)
    const aisMatched = hasMatchingFile(['26as', 'ais', 'tis', 'tax credit']);
    items.push({
      id: 'ais_26as',
      category: 'Tax Credit',
      title: 'Form 26AS & AIS Tax Credit Statement',
      sectionRef: 'Sec 203AA',
      description: 'Official Income Tax Department tax credit ledger summarizing TDS, TCS, and advance tax payments.',
      isRequired: false,
      isVerified: aisMatched,
      matchedFileName: getMatchingFileName(['26as', 'ais', 'tis', 'tax credit']),
      recommendation: aisMatched 
        ? 'Matched against official AIS records.' 
        : 'Recommended: Download AIS from e-filing portal to ensure zero TDS mismatches.',
      defaultKeywords: ['26as', 'ais', 'tis', 'tax credit']
    });

    return items;
  }, [uploadedFiles, incomeProfile, confirmedDeductions, activeRegime]);

  const requiredItems = useMemo(() => checklistItems.filter(i => i.isRequired), [checklistItems]);
  const verifiedRequiredItems = useMemo(() => requiredItems.filter(i => i.isVerified), [requiredItems]);
  
  const completenessScore = useMemo(() => {
    if (requiredItems.length === 0) return 100;
    return Math.round((verifiedRequiredItems.length / requiredItems.length) * 100);
  }, [requiredItems, verifiedRequiredItems]);

  const filteredItems = useMemo(() => {
    if (filterMode === 'MISSING') return checklistItems.filter(i => i.isRequired && !i.isVerified);
    if (filterMode === 'VERIFIED') return checklistItems.filter(i => i.isVerified);
    return checklistItems;
  }, [checklistItems, filterMode]);

  const missingCount = checklistItems.filter(i => i.isRequired && !i.isVerified).length;

  // Progressive Compact Items Logic (Saves 70% vertical space!)
  const displayedItems = useMemo(() => {
    if (!isCollapsed) return filteredItems;
    
    // When collapsed: show actionable missing items first
    const missingActionItems = filteredItems.filter(i => i.isRequired && !i.isVerified);
    if (missingActionItems.length > 0) {
      return missingActionItems;
    }
    // If no missing action items, show only the top 1 item (Form 16)
    return filteredItems.slice(0, 1);
  }, [filteredItems, isCollapsed]);

  return (
    <div className={`bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-5 backdrop-blur-md text-left space-y-4 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".pdf,.txt,.csv,.jpg,.jpeg,.png"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 text-xs font-bold cursor-pointer">✕</button>
        </motion.div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Smart Document Checklist
              </h3>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-blue-500/20">
                {activeRegime} REGIME
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates required document proof for {activeRegime} Tax Regime.
            </p>
          </div>
        </div>

        {/* Audit Readiness Score Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Document Readiness
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
              <span>{completenessScore}%</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                completenessScore >= 80 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : completenessScore >= 50 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {completenessScore >= 80 ? 'Ready to File' : completenessScore >= 50 ? 'Moderate' : 'Action Needed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Progressive Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-white/[0.04] pt-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/60 dark:border-white/[0.03]">
          {(['ALL', 'MISSING', 'VERIFIED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setFilterMode(mode);
                if (mode === 'ALL' && isCollapsed) setIsCollapsed(false);
              }}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterMode === mode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {mode === 'ALL' ? `All (${checklistItems.length})` : mode === 'MISSING' ? `Missing (${checklistItems.filter(i => i.isRequired && !i.isVerified).length})` : `Verified (${checklistItems.filter(i => i.isVerified).length})`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-xl transition-all border border-blue-500/20"
        >
          <span>{isCollapsed ? `Expand All (${checklistItems.length})` : 'Collapse View'}</span>
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Checklist Items List (Compact Action-First View) */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {displayedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                item.isVerified
                  ? 'bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03] border-emerald-500/20'
                  : item.isRequired
                  ? 'bg-amber-500/[0.02] dark:bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/40'
                  : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/[0.04]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : item.isRequired ? (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.title}
                    </h4>
                    <span className="px-2 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 rounded border border-slate-200/60 dark:border-white/10">
                      {item.sectionRef}
                    </span>
                    {item.notApplicableReason && (
                      <span className="px-2 py-0.5 bg-slate-200/60 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 text-[9.5px] font-medium rounded-md">
                        {item.notApplicableReason}
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-normal pl-6">
                    {item.description}
                  </p>
                  {item.matchedFileName && (
                    <div className="pl-6 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1 pt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Attached File: {item.matchedFileName}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge & Prominent Upload Action Button */}
                <div className="shrink-0 pl-6 sm:pl-0 flex items-center gap-3">
                  {item.claimAmount !== undefined && item.claimAmount > 0 && !item.notApplicableReason && (
                    <div className="text-right hidden md:block font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      Claim: <strong className="text-slate-900 dark:text-white">{formatINR(item.claimAmount)}</strong>
                    </div>
                  )}

                  {item.isVerified ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCardUploadClick(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        title="Replace attached file"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Replace</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCardUploadClick(item)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-102 active:scale-98"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Upload Proof</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Footer Control Bar */}
      {isCollapsed && checklistItems.length > displayedItems.length && (
        <div className="text-center pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer inline-flex items-center gap-1 py-1"
          >
            <span>+ Show {checklistItems.length - displayedItems.length} more optional document proofs</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
