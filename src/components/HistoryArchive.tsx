import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  FileText,
  History,
  TrendingUp,
  Award,
  Search,
  ChevronRight,
  X,
  FileCheck2,
  Calendar,
  Eye,
  Download
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { formatINR, calculateTax } from '../utils/taxCalculator';
import { ExportService } from '../services/ExportService';
import { TAX_CONFIG } from '../config';
import { TaxData, FilingHistoryItem } from '../types';

interface HistoryArchiveProps {
  setActiveStep: (step: number) => void;
}

// Custom Premium SVG Line Chart showing tax savings over time
const SavingsChart: React.FC<{ data: { year: string; savings: number; regime: string; salary?: number }[] }> = React.memo(({ data }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 540;
  const height = 190;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const maxSavings = Math.max(...data.map(d => d.savings), 80000);
  const minSavings = 0;

  const getX = (index: number) => {
    if (data.length <= 1) {
      return paddingLeft + (width - paddingLeft - paddingRight) / 2;
    }
    return paddingLeft + (index / (data.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    const scale = (val - minSavings) / (maxSavings - minSavings);
    return height - paddingBottom - scale * (height - paddingTop - paddingBottom);
  };

  // Build line path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.savings) }));
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Smooth cubic bezier curves
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
  }

  // Path for fill gradient under the line
  let fillD = '';
  if (points.length > 0) {
    fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div className="bg-white/80 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 text-left relative overflow-hidden group shadow-md backdrop-blur-xl transition-all">
      <div className="absolute inset-0 bg-gradient-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none blur-2xl" />
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-extrabold block">Financial Analytics</span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">Savings Over Time</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full select-none">
          <TrendingUp className="h-3 w-3" />
          <span>Optimized Growth</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[480px]">
          <defs>
            <linearGradient id="savingsChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.33, 0.66, 1].map((scale, idx) => {
            const val = minSavings + scale * (maxSavings - minSavings);
            const y = getY(val);
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="currentColor"
                  className="text-slate-200/80 dark:text-white/[0.04]"
                  strokeDasharray="3 3"
                />
                <text 
                  x={paddingLeft - 12} 
                  y={y + 3} 
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px] font-bold"
                  textAnchor="end"
                >
                  ₹{(val / 1000).toFixed(0)}K
                </text>
              </g>
            );
          })}

          {/* Y Axis Line */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="currentColor" className="text-slate-200 dark:text-white/[0.06]" />
          
          {/* X Axis Labels */}
          {data.map((d, i) => (
            <text 
              key={i} 
              x={getX(i)} 
              y={height - 12} 
              className="fill-slate-600 dark:fill-slate-400 font-mono text-[10px] font-bold"
              textAnchor="middle"
            >
              {d.year}
            </text>
          ))}

          {/* Fill Path */}
          {fillD && <path d={fillD} fill="url(#savingsChartGradient)" />}

          {/* Line Path */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="#10B981" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Interactive Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredPoint === i ? "6" : "4"} 
                fill="currentColor"
                className="text-white dark:text-[#0B1020] cursor-pointer transition-all duration-200"
                stroke="#10B981" 
                strokeWidth="2.5"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover coordinate detail box */}
        <AnimatePresence>
          {hoveredPoint !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#0B1020]/95 border border-slate-200 dark:border-white/10 backdrop-blur-xl px-4 py-2.5 rounded-2xl text-[11px] text-slate-800 dark:text-slate-200 space-y-0.5 pointer-events-none z-20 shadow-xl"
            >
              <div className="text-slate-500 uppercase tracking-widest text-[8.5px] font-extrabold">AY {data[hoveredPoint].year} Savings</div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{formatINR(data[hoveredPoint].savings)}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[9.5px]">Regime: {data[hoveredPoint].regime}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
});

// Same convention the rest of the app uses (see store/useTaxStore.ts): the
// sample timeline below is a local-dev / ?demo=true convenience, never shown
// to a real visitor. This used to be `useState(true)` with no setter ever
// called, meaning it was permanently true for every user in every
// environment -- a fresh guest with zero real filings saw three fabricated
// "Filed" returns for AY 2024-25 through 2026-27, complete with invented
// savings figures and dates, presented as their own filing history.
const isDevOrDemo = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   window.location.search.includes('demo=true'));

