import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  FileUp, 
  SlidersHorizontal, 
  Printer, 
  MessageSquare, 
  LayoutDashboard, 
  Award, 
  ListTodo, 
  FileText, 
  History, 
  ShieldCheck, 
  Users, 
  X,
  Command
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateStep: (step: number) => void;
  onOpenWhatIf?: () => void;
  onOpenPdf?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateStep,
  onOpenWhatIf,
  onOpenPdf
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const togglePrivacyBlur = useTaxStore((state) => state.togglePrivacyBlur);

  const items = [
    { id: 'resume', name: 'Resume Tax Return Filing', category: 'Actions', icon: ArrowRight, action: () => onNavigateStep(6) },
    { id: 'upload', name: 'Upload Form 16 / Rent Receipts', category: 'Actions', icon: FileUp, action: () => onNavigateStep(3) },
    { id: 'whatif', name: 'Open What-If Tax Simulator', category: 'Actions', icon: SlidersHorizontal, action: () => onOpenWhatIf && onOpenWhatIf() },
    { id: 'pdf', name: 'Generate PDF Tax Statement', category: 'Actions', icon: Printer, action: () => onOpenPdf && onOpenPdf() },
    { id: 'copilot', name: 'Ask AI Copilot for Guidance', category: 'Actions', icon: MessageSquare, action: () => onNavigateStep(4) },
    
    { id: 'dashboard', name: 'Go to Dashboard Command Center', category: 'Navigation', icon: LayoutDashboard, action: () => onNavigateStep(11) },
    { id: 'optimize', name: 'Go to Optimize & Regime Comparison', category: 'Navigation', icon: Award, action: () => onNavigateStep(5) },
    { id: 'vault', name: 'Go to Document Vault', category: 'Navigation', icon: FileText, action: () => onNavigateStep(3) },
    { id: 'history', name: 'Go to Activity History & Reports', category: 'Navigation', icon: History, action: () => onNavigateStep(10) },

    { id: 'privacy', name: 'Toggle Privacy Blur Mode', category: 'Settings', icon: ShieldCheck, action: () => togglePrivacyBlur() },
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 font-sans">
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
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden z-10 text-left"
          onKeyDown={handleKeyDown}
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/[0.06]">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search... (e.g. 'PDF', 'Upload', 'Simulator')"
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
              autoFocus
            />
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-400 rounded-md">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No matching commands found.
              </div>
            )}
          </div>

          {/* Footer Shortcuts Help */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span>↑↓ Navigate</span>
              <span>•</span>
              <span>↵ Select</span>
            </div>
            <div>TaxSense ⌘K Palette</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
