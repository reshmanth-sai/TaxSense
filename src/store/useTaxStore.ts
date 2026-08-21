import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import { TaxData } from '../types';

const secureStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    if (sessionStorage.getItem('taxsense_incognito') === 'true') {
      return null;
    }
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('taxsense_incognito') !== 'true') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};


export function useTaxStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  employer: string;
  financialYear: string;
  pages: number;
  uploadTime: string;
  status: 'Verified' | 'Failed' | 'Processing';
  confidence: number;
}

const isDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.search.includes('demo=true'));

const defaultUploadedFiles: UploadedFile[] = isDev ? [
  {
    id: 'mohit-form16-default',
    name: 'Form_16_Mohit_FY25-26.pdf',
    size: '254 KB',
    employer: 'Acme Corp Technologies',
    financialYear: 'FY 2025-26',
    pages: 3,
    uploadTime: 'Jul 4, 19:40',
    status: 'Verified',
    confidence: 99
  }
] : [];

export interface IncomeProfile {
  grossSalary: number;
  tdsDeducted: number;
  basicSalary: number;
  hraReceived: number;
  standardDeduction: number;
  otherIncome: number;
  employerName?: string;
  employeeName?: string;
  pan?: string;
  pfContribution?: number;
  stcg?: number;
  ltcg?: number;
  assessmentYear?: string;
}

export interface ConfirmedDeductions {
  '80C': number;
  '80D': number;
  'HRA exemption': number;
  '80CCD(1B)': number;
  '80CCD(2)'?: number;
  '80DD'?: number;
  '80U'?: number;
  '80DDB'?: number;
  '80E'?: number;
  '80EEA'?: number;
  '80GG'?: number;
  '80TTA'?: number;
  '80TTB'?: number;
  '80G'?: number;
  '80CCH'?: number;
  'section24bLetOut'?: number;
  section24b?: number;
  // CamelCase fallback for convenience
  hraExemption?: number;
}

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface FilingHistoryItem {
  id: string;
  date: string;
  grossSalary: number;
  totalDeductions: number;
  netTaxPaid: number;
  recommendedRegime: 'NEW' | 'OLD';
  formType: 'ITR-1' | 'ITR-2';
  taxData?: TaxData;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  providerId: string;
  createdAt: string;
}

export interface TaxProfile {
  id: string;
  name: string;
  relation: 'Self' | 'Spouse' | 'Parent' | 'Dependent';
  pan?: string;
  incomeProfile: IncomeProfile;
  confirmedDeductions: ConfirmedDeductions;
  uploadedFiles: UploadedFile[];
}

export type CurrentStep = 'HOME' | 'LANDING' | 'CONFIRM_EXTRACTION' | 'CHAT_QA' | 'FINAL_EXPORT';

export interface TaxStoreState {
  incomeProfile: IncomeProfile;
  confirmedDeductions: ConfirmedDeductions;
  chatHistory: ChatMessageItem[];
  currentStep: CurrentStep;
  isExtracting: boolean;
  isChatLoading: boolean;
  formType: 'ITR-1' | 'ITR-2';
  multiHouse: boolean;
  foreignAssets: boolean;
  theme?: 'light' | 'dark';
  filingHistory: FilingHistoryItem[];
  isBackgroundProcessing: boolean;
  backgroundStatusMessage: string;
  backgroundProgress: number;
  uploadedFiles: UploadedFile[];
  ingestionState: 'IDLE' | 'UPLOADING' | 'OCR' | 'EXTRACTING' | 'VERIFYING' | 'GENERATING_RETURN' | 'COMPLETED';
  incognito: boolean;
  isFloatingAIChatOpen: boolean;

  taxProfiles: TaxProfile[];
  activeProfileId: string;
  switchProfile: (profileId: string) => void;
  addTaxProfile: (profile: TaxProfile) => void;

  isPrivacyBlurred: boolean;
  togglePrivacyBlur: () => void;

  
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (id: string) => void;
  updateUploadedFile: (id: string, name: string) => void;
  clearUploadedFiles: () => void;
  setIngestionState: (val: 'IDLE' | 'UPLOADING' | 'OCR' | 'EXTRACTING' | 'VERIFYING' | 'GENERATING_RETURN' | 'COMPLETED') => void;
  
