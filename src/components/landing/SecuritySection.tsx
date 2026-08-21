import React from 'react';
import { motion } from 'motion/react';
import { KeyRound, Shield, FileText, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';
import { CardSpotlight } from './helpers/CardSpotlight';

export const SecuritySection: React.FC = React.memo(() => {
  return (
    <section id="security" className="py-24 md:py-28 px-6 max-w-5xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>How your data is handled</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          No account. No database.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Here is exactly what happens to your Form 16 — including the part most tax tools leave out.
        </p>
      </motion.div>

      {/* What actually happens to your data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSpotlight className="rounded-2xl" glowColor="rgba(59, 130, 246, 0.09)">
          <PremiumCard
            className="p-6 space-y-4 text-left transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-blue-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl h-full"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No account required</h3>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase tracking-wider block">Guest mode</span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Run a full regime comparison without giving us a name, an email, or a phone number. Signing in is optional and only adds cross-device sync.
            </p>
          </PremiumCard>
        </CardSpotlight>

        <CardSpotlight className="rounded-2xl" glowColor="rgba(16, 185, 129, 0.09)">
          <PremiumCard
            className="p-6 space-y-4 text-left transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg dark:hover:shadow-emerald-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl h-full"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-[#16E27A]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nothing stored on our servers</h3>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-[#16E27A] font-bold uppercase tracking-wider block">No database writes</span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
              We write no Form 16, no PAN, and no salary figure to a database. Your working session is kept in this browser's own storage and clears after 30 minutes of inactivity.
            </p>
          </PremiumCard>
        </CardSpotlight>

        <CardSpotlight className="rounded-2xl" glowColor="rgba(168, 85, 247, 0.09)">
          <PremiumCard
            className="p-6 space-y-4 text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg dark:hover:shadow-purple-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl h-full"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Read by Google Gemini</h3>
              <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">Third-party processor</span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
              To read your PDF, we send it over TLS to Google's Gemini API and discard it once the text comes back. This is the one point where your document leaves your device — we would rather you knew.
            </p>
          </PremiumCard>
        </CardSpotlight>

        <CardSpotlight className="rounded-2xl" glowColor="rgba(245, 158, 11, 0.09)">
          <PremiumCard
            className="p-6 space-y-4 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg dark:hover:shadow-amber-500/5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl h-full"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Built to the AY 2026-27 rules</h3>
              <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">Finance Act, FY 2025-26</span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Slabs, the Section 87A rebate, Section 115BAC and the 4% cess follow the current Finance Act. TaxSense is a calculator, not a filing intermediary — you file on the e-filing portal.
            </p>
          </PremiumCard>
        </CardSpotlight>
      </div>

      {/* Plain-language summary of what we do and do not do */}
      <div className="p-5 bg-slate-50 dark:bg-[#0E131B]/60 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-start gap-2 leading-relaxed"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" /> We never ask for a login, an OTP, or your e-filing portal password.</span>
        <span className="flex items-start gap-2 leading-relaxed"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" /> We never write your tax figures to a server-side database.</span>
        <span className="flex items-start gap-2 leading-relaxed"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" /> Your PDF is sent to Google Gemini to be read, then dropped.</span>
      </div>
    </section>
  );
});
SecuritySection.displayName = "SecuritySection";
