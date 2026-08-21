export const TAX_CONFIG = {
  assessmentYear: '2026-27',
  financialYear: '2025-26',
  standardDeductionOld: 50000,
  standardDeductionNew: 75000,
} as const;

/**
 * Statutory dates for AY 2026-27, as local midnight at the end of each day.
 *
 * These drive the deadline banner. They are real dates, not display strings —
 * anything that shows a countdown must derive it from here so the UI cannot
 * claim a window is open after it has closed. Update both values (and re-check
 * for a CBDT extension notification) at the start of each assessment year.
 */
export const FILING_DEADLINES = {
  /** Sec 139(1) due date for individuals who do not require a tax audit. */
  dueDate: new Date(2026, 6, 31, 23, 59, 59),
  /** Sec 139(4) belated / Sec 139(5) revised return cut-off. */
  belatedCutoff: new Date(2026, 11, 31, 23, 59, 59),
  /** Sec 234F late filing fee, reduced for total income up to Rs 5 lakh. */
  lateFee: 5000,
  lateFeeReduced: 1000,
} as const;