  setIncomeProfile: (profile: Partial<IncomeProfile>) => void;
  updateDeduction: (key: keyof ConfirmedDeductions, value: number) => void;
  addChatMessage: (message: ChatMessageItem) => void;
  setStep: (step: CurrentStep) => void;
  setIsExtracting: (val: boolean) => void;
  setIsChatLoading: (val: boolean) => void;
  setFormType: (type: 'ITR-1' | 'ITR-2') => void;
  setMultiHouse: (val: boolean) => void;
  setForeignAssets: (val: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addFilingHistory: (item: FilingHistoryItem) => void;
  clearFilingHistory: () => void;
  clearSession: () => void;
  purgeSession: () => void;
  setIncognito: (val: boolean) => void;
  setIsFloatingAIChatOpen: (val: boolean) => void;
  setBackgroundProcessing: (val: boolean) => void;
  setBackgroundStatusMessage: (msg: string) => void;
  setBackgroundProgress: (pct: number) => void;
  rawForm16Text?: string;
  setRawForm16Text: (text: string) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  user: UserProfile | null;
  authMode: 'GUEST' | 'GOOGLE' | null;
  setUser: (user: UserProfile | null) => void;
  setAuthMode: (mode: 'GUEST' | 'GOOGLE' | null) => void;
}

const defaultIncomeProfile: IncomeProfile = isDev ? {
  grossSalary: 850000,
  tdsDeducted: 15000,
  basicSalary: 340000,
  hraReceived: 100000,
  standardDeduction: 75000, // standard default under AY 2026-27 rules
  otherIncome: 12000,
  employerName: 'Acme Corp Technologies',
  employeeName: 'Mohit Kumar',
  pan: 'MK*****32F',
  pfContribution: 40800,
  stcg: 0,
  ltcg: 0,
} : {
  grossSalary: 0,
  tdsDeducted: 0,
  basicSalary: 0,
  hraReceived: 0,
  standardDeduction: 75000,
  otherIncome: 0,
  employerName: '',
  employeeName: '',
  pan: '',
  pfContribution: 0,
  stcg: 0,
  ltcg: 0,
};

const defaultConfirmedDeductions: ConfirmedDeductions = {
  '80C': 0,
  '80D': 0,
  'HRA exemption': 0,
  '80CCD(1B)': 0,
  '80CCD(2)': 0,
  '80DD': 0,
  '80U': 0,
  '80DDB': 0,
  '80E': 0,
  '80EEA': 0,
  '80GG': 0,
  '80TTA': 0,
  '80TTB': 0,
  '80G': 0,
  '80CCH': 0,
  'section24bLetOut': 0,
  section24b: 0,
  hraExemption: 0,
};

const defaultChatHistory: ChatMessageItem[] = [
  {
    role: 'assistant',
    content: `Namaste! Welcome to **TaxSense: The ITR Filing Copilot**. 🇮🇳 
      
I am your interactive companion designed to help salaried individuals file their taxes easily for **Assessment Year 2026-27** (Financial Year 2025-26). 

We have upgraded our platform to route you through either **ITR-1 (Salaried Income)** or **ITR-2 (Capital Gains & Investments)** workflows depending on your financial portfolio.

Here is how you can use me:
1. **Interactive Calculators**: Adjust your salary, exemptions, and 80C/80D investments in the left panel to see real-time tax liabilities for both the **Old** and **New** tax regimes.
2. **Form 16 Extraction**: Upload a Form 16 text document using the 📎 paperclip below, or click one of the **Sample Form 16** buttons (e.g. ₹8.5L or ₹14.8L) in the header to let Gemini analyze and extract your salary variables!
3. **Portfolio Sync / Statement Upload**: Sync your broker data or upload stock transactions. The moment Capital Gains are detected, we'll automatically upgrade your session to **ITR-2**.
4. **Conversational Copilot**: Ask me questions about deductions, rent receipts, standard deductions, or request a step-by-step walkthrough of your tax liability.

I have preloaded a typical salaried profile to start. How can I help you save tax today?`
  }
];

const demoTaxProfiles: TaxProfile[] = [
  {
    id: 'self',
    name: 'Mohit Kumar',
    relation: 'Self',
    pan: 'MK*****32F',
    incomeProfile: defaultIncomeProfile,
    confirmedDeductions: defaultConfirmedDeductions,
    uploadedFiles: defaultUploadedFiles
  },
  {
    id: 'spouse',
    name: 'Priya Sharma',
    relation: 'Spouse',
    pan: 'PS*****88A',
    incomeProfile: {
      grossSalary: 1250000,
      basicSalary: 500000,
      hraReceived: 180000,
      standardDeduction: 75000,
      otherIncome: 25000,
      employerName: 'Global Finance Corp',
      employeeName: 'Priya Sharma',
      pan: 'PS*****88A',
      pfContribution: 60000,
      tdsDeducted: 45000
    },
    confirmedDeductions: {
      ...defaultConfirmedDeductions,
      '80C': 150000,
      '80D': 25000,
      'HRA exemption': 120000
    },
    uploadedFiles: []
  },
  {
    id: 'parent',
    name: 'Rajesh Kumar',
    relation: 'Parent',
    pan: 'RK*****12P',
    incomeProfile: {
      grossSalary: 550000,
      basicSalary: 220000,
      hraReceived: 0,
      standardDeduction: 75000,
      otherIncome: 120000,
      employerName: 'Senior Citizen Pension & Interest',
      employeeName: 'Rajesh Kumar',
      pan: 'RK*****12P',
      pfContribution: 0,
      tdsDeducted: 10000
    },
    confirmedDeductions: {
      ...defaultConfirmedDeductions,
      '80D': 50000,
      '80TTB': 50000
    },
    uploadedFiles: []
  }
];

// Production guests get a single, genuinely empty profile — no name, no PAN,
// no pre-filled family members. The richer cast above only appears locally
// or when explicitly requested via ?demo=true, so a real visitor never opens
// a "temporary, private" session and finds someone else's data in it.
const emptyTaxProfiles: TaxProfile[] = [
  {
    id: 'self',
    name: '',
    relation: 'Self',
    pan: '',
    incomeProfile: defaultIncomeProfile,
    confirmedDeductions: defaultConfirmedDeductions,
    uploadedFiles: defaultUploadedFiles
  }
];

const defaultTaxProfiles: TaxProfile[] = isDev ? demoTaxProfiles : emptyTaxProfiles;

export const useTaxStore = create<TaxStoreState>()(
  persist(
    (set) => ({
      taxProfiles: defaultTaxProfiles,
      activeProfileId: 'self',

      switchProfile: (profileId) =>
        set((state) => {
          const target = state.taxProfiles.find((p) => p.id === profileId);
          if (!target) return state;

          // Sync current active profile state back into taxProfiles array
          const updatedProfiles = state.taxProfiles.map((p) => {
            if (p.id === state.activeProfileId) {
              return {
                ...p,
                incomeProfile: state.incomeProfile,
                confirmedDeductions: state.confirmedDeductions,
                uploadedFiles: state.uploadedFiles,
              };
            }
            return p;
          });

          return {
            taxProfiles: updatedProfiles,
            activeProfileId: profileId,
            incomeProfile: target.incomeProfile,
            confirmedDeductions: target.confirmedDeductions,
            uploadedFiles: target.uploadedFiles,
          };
        }),

      addTaxProfile: (newProfile) =>
        set((state) => ({
          taxProfiles: [...state.taxProfiles, newProfile],
          activeProfileId: newProfile.id,
          incomeProfile: newProfile.incomeProfile,
          confirmedDeductions: newProfile.confirmedDeductions,
          uploadedFiles: newProfile.uploadedFiles,
        })),

      isPrivacyBlurred: false,
      togglePrivacyBlur: () => set((state) => ({ isPrivacyBlurred: !state.isPrivacyBlurred })),

      incomeProfile: defaultIncomeProfile,
      confirmedDeductions: defaultConfirmedDeductions,
      chatHistory: defaultChatHistory,
      currentStep: 'HOME',
      isExtracting: false,
      isChatLoading: false,
      formType: 'ITR-1',
      multiHouse: false,
      foreignAssets: false,
      theme: 'light',
      filingHistory: [],
      isBackgroundProcessing: false,
      backgroundStatusMessage: '',
      backgroundProgress: 0,
      uploadedFiles: defaultUploadedFiles,
      ingestionState: 'IDLE',
      incognito: typeof window !== 'undefined' ? sessionStorage.getItem('taxsense_incognito') === 'true' : false,
      isFloatingAIChatOpen: false,
      rawForm16Text: '',
      setRawForm16Text: (text) => set({ rawForm16Text: text }),
      activeStep: 2,
      setActiveStep: (step) => {
        const stepMap: Record<number, CurrentStep> = {
          2: 'LANDING',
          3: 'LANDING',
          4: 'CONFIRM_EXTRACTION',
          5: 'CHAT_QA',
          6: 'FINAL_EXPORT',
          10: 'FINAL_EXPORT',
          11: 'LANDING'
        };
        const currentStep = stepMap[step] || 'LANDING';
        set({ activeStep: step, currentStep });
      },
      user: null,
      authMode: null,
      setUser: (user) => set({ user }),
      setAuthMode: (mode) => set({ authMode: mode }),

      setIncomeProfile: (profile) =>
        set((state) => {
          // Sanitize numerical inputs to ensure no negatives or NaN
          const sanitizedProfile = { ...profile };
          for (const key in sanitizedProfile) {
            if (typeof sanitizedProfile[key as keyof typeof sanitizedProfile] === 'number') {
              sanitizedProfile[key as keyof typeof sanitizedProfile] = Math.max(0, Number(sanitizedProfile[key as keyof typeof sanitizedProfile]) || 0) as never;
            }
          }

          const updatedProfile = { ...state.incomeProfile, ...sanitizedProfile };
          const hasCapitalGains = (updatedProfile.stcg && updatedProfile.stcg > 0) || (updatedProfile.ltcg && updatedProfile.ltcg > 0);
          const isHighSalary = updatedProfile.grossSalary > 5000000;
          const needsITR2 = hasCapitalGains || isHighSalary || state.multiHouse || state.foreignAssets;
          return {
            incomeProfile: updatedProfile,
            formType: needsITR2 ? 'ITR-2' : 'ITR-1',
          };
        }),

      updateDeduction: (key, value) =>
        set((state) => {
          // Validation caps
          let sanitizedValue = Math.max(0, Number(value) || 0);
          
          if (key === '80C') sanitizedValue = Math.min(sanitizedValue, 150000);
          if (key === '80D') sanitizedValue = Math.min(sanitizedValue, 75000);
          if (key === '80CCD(1B)') sanitizedValue = Math.min(sanitizedValue, 50000);
          if (key === '80TTA') sanitizedValue = Math.min(sanitizedValue, 10000);
          if (key === '80TTB') sanitizedValue = Math.min(sanitizedValue, 50000);
          if (key === 'section24b') sanitizedValue = Math.min(sanitizedValue, 200000);
          
          const updatedDeductions = { ...state.confirmedDeductions, [key]: sanitizedValue };
          // Keep HRA exemption fallback in sync if applicable
          if (key === 'HRA exemption') {
            updatedDeductions.hraExemption = sanitizedValue;
          } else if (key === 'hraExemption') {
            updatedDeductions['HRA exemption'] = sanitizedValue;
          }
          return { confirmedDeductions: updatedDeductions };
        }),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...(state.chatHistory || []), message],
        })),

