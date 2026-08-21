import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TAX_CONFIG, FILING_DEADLINES } from '../../config';

interface DeadlineBannerProps {
  onStart: () => void;
}

type Phase = 'open' | 'belated' | 'closed';

interface BannerState {
  phase: Phase;
  /** Milliseconds remaining until the deadline that governs the current phase. */
  msLeft: number;
}

const AY = TAX_CONFIG.assessmentYear;

function readClock(now: number): BannerState {
  const due = FILING_DEADLINES.dueDate.getTime();
  const belated = FILING_DEADLINES.belatedCutoff.getTime();

  if (now <= due) return { phase: 'open', msLeft: due - now };
  if (now <= belated) return { phase: 'belated', msLeft: belated - now };
  return { phase: 'closed', msLeft: 0 };
}

function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export const DeadlineBanner: React.FC<DeadlineBannerProps> = ({ onStart }) => {
  const [state, setState] = useState<BannerState>(() => readClock(Date.now()));

  useEffect(() => {
    const tick = () => setState(readClock(Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const { phase, msLeft } = state;
  const { days, hours, minutes, seconds } = splitDuration(msLeft);

  // The belated window is the one that carries a penalty, so it reads as a
  // warning rather than an invitation. Once even that has closed, the banner
  // stops counting down entirely instead of implying there is still time.
  const accent =
    phase === 'open'
      ? { text: 'text-amber-500', chip: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300', dot: 'bg-amber-400', dotCore: 'bg-amber-500' }
      : phase === 'belated'
      ? { text: 'text-red-500', chip: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300', dot: 'bg-red-400', dotCore: 'bg-red-500' }
      : { text: 'text-slate-400', chip: 'bg-slate-500/10 border-slate-400/30 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400', dotCore: 'bg-slate-500' };

  const headline =
    phase === 'open'
      ? `AY ${AY} ITR filing window open`
      : phase === 'belated'
      ? `AY ${AY} due date has passed`
      : `AY ${AY} filing window closed`;

  const detail =
    phase === 'open' ? (
      <>
        File by 31 July to avoid the{' '}
        <strong className="text-slate-900 dark:text-slate-200 font-semibold">
          ₹{FILING_DEADLINES.lateFee.toLocaleString('en-IN')} Sec 234F
        </strong>{' '}
        late filing fee.
      </>
    ) : phase === 'belated' ? (
      <>
        You can still file a belated return under Sec 139(4). A{' '}
        <strong className="text-slate-900 dark:text-slate-200 font-semibold">
          ₹{FILING_DEADLINES.lateFee.toLocaleString('en-IN')} Sec 234F
        </strong>{' '}
        fee applies (₹{FILING_DEADLINES.lateFeeReduced.toLocaleString('en-IN')} if your total income is under ₹5 lakh).
      </>
    ) : (
      <>The belated return window closed on 31 December. You can still compare regimes and plan for next year.</>
    );

  const countdownLabel = phase === 'open' ? 'Due date' : 'Belated cut-off';

  return (
    <div className="w-full bg-white/70 dark:bg-[#080D1A]/80 border-b border-slate-200/60 dark:border-white/[0.06] py-2 px-4 text-slate-700 dark:text-slate-300 text-[11px] font-sans select-none relative z-50 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
        {/* Left message group */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            {phase !== 'closed' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${accent.dot}`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${accent.dotCore}`} />
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5 shrink-0">
            {phase === 'closed' ? (
              <CheckCircle2 className={`w-3.5 h-3.5 ${accent.text}`} />
            ) : (
              <ShieldAlert className={`w-3.5 h-3.5 ${accent.text}`} />
            )}
            <span>{headline}</span>
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden md:inline text-slate-600 dark:text-slate-400 truncate">{detail}</span>
        </div>

        {/* Right countdown & CTA group */}
        <div className="flex items-center gap-3 shrink-0">
          {phase !== 'closed' && (
            <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 dark:text-slate-400">
              <Clock className={`w-3.5 h-3.5 ${accent.text}`} />
              <span className="hidden sm:inline text-slate-500 font-medium">{countdownLabel}:</span>
              <span className={`font-mono border px-2 py-0.5 rounded-md font-bold text-[11px] tabular-nums ${accent.chip}`}>
                {days}d {hours}h {minutes}m {seconds}s
              </span>
            </div>
          )}

          <button
            onClick={onStart}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md border border-amber-400/30 hover:scale-[1.02] active:scale-95"
          >
            <span>{phase === 'closed' ? 'Compare regimes' : 'File now'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
