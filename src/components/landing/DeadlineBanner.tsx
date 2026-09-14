import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { TAX_CONFIG, FILING_DEADLINES } from '../../config';

interface DeadlineBannerProps {
  onStart: () => void;
  /** Fires whenever the banner's rendered/hidden state changes, so the fixed
   *  navbar below it (which has no document-flow reference point) can move
   *  up and reclaim the space when this banner is dismissed. */
  onVisibilityChange?: (visible: boolean) => void;
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

const DISMISS_KEY = 'taxsense_deadline_banner_dismissed_for';

export const DeadlineBanner: React.FC<DeadlineBannerProps> = ({ onStart, onVisibilityChange }) => {
  const [state, setState] = useState<BannerState>(() => readClock(Date.now()));
  // Dismissal is scoped to the current phase (open / belated / closed) via
  // sessionStorage, so a fresh tab still shows the banner once the phase
  // changes -- e.g. when the due date passes -- rather than staying hidden
  // forever because of a click made weeks earlier.
  const [dismissedPhase, setDismissedPhase] = useState<Phase | null>(() => {
    if (typeof window === 'undefined') return null;
    return (sessionStorage.getItem(DISMISS_KEY) as Phase | null) ?? null;
  });

  useEffect(() => {
    const tick = () => setState(readClock(Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const { phase, msLeft } = state;

  const isVisible = dismissedPhase !== phase;

  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  if (!isVisible) return null;

  const dismiss = () => {
    setDismissedPhase(phase);
    sessionStorage.setItem(DISMISS_KEY, phase);
  };
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
        Belated return still open —{' '}
        <strong className="text-slate-900 dark:text-slate-200 font-semibold">
          ₹{FILING_DEADLINES.lateFee.toLocaleString('en-IN')} Sec 234F
        </strong>{' '}
        fee, ₹{FILING_DEADLINES.lateFeeReduced.toLocaleString('en-IN')} if income ≤ ₹5 lakh.
      </>
    ) : (
      <>The belated return window closed on 31 December. You can still compare regimes and plan for next year.</>
    );

  // Plain-text twin of `detail` for the title tooltip, so the full sentence is
  // still reachable when the truncate kicks in at narrower widths.
  const detailText =
    phase === 'open'
      ? `File by 31 July to avoid the ₹${FILING_DEADLINES.lateFee.toLocaleString('en-IN')} Sec 234F late filing fee.`
      : phase === 'belated'
      ? `Belated return (Sec 139(4)) still open — ₹${FILING_DEADLINES.lateFee.toLocaleString('en-IN')} Sec 234F fee, ₹${FILING_DEADLINES.lateFeeReduced.toLocaleString('en-IN')} if income ≤ ₹5 lakh.`
      : 'The belated return window closed on 31 December. You can still compare regimes and plan for next year.';

  const countdownLabel = phase === 'open' ? 'Due date' : 'Belated cut-off';

  return (
    <div className="w-full bg-white/70 dark:bg-[#080D1A]/80 border-b border-slate-200/60 dark:border-white/[0.06] py-2 px-4 text-slate-700 dark:text-slate-300 text-xs font-sans select-none relative z-50 backdrop-blur-md">
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
          <span className="hidden md:inline text-slate-600 dark:text-slate-400 truncate" title={detailText}>{detail}</span>
        </div>

        {/* Right countdown & CTA group */}
        <div className="flex items-center gap-3 shrink-0">
          {phase !== 'closed' && (
            <div className="flex items-center gap-1.5 text-xs font-sans text-slate-600 dark:text-slate-400">
              <Clock className={`w-3.5 h-3.5 ${accent.text}`} />
              <span className="hidden xl:inline text-slate-500 font-medium">{countdownLabel}:</span>
              <span className={`font-mono border px-2 py-0.5 rounded-md font-bold text-xs tabular-nums ${accent.chip}`}>
                {days}d {hours}h {minutes}m {seconds}s
              </span>
            </div>
          )}

          <button
            onClick={onStart}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-2xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            <span>{phase === 'closed' ? 'Compare regimes' : 'File now'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={dismiss}
            aria-label="Dismiss deadline notice"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