      setStep: (step) =>
        set({ currentStep: step }),

      setIsExtracting: (val) =>
        set({ isExtracting: val }),

      setIsChatLoading: (val) =>
        set({ isChatLoading: val }),

      setBackgroundProcessing: (val) =>
        set({ isBackgroundProcessing: val }),

      setBackgroundStatusMessage: (msg) =>
        set({ backgroundStatusMessage: msg }),

      setBackgroundProgress: (pct) =>
        set({ backgroundProgress: pct }),

      setIngestionState: (val) =>
        set({ ingestionState: val }),

      addUploadedFile: (file) =>
        set((state) => ({
          uploadedFiles: [file, ...(state.uploadedFiles || [])]
        })),

      removeUploadedFile: (id) =>
        set((state) => ({
          uploadedFiles: (state.uploadedFiles || []).filter((f) => f.id !== id)
        })),

      updateUploadedFile: (id, name) =>
        set((state) => ({
          uploadedFiles: (state.uploadedFiles || []).map((f) => f.id === id ? { ...f, name } : f)
        })),

      clearUploadedFiles: () =>
        set({ uploadedFiles: [], ingestionState: 'IDLE' }),

      setFormType: (type) =>
        set({ formType: type }),

      setMultiHouse: (val) =>
        set((state) => {
          const hasCapitalGains = (state.incomeProfile.stcg && state.incomeProfile.stcg > 0) || (state.incomeProfile.ltcg && state.incomeProfile.ltcg > 0);
          const isHighSalary = state.incomeProfile.grossSalary > 5000000;
          const needsITR2 = hasCapitalGains || isHighSalary || val || state.foreignAssets;
          return {
            multiHouse: val,
            formType: needsITR2 ? 'ITR-2' : 'ITR-1',
          };
        }),

