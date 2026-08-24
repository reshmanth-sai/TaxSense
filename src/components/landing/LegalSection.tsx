import React from 'react';
import { motion } from 'motion/react';
import { Lock, FileCheck, Github } from 'lucide-react';
import { PremiumCard } from './helpers/PremiumCard';

// Privacy Policy and Terms of Service used to both be footer links that
// scrolled to the Security section instead of their own content -- three
// distinct legal documents resolving to one marketing page. Everything
// stated below is already true of the app elsewhere (see SecuritySection.tsx
// and FAQSection.tsx); this just gives each document its own place to live.
export const LegalSection: React.FC = React.memo(() => {
  return (
    <section className="py-20 md:py-24 px-6 max-w-3xl mx-auto space-y-16 text-left">

      <div id="privacy-policy" className="scroll-mt-28 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-2xs font-bold font-mono uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What we do with your data
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </motion.div>

        <PremiumCard
          className="p-6 space-y-5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">What you give us</h3>
            <p>Whatever you type into the calculator, or a Form 16 PDF if you choose to upload one. You never need to give a name, email, or phone number to use TaxSense -- guest sessions work without any of that.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">What happens to a Form 16 you upload</h3>
            <p>It's sent over TLS to Google's Gemini API, which reads it and returns the extracted text. We discard the file at that point -- Google's own <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">privacy policy</a> governs how they handle it during that request. This is the one point where your document leaves your device.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Where your figures live</h3>
            <p>In your browser's own storage, not a server-side database. We write no Form 16, no PAN, and no salary figure to a database. A guest session clears after 30 minutes of inactivity.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">If you sign in with Google</h3>
            <p>Signing in is optional and only adds cross-device sync of the same workspace data described above -- it does not add any new category of data collection. We never access your Drive or Gmail, and your data is never used to train an AI model.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">What we don't do</h3>
            <p>We run no analytics or advertising trackers on this site, we don't sell or share your data with anyone beyond the Gemini extraction request above, and we never ask for your e-filing portal login or OTP.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Questions</h3>
            <p>TaxSense is open source. Read the code or open an issue at <a href="https://github.com/reshmanth-sai/TaxSense" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">github.com/reshmanth-sai/TaxSense<Github className="w-3.5 h-3.5" /></a>.</p>
          </div>
        </PremiumCard>
      </div>

      <div id="terms-of-service" className="scroll-mt-28 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-2xs font-bold font-mono uppercase tracking-widest">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What TaxSense is, and isn't
          </h2>
        </motion.div>

        <PremiumCard
          className="p-6 space-y-5 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-2xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">It's a calculator, not a filing service</h3>
            <p>TaxSense estimates your Old vs New regime tax liability using the AY 2026-27 rules. It is not affiliated with the Income Tax Department, and it does not submit anything on your behalf. You file your return yourself, on the official e-filing portal at <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">incometax.gov.in</a>.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Verify before you file</h3>
            <p>The numbers TaxSense shows you are estimates based on what you entered or what was extracted from your Form 16. We don't guarantee they're free of error -- double-check figures against your own documents before relying on them, and consult a tax professional if your situation is complicated.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Provided as-is</h3>
            <p>TaxSense is provided without warranty of any kind. We may change, pause, or discontinue the service at any time.</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Governing law</h3>
            <p>These terms are governed by the laws of India.</p>
          </div>
        </PremiumCard>
      </div>

    </section>
  );
});
LegalSection.displayName = 'LegalSection';
