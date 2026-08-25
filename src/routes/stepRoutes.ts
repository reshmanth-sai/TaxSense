import type { CurrentStep } from '../store/useTaxStore';

// The complete, verified set of activeStep targets in the app -- see
// Global Constraints in the routing-migration plan for how this list was
// confirmed exhaustive (grep of every setActiveStep(N)/onNavigateStep(N)
// call site in src/).
interface StepRoute {
  activeStep: number;
  currentStep: CurrentStep;
  path: string;
}

export const HOME_PATH = '/';

const STEP_ROUTES: StepRoute[] = [
  { activeStep: 2, currentStep: 'LANDING', path: '/start' },
  { activeStep: 3, currentStep: 'LANDING', path: '/vault' },
  { activeStep: 4, currentStep: 'CONFIRM_EXTRACTION', path: '/audit' },
  { activeStep: 5, currentStep: 'CHAT_QA', path: '/recommendations' },
  { activeStep: 6, currentStep: 'FINAL_EXPORT', path: '/filing' },
  { activeStep: 10, currentStep: 'FINAL_EXPORT', path: '/history' },
  { activeStep: 11, currentStep: 'LANDING', path: '/dashboard' },
];

export function pathForStep(activeStep: number): string {
  const route = STEP_ROUTES.find((r) => r.activeStep === activeStep);
  return route ? route.path : HOME_PATH;
}

export function stepForPath(pathname: string): { activeStep: number; currentStep: CurrentStep } | null {
  if (pathname === HOME_PATH) {
    return null; // caller treats HOME specially -- see Task 3
  }
  const route = STEP_ROUTES.find((r) => r.path === pathname);
  if (!route) return null;
  return { activeStep: route.activeStep, currentStep: route.currentStep };
}