      setForeignAssets: (val) =>
        set((state) => {
          const hasCapitalGains = (state.incomeProfile.stcg && state.incomeProfile.stcg > 0) || (state.incomeProfile.ltcg && state.incomeProfile.ltcg > 0);
          const isHighSalary = state.incomeProfile.grossSalary > 5000000;
          const needsITR2 = hasCapitalGains || isHighSalary || state.multiHouse || val;
          return {
            foreignAssets: val,
            formType: needsITR2 ? 'ITR-2' : 'ITR-1',
          };
        }),

      setTheme: (theme) =>
        set({ theme }),

      addFilingHistory: (item) =>
        set((state) => ({
          filingHistory: [...(state.filingHistory || []), item],
        })),

      clearFilingHistory: () =>
        set({ filingHistory: [] }),
        
      setIncognito: (val) => {
        if (typeof window !== 'undefined') {
          if (val) {
            sessionStorage.setItem('taxsense_incognito', 'true');
            localStorage.removeItem('taxsense_session_cache');
          } else {
            sessionStorage.removeItem('taxsense_incognito');
          }
        }
        set({ incognito: val });
      },
      
      setIsFloatingAIChatOpen: (val) => {
        set({ isFloatingAIChatOpen: val });
      },
      
      purgeSession: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('taxsense_session_cache');
          sessionStorage.removeItem('taxsense_incognito');
        }
        set((state) => ({
          incomeProfile: defaultIncomeProfile,
          confirmedDeductions: defaultConfirmedDeductions,
          chatHistory: defaultChatHistory,
          currentStep: 'HOME',
          activeStep: 2,
          isExtracting: false,
          isChatLoading: false,
          formType: 'ITR-1',
          multiHouse: false,
          foreignAssets: false,
          theme: 'light',
          uploadedFiles: [],
          ingestionState: 'IDLE',
          isBackgroundProcessing: false,
          backgroundProgress: 0,
          backgroundStatusMessage: '',
          incognito: false,
          isFloatingAIChatOpen: false,
          rawForm16Text: '',
          user: null,
          authMode: null,
        }));
      },

      clearSession: () => {
        // Clear from localStorage explicitly
        if (typeof window !== 'undefined') {
          localStorage.removeItem('taxsense_session_cache');
        }
        // Reset state (preserves history)
        set((state) => ({
          incomeProfile: defaultIncomeProfile,
          confirmedDeductions: defaultConfirmedDeductions,
          chatHistory: defaultChatHistory,
          currentStep: 'HOME',
          activeStep: 2,
          isExtracting: false,
          isChatLoading: false,
          formType: 'ITR-1',
          multiHouse: false,
          foreignAssets: false,
          theme: 'light',
          uploadedFiles: [],
          ingestionState: 'IDLE',
          isFloatingAIChatOpen: false,
          rawForm16Text: '',
          user: null,
          authMode: null,
        }));
      },
    }),
    {
      name: 'taxsense_session_cache',
      storage: createJSONStorage(() => secureStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
      partialize: (state) => ({
        incomeProfile: state.incomeProfile,
        confirmedDeductions: state.confirmedDeductions,
        currentStep: state.currentStep,
        activeStep: state.activeStep,
        formType: state.formType,
        multiHouse: state.multiHouse,
        foreignAssets: state.foreignAssets,
        theme: state.theme,
        filingHistory: state.filingHistory,
        uploadedFiles: state.uploadedFiles,
        ingestionState: state.ingestionState,
        chatHistory: state.chatHistory,
        rawForm16Text: state.rawForm16Text,
        user: state.user,
        authMode: state.authMode,
      }),
    }
  )
);
