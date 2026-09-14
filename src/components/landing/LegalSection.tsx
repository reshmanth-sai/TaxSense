import React from 'react';
import { motion } from 'motion/react';
import {
  Lock, FileCheck, Github, Upload, CloudOff, HardDrive, UserCheck, EyeOff,
  Calculator, ShieldAlert, FileWarning, Scale,
} from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';
import { CardSpotlight } from './helpers/CardSpotlight';

// Privacy Policy and Terms of Service used to both be footer links that
// scrolled to the Security section instead of their own content -- three
// distinct legal documents resolving to one marketing page. Everything
// stated below is already true of the app elsewhere (see SecuritySection.tsx
// and FAQSection.tsx); this just gives each document its own place to live.
//
// Laid out with the same centred header + card grid as the sections above it
// (SecuritySection, FAQSection) so the page reads as one system rather than a
// marketing page with a legal document stapled to the bottom.

type Tone = 'blue' | 'emerald' | 'purple' | 'amber';

const TONES: Record<Tone, { tile: string; hover: string; glow: string }> = {
  blue:    { tile: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',          hover: 'hover:border-blue-500/40 dark:hover:shadow-blue-500/5',    glow: 'rgba(59, 130, 246, 0.09)' },
  emerald: { tile: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-[#16E27A]', hover: 'hover:border-emerald-500/40 dark:hover:shadow-emerald-500/5', glow: 'rgba(16, 185, 129, 0.09)' },
  purple:  { tile: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',  hover: 'hover:border-purple-500/40 dark:hover:shadow-purple-500/5',  glow: 'rgba(168, 85, 247, 0.09)' },
  amber:   { tile: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',      hover: 'hover:border-amber-500/40 dark:hover:shadow-amber-500/5',    glow: 'rgba(245, 158, 11, 0.09)' },
};

interface LegalCardProps {
  icon: React.ReactNode;
  title: string;
  tone: Tone;
  delay?: number;
  children: React.ReactNode;
}

const LegalCard: React.FC<LegalCardProps> = ({ icon, title, tone, delay = 0, children }) => {
  const t = TONES[tone];
  return (
    <CardSpotlight className="rounded-2xl" glowColor={t.glow}>
      <PremiumCard
        className={`p-6 space-y-4 text-left transition-all duration-300 hover:shadow-lg bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl h-full ${t.hover}`}
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
      >
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${t.tile}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
      </PremiumCard>
    </CardSpotlight>
  );
};

const linkClass = 'text-blue-600 dark:text-blue-400 hover:underline';

export const LegalSection: React.FC = React.memo(() => {
  const lastUpdated = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="py-24 md:py-28 px-6 max-w-5xl mx-auto space-y-24">

      {/* ---------------- Privacy Policy ---------------- */}
      <div id="privacy-policy" className="scroll-mt-28 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-2xs font-bold font-mono uppercase tracking-widest mx-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            What we do with your data
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Six things, in plain English. Nothing here is a summary of a longer document — this is the whole policy.
          </p>
          <p className="text-2xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-500">Last updated {lastUpdated}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LegalCard icon={<Upload className="w-5 h-5" />} title="What you give us" tone="blue" delay={0.05}>
            Whatever you type into the calculator, or a Form 16 PDF if you choose to upload one. You never need to give a name, email, or phone number to use TaxSense -- guest sessions work without any of that.
          </LegalCard>
          <LegalCard icon={<CloudOff className="w-5 h-5" />} title="What happens to a Form 16 you upload" tone="purple" delay={0.1}>
            It's sent over TLS to Google's Gemini API, which reads it and returns the extracted text. We discard the file at that point -- Google's own <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>privacy policy</a> governs how they handle it during that request. This is the one point where your document leaves your device.
          </LegalCard>
          <LegalCard icon={<HardDrive className="w-5 h-5" />} title="Where your figures live" tone="emerald" delay={0.15}>
            In your browser's own storage, not a server-side database. We write no Form 16, no PAN, and no salary figure to a database. A guest session clears after 30 minutes of inactivity.
          </LegalCard>
          <LegalCard icon={<UserCheck className="w-5 h-5" />} title="If you sign in with Google" tone="blue" delay={0.2}>
            Signing in is optional and only keeps the same workspace data described above saved in this browser (instead of clearing it after 30 minutes) -- it does not add any new category of data collection, and nothing is uploaded to our servers. We never access your Drive or Gmail, and your data is never used to train an AI model.
          </LegalCard>
          <LegalCard icon={<EyeOff className="w-5 h-5" />} title="What we don't do" tone="emerald" delay={0.25}>
            We run no advertising trackers and set no cookies. The only measurement is Vercel's cookieless page-view counter, which records that a page was visited — never who visited, what you typed, or any figure from your return. We don't sell or share your data with anyone beyond the Gemini extraction request above, and we never ask for your e-filing portal login or OTP.
          </LegalCard>
          <LegalCard icon={<Github className="w-5 h-5" />} title="Questions" tone="purple" delay={0.3}>
            TaxSense is open source. Read the code or open an issue at <a href="https://github.com/reshmanth-sai/TaxSense" target="_blank" rel="noopener noreferrer" className={linkClass}>github.com/reshmanth-sai/TaxSense</a>.
          </LegalCard>
        </div>
      </div>

      {/* ---------------- Terms of Service ---------------- */}
      <div id="terms-of-service" className="scroll-mt-28 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-2xs font-bold font-mono uppercase tracking-widest mx-auto">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            What TaxSense is, and isn't
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Four commitments, and the one thing we need you to do before you file.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <LegalCard icon={<Calculator className="w-5 h-5" />} title="It's a calculator, not a filing service" tone="blue" delay={0.05}>
            TaxSense estimates your Old vs New regime tax liability using the AY 2026-27 rules. It is not affiliated with the Income Tax Department, and it does not submit anything on your behalf. You file your return yourself, on the official e-filing portal at <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer" className={linkClass}>incometax.gov.in</a>.
          </LegalCard>
          <LegalCard icon={<ShieldAlert className="w-5 h-5" />} title="Verify before you file" tone="amber" delay={0.1}>
            The numbers TaxSense shows you are estimates based on what you entered or what was extracted from your Form 16. We don't guarantee they're free of error -- double-check figures against your own documents before relying on them, and consult a tax professional if your situation is complicated.
          </LegalCard>
          <LegalCard icon={<FileWarning className="w-5 h-5" />} title="Provided as-is" tone="purple" delay={0.15}>
            TaxSense is provided without warranty of any kind. We may change, pause, or discontinue the service at any time.
          </LegalCard>
          <LegalCard icon={<Scale className="w-5 h-5" />} title="Governing law" tone="emerald" delay={0.2}>
            These terms are governed by the laws of India.
          </LegalCard>
        </div>
      </div>

    </section>
  );
});
LegalSection.displayName = 'LegalSection';