interface HistoryEntry {
  id: string;
  yearLabel: string;
  date: string;
  grossSalary: number;
  totalDeductions: number;
  netTaxPaid: number;
  recommendedRegime: 'NEW' | 'OLD';
  formType: 'ITR-1' | 'ITR-2';
  savings?: number;
  status: string;
  taxData?: TaxData;
}

// Main History Archive redesign component
export const HistoryArchive: React.FC<HistoryArchiveProps> = React.memo(({ setActiveStep }) => {
  const isDemoMode = isDevOrDemo;
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('ALL');
  const [isTimelineView, setIsTimelineView] = React.useState(false);
  
  // Year Comparison Drawer state
  const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);

  // Document Preview Modal state
  // Carries the real history item being previewed (not just a display name)
  // so the download button in the modal can export its actual data via
  // ExportService, instead of the alert()-only mock it used to call.
  const [previewDoc, setPreviewDoc] = React.useState<{
    id: string;
    formType: 'ITR-1' | 'ITR-2';
    grossSalary: number;
    totalDeductions: number;
    recommendedRegime: 'NEW' | 'OLD';
    taxData?: TaxData;
  } | null>(null);

  const filingHistory = useTaxStore((state) => state.filingHistory) || [];
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];

  // MOCK DEMO TIMELINE DATA (AY 2024 to AY 2026 savings metrics)
  const demoHistory: HistoryEntry[] = React.useMemo(() => [
    {
      id: "Filing AY 2026-27",
      yearLabel: "AY 2026–27",
      date: "Generated July 2026",
      grossSalary: 1450000,
      totalDeductions: 310000,
      netTaxPaid: 112500,
      recommendedRegime: 'NEW' as const,
      formType: "ITR-1" as const,
      savings: 77896,
      status: "Filed"
    },
    {
      id: "Filing AY 2025-26",
      yearLabel: "AY 2025–26",
      date: "Generated July 2025",
      grossSalary: 1180000,
      totalDeductions: 280000,
      netTaxPaid: 84300,
      recommendedRegime: 'NEW' as const,
      formType: "ITR-1" as const,
      savings: 46000,
      status: "Filed"
    },
    {
      id: "Filing AY 2024-25",
      yearLabel: "AY 2024–25",
      date: "Generated July 2024",
      grossSalary: 920000,
      totalDeductions: 210000,
      netTaxPaid: 53200,
      recommendedRegime: 'NEW' as const,
      formType: "ITR-1" as const,
      savings: 32000,
      status: "Filed"
    }
  ], []);

  // A real filing's savings used to be overwritten with a flat guess keyed
  // only on which regime it recommended (77896 for New, 38000 for Old) --
  // every "New Regime" filing showed the identical savings figure regardless
  // of the taxpayer's actual income or deductions. executeFilingSubmission
  // (App.tsx) always saves the full taxData alongside a history entry, so the
  // real number is one calculateTax call away.
  const realHistory: HistoryEntry[] = React.useMemo(() => filingHistory.map((item, idx) => {
    const realSavings = item.taxData ? calculateTax(item.taxData).savings : undefined;
    return {
      ...item,
      yearLabel: `AY 202${6 - idx}–${27 - idx}`,
      savings: realSavings,
      status: 'Filed'
    };
  }), [filingHistory]);

  // isDemoMode (dev/?demo=true) shows the sample timeline deliberately. A
  // real visitor who hasn't filed anything yet gets an empty list instead --
  // rendered as a genuine empty state below, not a fabricated history.
  const activeHistory = isDemoMode ? demoHistory : realHistory;

  // Computed Stats
  const yearsFiledCount = activeHistory.length;
  const totalSavedValue = activeHistory.reduce((acc, item) => acc + (item.savings || 0), 0);
  const returnsCount = activeHistory.length;
  const lastFilingLabel = activeHistory.length > 0 ? (activeHistory[0].id.includes("AY") ? activeHistory[0].id.split("Filing ")[1] || activeHistory[0].id : "TXS-356587") : "TXS-356587";
  const yearSpanLabel = activeHistory.length > 0
    ? `${activeHistory[activeHistory.length - 1].yearLabel} to ${activeHistory[0].yearLabel}`
    : 'No filings yet';
  const mostRecentSavings = activeHistory[0]?.savings;

  // The "AI Tax Insights" panel below used to be four hardcoded values
  // (a specific year, a specific "+42%", a specific literal formatINR(51965),
  // a specific "3 years") shown regardless of what activeHistory actually
  // contained. All four are plain arithmetic over the real entries -- no
  // reason they weren't computed for real.
  const insights = React.useMemo(() => {
    const withSavings = activeHistory.filter((h) => h.savings !== undefined) as (HistoryEntry & { savings: number })[];
    if (withSavings.length === 0) return null;

    const highest = withSavings.reduce((a, b) => (b.savings > a.savings ? b : a));

    // activeHistory is newest-first; compare the two most recent entries.
    let mostImprovedLabel = 'Not enough history yet';
    if (withSavings.length >= 2) {
      const [latest, previous] = withSavings;
      if (previous.savings > 0) {
        const pctChange = Math.round(((latest.savings - previous.savings) / previous.savings) * 100);
        mostImprovedLabel = `${pctChange >= 0 ? '+' : ''}${pctChange}% (${latest.yearLabel} vs ${previous.yearLabel})`;
      } else {
        mostImprovedLabel = `${latest.yearLabel} vs ${previous.yearLabel}`;
      }
    }

    const average = Math.round(withSavings.reduce((sum, h) => sum + h.savings, 0) / withSavings.length);

    const newCount = activeHistory.filter((h) => h.recommendedRegime === 'NEW').length;
    const oldCount = activeHistory.length - newCount;
    const regimeLabel = newCount >= oldCount
      ? `New Regime (${newCount} year${newCount === 1 ? '' : 's'})`
      : `Old Regime (${oldCount} year${oldCount === 1 ? '' : 's'})`;

    return {
      highestLabel: `${highest.yearLabel} (${formatINR(highest.savings)})`,
      mostImprovedLabel,
      averageLabel: formatINR(average),
      regimeLabel,
    };
  }, [activeHistory]);

  const chartData = React.useMemo(() => {
    return activeHistory.map((item, idx) => {
      return {
        year: item.yearLabel || `AY ${26 - idx}`,
        savings: item.savings || 0,
        regime: item.recommendedRegime
      };
    }).reverse();
  }, [activeHistory]);

  // Filtering & Search
  const filteredHistory = React.useMemo(() => {
    return activeHistory.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = item.id.toLowerCase().includes(query) || 
                            item.date.toLowerCase().includes(query) || 
                            item.recommendedRegime.toLowerCase().includes(query);
      
      if (activeFilter === 'ALL') return matchesSearch;
      if (activeFilter === 'NEW') return matchesSearch && item.recommendedRegime === 'NEW';
      if (activeFilter === 'OLD') return matchesSearch && item.recommendedRegime === 'OLD';
      if (activeFilter === 'Filed') return matchesSearch && item.status === 'Filed';
      return matchesSearch;
    });
  }, [activeHistory, searchQuery, activeFilter]);

  // Reconstructs a reasonable TaxData when a history entry predates
  // executeFilingSubmission always saving the full object (App.tsx) --
  // derived entirely from that entry's own real aggregate fields, not
  // invented. Real entries created since always carry taxData directly.
  const resolveTaxData = (item: { grossSalary: number; totalDeductions: number; recommendedRegime: 'NEW' | 'OLD'; taxData?: TaxData }): TaxData => {
    if (item.taxData) return item.taxData;
    return {
      assessmentYear: TAX_CONFIG.assessmentYear,
      grossSalary: item.grossSalary,
      hraExemption: 0,
      ltaExemption: 0,
      standardDeductionOld: TAX_CONFIG.standardDeductionOld,
      standardDeductionNew: TAX_CONFIG.standardDeductionNew,
      otherIncome: 0,
      deduction80C: item.recommendedRegime === 'OLD' ? Math.min(item.totalDeductions, 150000) : 0,
      deduction80D: item.recommendedRegime === 'OLD' ? Math.max(0, Math.min(item.totalDeductions - 150000, 25000)) : 0,
      deduction80TTA: 0,
      deduction80G: 0,
      section24b: 0,
      tdsDeducted: 0,
    };
  };

  // Real exports via ExportService (jsPDF-generated PDF, structured ITR-schema
  // JSON) -- this used to call an alert()-only mock that downloaded nothing.
  const handleDownloadHistoryPDF = (item: { grossSalary: number; totalDeductions: number; recommendedRegime: 'NEW' | 'OLD'; formType: 'ITR-1' | 'ITR-2'; taxData?: TaxData }) => {
    ExportService.downloadPDF(resolveTaxData(item), item.formType);
  };

  const handleDownloadHistoryJSON = (item: { grossSalary: number; totalDeductions: number; recommendedRegime: 'NEW' | 'OLD'; formType: 'ITR-1' | 'ITR-2'; taxData?: TaxData }) => {
    ExportService.downloadJSON(resolveTaxData(item), item.formType);
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto text-slate-800 dark:text-slate-100 font-sans py-4">
      
      {/* 1. History Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/[0.06] pb-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono">
              Timeline Archives
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Tax History</h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Every filing securely archived. Track your savings, download previous returns, and revisit AI recommendations anytime.
          </p>
        </div>

        {/* Floating Quick Action Row */}
        <div className="flex flex-wrap items-center gap-3 select-none shrink-0">
          <button
            onClick={() => setActiveStep(3)}
            className="h-11 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <span>Start New Filing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            disabled
            title="Importing a previous return isn't built yet"
            className="h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed opacity-60 flex items-center gap-1.5"
          >
            Import Previous Return
            <span className="text-[9px] normal-case font-semibold tracking-normal">(coming soon)</span>
          </button>
        </div>
      </div>

      {activeHistory.length === 0 ? (
        /* Genuine empty state for a real user with no filings yet -- this
           used to be unreachable because demoHistory filled in regardless. */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/30 border-2 border-dashed border-slate-200/70 dark:border-slate-800/60 rounded-3xl">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mb-4">
            <History className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">No filings yet</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 max-w-sm mx-auto">
            Complete a filing and it will appear here, with your real savings figure and a downloadable copy.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
        
        {/* LEFT COLUMN: Stats, Chart, Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                title: 'Years Filed', 
                val: `${yearsFiledCount} Years`, 
                sub: yearSpanLabel, 
                icon: Calendar,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-500/10'
              },
              { 
                title: 'Total Tax Saved', 
                val: formatINR(totalSavedValue), 
                sub: mostRecentSavings !== undefined ? `${formatINR(mostRecentSavings)} in most recent filing` : 'Complete a filing to see this', 
                icon: TrendingUp,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-500/10'
              },
              { 
                title: 'Returns Generated', 
                val: `${returnsCount} Returns`, 
                sub: 'Self-computed, not filed', 
                icon: FileCheck2,
                color: 'text-purple-600 dark:text-purple-300',
                bg: 'bg-purple-500/10'
              },
              { 
                title: 'Last Filing', 
                val: lastFilingLabel, 
                sub: 'AY 2026–27 Active', 
                icon: ShieldCheck,
                color: 'text-cyan-600 dark:text-cyan-400',
                bg: 'bg-cyan-500/10'
              }
            ].map((stat) => {
              const IconComp = stat.icon;
              return (
                <div key={stat.title} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4.5 space-y-2 shadow-sm backdrop-blur-xl hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-extrabold">{stat.title}</span>
                    <div className={`w-7 h-7 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-base md:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight block">{stat.val}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{stat.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SVG Chart Section */}
          <SavingsChart data={chartData} />

          {/* History table view or Timeline view */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] pb-3 select-none">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest">Filing Logs</h3>
                <button
                  onClick={() => setIsTimelineView(!isTimelineView)}
                  className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  Switch to {isTimelineView ? 'Grid View' : 'Timeline View'}
                </button>
              </div>

              {/* Live Search & Filters Container */}
              <div className="flex items-center gap-2 relative">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by AY, regime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 w-48 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Horizontal filter chips row */}
            <div className="flex flex-wrap items-center gap-1.5 select-none pb-2">
              {['ALL', 'Filed', 'New Regime', 'Old Regime'].map((chip) => {
                const filterKey = chip === 'New Regime' ? 'NEW' : chip === 'Old Regime' ? 'OLD' : chip;
                const isActive = activeFilter === filterKey;
                return (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(filterKey)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/30' 
                        : 'bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {isTimelineView ? (
              // TIMELINE VIEW
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800 before:border-dashed">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="relative space-y-2 group">
                    <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-950 ring-4 ring-emerald-500/15 group-hover:scale-110 transition-transform" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs font-mono">{item.yearLabel || item.id}</span>
                        <span className="text-[9px] bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">{item.recommendedRegime}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{item.date}</span>
                    </div>
                    
                    <div className="p-4 bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-white/[0.04] rounded-2xl flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-white/[0.08] transition-all">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Estimated Savings</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{item.savings !== undefined ? formatINR(item.savings) : '—'}</span>
                      </div>
                      <button
                        onClick={() => setPreviewDoc({ id: item.id, formType: item.formType, grossSalary: item.grossSalary, totalDeductions: item.totalDeductions, recommendedRegime: item.recommendedRegime, taxData: item.taxData })}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Preview Document</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // GRID VIEW (Premium cards)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="bg-white/80 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200 shadow-sm backdrop-blur-xl">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono text-xs">{item.yearLabel || item.id}</span>
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          ✓ {item.status || 'Filed'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{item.date} • {item.recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-2 leading-relaxed">
                        Tax optimized and generated. Total estimated tax savings: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{item.savings !== undefined ? formatINR(item.savings) : 'not available'}</strong>
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between select-none">
                      <button
                        onClick={() => setPreviewDoc({ id: item.id, formType: item.formType, grossSalary: item.grossSalary, totalDeductions: item.totalDeductions, recommendedRegime: item.recommendedRegime, taxData: item.taxData })}
                        className="text-[10.5px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Return</span>
                      </button>

                      <button
                        title="Download JSON return file"
                        onClick={() => handleDownloadHistoryJSON(item)}
                        className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: AI Insights, Archives, Security (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Insights Panel */}
          <div className="bg-white/80 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-4 shadow-sm text-left">
            <span className="text-[10.5px] font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest block border-b border-slate-200/80 dark:border-white/[0.04] pb-2.5">
              AI Tax Insights
            </span>
            
            {insights ? (
              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-400">Highest Savings:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{insights.highestLabel}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/60 dark:border-white/[0.04] pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Most Improved Year:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{insights.mostImprovedLabel}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/60 dark:border-white/[0.04] pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Average Savings:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{insights.averageLabel}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200/60 dark:border-white/[0.04] pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Regime Recommendation:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{insights.regimeLabel}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium py-2">
                Complete a filing to see insights across your history.
              </p>
            )}

            <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.04]">
              <button
                onClick={() => setIsComparisonOpen(true)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span>Compare Years</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Archived Documents Section -- used to list four hardcoded
              documents ("AI Audit Report PDF", "Form 16 Snapshot", etc.) with
              fabricated file sizes, none of which existed. This shows the
              user's real uploaded files instead; there's no standalone
              preview/download for them yet, so each one opens the actual
              Document Vault rather than a fake preview modal. */}
          <div className="bg-white/80 dark:bg-[#060A10]/70 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-4 select-none shadow-sm text-left">
            <span className="text-[10.5px] font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-widest block border-b border-slate-200/80 dark:border-white/[0.04] pb-2.5">
              Uploaded Documents
            </span>

            {uploadedFiles.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium py-2">
                No documents uploaded yet.
              </p>
            ) : (
              <div className="space-y-3 font-semibold text-xs text-slate-700 dark:text-slate-300">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setActiveStep(3)}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl hover:border-slate-300 dark:hover:border-white/[0.1] transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="text-[11.5px] font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{file.name}</div>
                      <div className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">{file.size} • {file.status}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] rounded-xl text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Eye className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Protected security card */}
          <div className="bg-emerald-500/10 dark:bg-emerald-500/[0.04] border border-emerald-500/20 dark:border-emerald-500/10 rounded-3xl p-6 backdrop-blur-xl space-y-4 text-left">
            <span className="text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block border-b border-emerald-500/20 pb-2.5">
              Protected Archive
            </span>
            
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              {[
                'Stored in this browser only',
                'No filing shared automatically',
                'Recomputed live from your own inputs',
                'Never written to a server database'
              ].map((check) => (
                <div key={check} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      )}

      {/* QUICK DOCUMENT PREVIEW MODAL */}
      {createPortal(
        <AnimatePresence>
          {previewDoc && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewDoc(null)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10 p-6 md:p-7 rounded-[28px] shadow-2xl z-10 text-left text-slate-900 dark:text-white space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight">{previewDoc.id}</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">{previewDoc.formType} Computation</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/[0.04] p-4 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500">Stored:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">THIS BROWSER ONLY</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500">Assessment Year:</span>
                    <span className="font-bold">AY {TAX_CONFIG.assessmentYear}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This is a self-computed worksheet based on the figures you entered -- not a filed return, and not verified by anyone but this calculator. It's stored in this browser only.
                </p>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      handleDownloadHistoryPDF(previewDoc);
                      setPreviewDoc(null);
                    }}
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadHistoryJSON(previewDoc);
                      setPreviewDoc(null);
                    }}
                    className="flex-1 h-11 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Expandable Year Comparison Side Sheet Drawer */}
      {createPortal(
        <AnimatePresence>
          {isComparisonOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsComparisonOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[200] transition-opacity"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-[#0B1020] border-l border-slate-200 dark:border-white/10 p-8 shadow-2xl z-[200] flex flex-col justify-between overflow-y-auto text-left text-slate-900 dark:text-white"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight">Multi-Year Exemption Comparison</h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">{yearSpanLabel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsComparisonOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Slabs Comparison Table -- used to be three rows with fixed
                      years and amounts regardless of what activeHistory held;
                      now it's a direct map over the real entries. */}
                  <div className="pt-2 space-y-4">
                    <div className="overflow-x-auto border border-slate-200 dark:border-white/[0.06] rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 shadow-inner">
                      <table className="w-full text-left text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/[0.06] text-slate-500 uppercase tracking-wider text-[9px]">
                            <th className="p-4">Assessment Year</th>
                            <th className="p-4">Gross Salary</th>
                            <th className="p-4">Regime</th>
                            <th className="p-4">Tax Savings</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-800 dark:text-slate-200 font-mono">
                          {activeHistory.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200/60 dark:border-white/[0.02]">
                              <td className="p-4 font-bold text-slate-900 dark:text-white">{item.yearLabel}</td>
                              <td className="p-4">{formatINR(item.grossSalary)}</td>
                              <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">{item.recommendedRegime}</td>
                              <td className="p-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
                                {item.savings !== undefined ? formatINR(item.savings) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* This used to assert a specific cause ("because your
                        employer NPS contributions increased") for whichever
                        year happened to be on screen, regardless of whether
                        that's what actually happened. The stored history
                        doesn't track per-deduction changes between years, so
                        there's no real basis for a causal claim -- this states
                        the comparison itself rather than inventing a reason. */}
                    {insights && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 font-semibold">
                          <span className="text-blue-600 dark:text-blue-400 block text-[10px] uppercase tracking-wider font-extrabold">Summary</span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            Highest savings: {insights.highestLabel}. Recommended regime across your history: {insights.regimeLabel}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Stored in this browser only</span>
                  </div>
                  <button
                    onClick={() => setIsComparisonOpen(false)}
                    className="h-10 px-5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
});

export default HistoryArchive;
