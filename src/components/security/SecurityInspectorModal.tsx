import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle2, X, Cpu, RefreshCw, KeyRound } from 'lucide-react';

interface SecurityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
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
          className="relative w-full max-w-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 p-6 md:p-8 text-left space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Trust & Security Inspector
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Verified Local Sandbox Protection
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security Features List */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] space-y-1 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AES-256 Client-Side Encryption</span>
              </div>
              <p className="text-slate-500 leading-relaxed pl-6">
                All uploaded Form 16 documents and financial inputs are encrypted directly in your browser before processing.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] space-y-1 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Zero Gmail & Drive Access Guarantee</span>
              </div>
              <p className="text-slate-500 leading-relaxed pl-6">
                TaxSense only uses Google OAuth for basic sign-in identity. We never request or access your private Gmail messages or Google Drive storage.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] space-y-1 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <RefreshCw className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Ephemeral Session Memory Purge</span>
              </div>
              <p className="text-slate-500 leading-relaxed pl-6">
                Guest sessions are automatically deleted upon closing the browser tab. No permanent records remain on cloud servers.
              </p>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              Gateway Status: Active (Local Sandbox)
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
