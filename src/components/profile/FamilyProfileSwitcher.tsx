import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  User, 
  Heart, 
  UserCheck, 
  Plus, 
  X, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Award
} from 'lucide-react';
import { useTaxStore, TaxProfile } from '../../store/useTaxStore';
import { formatINR } from '../../utils/taxCalculator';

interface FamilyProfileSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const FamilyProfileSwitcher: React.FC<FamilyProfileSwitcherProps> = ({ 
  compact = false,
  className = '' 
}) => {
  const taxProfiles = useTaxStore((state) => state.taxProfiles) || [];
  const activeProfileId = useTaxStore((state) => state.activeProfileId) || 'self';
  const switchProfile = useTaxStore((state) => state.switchProfile);
  const addTaxProfile = useTaxStore((state) => state.addTaxProfile);

  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Add Member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<'Self' | 'Spouse' | 'Parent' | 'Dependent'>('Spouse');
  const [newMemberSalary, setNewMemberSalary] = useState<number>(850000);
  const [newMemberPan, setNewMemberPan] = useState('');

  const activeProfile = taxProfiles.find((p) => p.id === activeProfileId) || taxProfiles[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newId = `profile-${Date.now()}`;
    const newProfileObj: TaxProfile = {
      id: newId,
      name: newMemberName,
      relation: newMemberRelation,
      pan: newMemberPan || 'AB*****12X',
      incomeProfile: {
        grossSalary: newMemberSalary,
        basicSalary: Math.round(newMemberSalary * 0.4),
        hraReceived: 0,
        standardDeduction: 75000,
        otherIncome: 0,
        employeeName: newMemberName,
        employerName: 'Family Workspace Profile',
        pan: newMemberPan || 'AB*****12X',
        pfContribution: 0,
        tdsDeducted: 0
      },
      confirmedDeductions: {
        '80C': 0,
        '80D': 0,
        'HRA exemption': 0,
        '80CCD(1B)': 0,
        '80CCD(2)': 0,
        'section24b': 0
      },
      uploadedFiles: []
    };

    addTaxProfile(newProfileObj);
    setShowAddModal(false);
    setNewMemberName('');
    setNewMemberPan('');
  };

  const getRelationBadgeColor = (rel: string) => {
    switch (rel) {
      case 'Self': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Spouse': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Parent': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getAvatarIcon = (rel: string) => {
    switch (rel) {
      case 'Spouse': return Heart;
      case 'Parent': return Award;
      default: return User;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      {compact ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04] hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              {activeProfile?.name ? activeProfile.name.charAt(0) : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {activeProfile?.name || 'Self'}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {activeProfile?.relation || 'Self'}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        /* Full Dashboard Bar Variant */
        <div className="bg-white/80 dark:bg-slate-900/35 border border-slate-200/60 dark:border-white/[0.04] rounded-[24px] p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Family Workspace
                </span>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-purple-500/20">
                  {taxProfiles.length} Profiles
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between family members to manage ITR returns in one place.
              </p>
            </div>
          </div>

          {/* Profile Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {taxProfiles.map((p) => {
              const isSelected = p.id === activeProfileId;
              const Icon = getAvatarIcon(p.relation);
              return (
                <button
                  key={p.id}
                  onClick={() => switchProfile(p.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-100/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                  }`}>
                    {p.relation}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Add new family tax profile"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Menu (for compact sidebar view) */}
      <AnimatePresence>
        {isOpen && compact && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-left"
          >
            <div className="px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-200/60 dark:border-white/[0.04]">
              Family Profiles
            </div>

            {taxProfiles.map((p) => {
              const isSelected = p.id === activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    switchProfile(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getRelationBadgeColor(p.relation)}`}>
                      {p.relation}
                    </span>
                    <span>{p.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}

            <div className="pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Family Profile</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-[#060A10]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl p-6 z-10 text-left space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Add Family Member Profile
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Create an isolated tax return profile for a family member.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Relationship</label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent (Senior Citizen)</option>
                    <option value="Dependent">Dependent Child / Relative</option>
                    <option value="Self">Self (Alternative)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Estimated Gross Salary (₹)</label>
                  <input
                    type="number"
                    step={25000}
                    value={newMemberSalary}
                    onChange={(e) => setNewMemberSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">PAN Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PS*****88A"
                    value={newMemberPan}
                    onChange={(e) => setNewMemberPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
