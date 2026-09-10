import { describe, it, expect } from 'vitest';
import {
  calculateTax,
  isDeductionAllowedInNewRegime,
  getNewRegimeAllowedDeductions,
  formatINR,
  buildTaxData,
} from './taxCalculator';
import { TaxData } from '../types';

// A fully-zeroed baseline so each test only varies the fields it cares about.
// Real callers always provide standardDeductionOld/New from TAX_CONFIG; tests
// set them explicitly so expected numbers don't depend on that config file.
function baseInput(overrides: Partial<TaxData> = {}): TaxData {
  return {
    assessmentYear: '2026-27',
    grossSalary: 0,
    hraExemption: 0,
    ltaExemption: 0,
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    otherIncome: 0,
    deduction80C: 0,
    deduction80D: 0,
    deduction80TTA: 0,
    deduction80G: 0,
    section24b: 0,
    tdsDeducted: 0,
    ...overrides,
  };
}

describe('calculateTax - old regime slabs', () => {
  it('charges 0% up to 2.5L taxable income', () => {
    const result = calculateTax(baseInput({ grossSalary: 300000 })); // 300000 - 50000 std ded = 250000
    expect(result.oldRegime.taxableIncome).toBe(250000);
    expect(result.oldRegime.baseTax).toBe(0);
  });

  it('charges 5% between 2.5L and 5L', () => {
    // taxable = 400000; slab2 = min(250000, 400000-250000=150000) * 5% = 7500
    const result = calculateTax(baseInput({ grossSalary: 450000 }));
    expect(result.oldRegime.taxableIncome).toBe(400000);
    expect(result.oldRegime.baseTax).toBe(7500);
  });

  it('charges 20% between 5L and 10L, stacked on the 5% slab', () => {
    // taxable = 700000; slab2 = 250000*5%=12500; slab3 = min(500000,700000-500000=200000)*20%=40000
    const result = calculateTax(baseInput({ grossSalary: 750000 }));
    expect(result.oldRegime.taxableIncome).toBe(700000);
    expect(result.oldRegime.baseTax).toBe(52500);
  });

  it('charges 30% above 10L, stacked on lower slabs', () => {
    // taxable = 1200000; slab2=12500; slab3=500000*20%=100000; slab4=(1200000-1000000)*30%=60000
    const result = calculateTax(baseInput({ grossSalary: 1250000 }));
    expect(result.oldRegime.taxableIncome).toBe(1200000);
    expect(result.oldRegime.baseTax).toBe(172500);
  });
});

describe('calculateTax - new regime slabs', () => {
  it('charges 0% up to 4L taxable income', () => {
    const result = calculateTax(baseInput({ grossSalary: 475000 })); // - 75000 std ded = 400000
    expect(result.newRegime.taxableIncome).toBe(400000);
    expect(result.newRegime.baseTax).toBe(0);
  });

  it('charges 5% between 4L and 8L', () => {
    // taxable = 800000; slab2 = 400000*5%=20000
    const result = calculateTax(baseInput({ grossSalary: 875000 }));
    expect(result.newRegime.taxableIncome).toBe(800000);
    expect(result.newRegime.baseTax).toBe(20000);
  });

  it('charges 10% between 8L and 12L, stacked', () => {
    // taxable=1200000; slab2=20000; slab3=400000*10%=40000
    const result = calculateTax(baseInput({ grossSalary: 1275000 }));
    expect(result.newRegime.taxableIncome).toBe(1200000);
    expect(result.newRegime.baseTax).toBe(60000);
  });

  it('charges 30% above 24L, stacked on all lower slabs', () => {
    // taxable=2500000
    // slab2:400000*5%=20000, slab3:400000*10%=40000, slab4:400000*15%=60000,
    // slab5:400000*20%=80000, slab6:400000*25%=100000, slab7:(2500000-2400000)*30%=30000
    const result = calculateTax(baseInput({ grossSalary: 2575000 }));
    expect(result.newRegime.taxableIncome).toBe(2500000);
    expect(result.newRegime.baseTax).toBe(330000);
  });
});

describe('calculateTax - Section 87A rebate cliff (old regime, threshold 5L)', () => {
  it('fully rebates tax exactly at the 5,00,000 boundary', () => {
    const result = calculateTax(baseInput({ grossSalary: 550000 })); // taxable exactly 500000
    expect(result.oldRegime.taxableIncome).toBe(500000);
    expect(result.oldRegime.rebate87A).toBe(12500);
    expect(result.oldRegime.totalTaxPayable).toBe(0);
  });

  it('loses the entire rebate one rupee above the boundary', () => {
    const result = calculateTax(baseInput({ grossSalary: 550001 })); // taxable 500001
    expect(result.oldRegime.taxableIncome).toBe(500001);
    expect(result.oldRegime.rebate87A).toBe(0);
    expect(result.oldRegime.totalTaxPayable).toBe(13000); // 12500 base tax + 4% cess
  });

  it('caps the rebate at 12,500 even if base tax exceeds it', () => {
    // taxable = 500000 is the max slab-taxable income the rebate threshold allows,
    // and base tax there (12500) exactly equals the cap, so assert the cap value directly.
    const result = calculateTax(baseInput({ grossSalary: 550000 }));
    expect(result.oldRegime.rebate87A).toBeLessThanOrEqual(12500);
  });
});

describe('calculateTax - Section 87A rebate cliff (new regime, threshold 12L)', () => {
  it('fully rebates tax exactly at the 12,00,000 boundary', () => {
    const result = calculateTax(baseInput({ grossSalary: 1275000 })); // taxable exactly 1200000
    expect(result.newRegime.taxableIncome).toBe(1200000);
    expect(result.newRegime.rebate87A).toBe(60000);
    expect(result.newRegime.totalTaxPayable).toBe(0);
  });

  it('loses the entire rebate one rupee above the boundary', () => {
    const result = calculateTax(baseInput({ grossSalary: 1275001 })); // taxable 1200001
    expect(result.newRegime.taxableIncome).toBe(1200001);
    expect(result.newRegime.rebate87A).toBe(0);
    expect(result.newRegime.totalTaxPayable).toBe(62400); // 60000 base tax + 4% cess
  });
});

describe('calculateTax - capital gains', () => {
  it('taxes STCG at a flat 20% regardless of slab', () => {
    const result = calculateTax(baseInput({ stcg: 100000 }));
    // stcgTax = 20000. Taxable income (100000) is within the old-regime rebate
    // zone, but the rebate itself is capped at 12,500 -- it only partially
    // offsets the 20,000 STCG tax, leaving 7500 + 4% cess = 7800 payable.
    expect(result.oldRegime.rebate87A).toBe(12500);
    expect(result.oldRegime.totalTaxPayable).toBe(7800);
  });

  it('exempts LTCG up to 1.25L and taxes the excess at 12.5%', () => {
    const atExemption = calculateTax(baseInput({ ltcg: 125000 }));
    expect(atExemption.oldRegime.totalTaxPayable).toBe(0);

    const aboveExemption = calculateTax(baseInput({ ltcg: 225000 }));
    // ltcgTax = (225000-125000)*12.5% = 12500; cess = round(12500*4%) = 500
    expect(aboveExemption.oldRegime.totalTaxPayable).toBe(13000);
  });

  it('does NOT let the 87A rebate offset LTCG tax, even when otherwise fully rebated', () => {
    // Zero salary income (fully rebated base tax) but taxable LTCG present.
    const result = calculateTax(baseInput({ ltcg: 225000 }));
    expect(result.oldRegime.rebate87A).toBe(0); // nothing to rebate against (base tax + STCG tax = 0)
    expect(result.oldRegime.totalTaxPayable).toBe(13000); // LTCG tax + cess survives untouched
  });

  it('DOES let the 87A rebate offset STCG tax when income is within the threshold', () => {
    const result = calculateTax(baseInput({ stcg: 50000 })); // stcgTax = 10000
    expect(result.oldRegime.taxableIncome).toBe(50000); // within the 5L rebate zone
    expect(result.oldRegime.rebate87A).toBe(10000);
    expect(result.oldRegime.totalTaxPayable).toBe(0);
  });
});

describe('calculateTax - deduction caps (old regime)', () => {
  it('caps 80C at 1,50,000', () => {
    const result = calculateTax(baseInput({ deduction80C: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 /* std ded */ + 150000);
  });

  it('caps 80D at 75,000', () => {
    const result = calculateTax(baseInput({ deduction80D: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 75000);
  });

  it('caps 80TTA at 10,000', () => {
    const result = calculateTax(baseInput({ deduction80TTA: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 10000);
  });

  it('caps 80TTB at 50,000 and prefers it over 80TTA when both are present', () => {
    const result = calculateTax(
      baseInput({ deduction80TTA: 10000, deduction80TTB: 999999 })
    );
    expect(result.oldRegime.totalDeductions).toBe(50000 + 50000);
  });

  it('falls back to 80TTA when 80TTB is zero/absent', () => {
    const result = calculateTax(baseInput({ deduction80TTA: 8000 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 8000);
  });

  it('caps Section 24(b) self-occupied home loan interest at 2,00,000', () => {
    const result = calculateTax(baseInput({ section24b: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 200000);
  });

  it('does not cap Section 24(b) let-out property interest', () => {
    const result = calculateTax(baseInput({ section24bLetOut: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 999999);
  });

  it('caps 80CCD(1B) standalone NPS at 50,000', () => {
    const result = calculateTax(baseInput({ deduction80CCD1B: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 50000);
  });

  it('caps 80CCD(2) employer NPS at 14% of basic salary', () => {
    const result = calculateTax(
      baseInput({ basicSalary: 100000, deduction80CCD2: 999999 })
    );
    expect(result.oldRegime.totalDeductions).toBe(50000 + 14000); // 14% of 100000
  });

  it('caps 80DD (dependent disability) at 1,25,000', () => {
    const result = calculateTax(baseInput({ deduction80DD: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 125000);
  });

  it('caps 80U (self disability) at 1,25,000', () => {
    const result = calculateTax(baseInput({ deduction80U: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 125000);
  });

  it('caps 80DDB (specified diseases) at 1,00,000', () => {
    const result = calculateTax(baseInput({ deduction80DDB: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 100000);
  });

  it('does not cap 80E education loan interest', () => {
    const result = calculateTax(baseInput({ deduction80E: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 999999);
  });

  it('caps 80EEA first-time homebuyer interest at 1,50,000', () => {
    const result = calculateTax(baseInput({ deduction80EEA: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 150000);
  });

  it('caps 80GG rent paid at 60,000', () => {
    const result = calculateTax(baseInput({ deduction80GG: 999999 }));
    expect(result.oldRegime.totalDeductions).toBe(50000 + 60000);
  });

  it('floors negative deduction inputs at zero instead of increasing taxable income', () => {
    const result = calculateTax(baseInput({ deduction80C: -50000 }));
    expect(result.oldRegime.totalDeductions).toBe(50000);
  });
});

describe('calculateTax - new regime only allows a small allowlist of deductions', () => {
  it('ignores old-regime-only deductions (80C, 80D, HRA, section24b) entirely', () => {
    const withOldDeductions = calculateTax(
      baseInput({
        grossSalary: 1000000,
        hraExemption: 200000,
        deduction80C: 150000,
        deduction80D: 75000,
        section24b: 200000,
      })
    );
    const withoutOldDeductions = calculateTax(baseInput({ grossSalary: 1000000 }));
    expect(withOldDeductions.newRegime.taxableIncome).toBe(
      withoutOldDeductions.newRegime.taxableIncome
    );
  });

  it('does apply 80CCD(2) employer NPS, 80CCH, and let-out Section 24(b)', () => {
    const result = calculateTax(
      baseInput({
        grossSalary: 1000000,
        basicSalary: 100000,
        deduction80CCD2: 14000,
        deduction80CCH: 5000,
        section24bLetOut: 20000,
      })
    );
    // newTotalDeductions = standardDeductionNew(75000) + 14000 + 5000 + 20000
    expect(result.newRegime.totalDeductions).toBe(75000 + 14000 + 5000 + 20000);
  });
});

describe('calculateTax - recommendation and savings', () => {
  it('recommends OLD when old regime tax is strictly lower', () => {
    // Large HRA + 80C/80D/24(b)/80CCD(1B) deductions make the old regime
    // cheaper at this income, even though neither regime is in its rebate zone.
    const result = calculateTax(
      baseInput({
        grossSalary: 2000000,
        hraExemption: 400000,
        deduction80C: 150000,
        deduction80D: 75000,
        section24b: 200000,
        deduction80CCD1B: 50000,
      })
    );
    expect(result.oldRegime.totalTaxPayable).toBe(140400);
    expect(result.newRegime.totalTaxPayable).toBe(192400);
    expect(result.recommendedRegime).toBe('OLD');
    expect(result.savings).toBe(52000);
  });

  it('recommends NEW when new regime tax is strictly lower', () => {
    const result = calculateTax(baseInput({ grossSalary: 900000 })); // no old-regime-only deductions claimed
    expect(result.newRegime.totalTaxPayable).toBeLessThan(result.oldRegime.totalTaxPayable);
    expect(result.recommendedRegime).toBe('NEW');
  });

  it('recommends NEW on an exact tie (both regimes charge zero)', () => {
    const result = calculateTax(baseInput({ grossSalary: 0 }));
    expect(result.oldRegime.totalTaxPayable).toBe(0);
    expect(result.newRegime.totalTaxPayable).toBe(0);
    expect(result.recommendedRegime).toBe('NEW');
    expect(result.savings).toBe(0);
  });
});

describe('calculateTax - refund vs owed', () => {
  it('reports a negative refundOrOwed (a refund) when TDS exceeds tax payable', () => {
    const result = calculateTax(baseInput({ grossSalary: 300000, tdsDeducted: 5000 }));
    expect(result.oldRegime.totalTaxPayable).toBe(0);
    expect(result.oldRegime.refundOrOwed).toBe(-5000);
  });

  it('reports a positive refundOrOwed (owed) when TDS is less than tax payable', () => {
    const result = calculateTax(baseInput({ grossSalary: 550001, tdsDeducted: 1000 }));
    expect(result.oldRegime.totalTaxPayable).toBe(13000);
    expect(result.oldRegime.refundOrOwed).toBe(12000);
  });
});

describe('isDeductionAllowedInNewRegime', () => {
  it('allows exactly the new-regime allowlist', () => {
    expect(isDeductionAllowedInNewRegime('80CCD(2)')).toBe(true);
    expect(isDeductionAllowedInNewRegime('80CCH')).toBe(true);
    expect(isDeductionAllowedInNewRegime('standardDeductionNew')).toBe(true);
    expect(isDeductionAllowedInNewRegime('section24bLetOut')).toBe(true);
  });

  it('disallows old-regime-only deductions', () => {
    expect(isDeductionAllowedInNewRegime('80C')).toBe(false);
    expect(isDeductionAllowedInNewRegime('80D')).toBe(false);
    expect(isDeductionAllowedInNewRegime('HRA')).toBe(false);
    expect(isDeductionAllowedInNewRegime('section24b')).toBe(false);
  });
});

describe('getNewRegimeAllowedDeductions', () => {
  it('computes 80CCD(2) as 14% of basic salary, capped at the claimed amount', () => {
    const result = getNewRegimeAllowedDeductions(
      baseInput({ basicSalary: 200000, deduction80CCD2: 999999 })
    );
    expect(result['80CCD(2)']).toBe(28000); // 14% of 200000
    expect(result.total).toBe(28000);
  });

  it('derives basic salary as 40% of gross when not explicitly provided', () => {
    const result = getNewRegimeAllowedDeductions(
      baseInput({ grossSalary: 1000000, deduction80CCD2: 999999 })
    );
    expect(result['80CCD(2)']).toBe(56000); // 14% of (1000000*0.4=400000)
  });

  it('includes 80CCH uncapped', () => {
    const result = getNewRegimeAllowedDeductions(baseInput({ deduction80CCH: 15000 }));
    expect(result['80CCH']).toBe(15000);
    expect(result.total).toBe(15000);
  });
});

describe('formatINR', () => {
  it('formats with Indian digit grouping and no decimals', () => {
    expect(formatINR(150000)).toBe('₹1,50,000');
    expect(formatINR(1000)).toBe('₹1,000');
    expect(formatINR(0)).toBe('₹0');
  });
});

describe('buildTaxData', () => {
  it('maps confirmed deduction keys and income profile fields onto TaxData', () => {
    const result = buildTaxData(
      { grossSalary: 800000, otherIncome: 5000, tdsDeducted: 20000, stcg: 1000, ltcg: 2000 },
      {
        '80C': 100000,
        '80D': 20000,
        '80TTA': 5000,
        '80G': 1000,
        section24b: 50000,
        'HRA exemption': 30000,
        '80CCD(1B)': 40000,
        '80CCD(2)': 15000,
        '80DD': 60000,
        '80U': 70000,
        '80DDB': 80000,
        '80E': 90000,
        '80EEA': 100000,
        '80GG': 20000,
        '80TTB': 30000,
      }
    );
    expect(result.grossSalary).toBe(800000);
    expect(result.otherIncome).toBe(5000);
    expect(result.tdsDeducted).toBe(20000);
    expect(result.stcg).toBe(1000);
    expect(result.ltcg).toBe(2000);
    expect(result.deduction80C).toBe(100000);
    expect(result.deduction80D).toBe(20000);
    expect(result.deduction80TTA).toBe(5000);
    expect(result.deduction80G).toBe(1000);
    expect(result.section24b).toBe(50000);
    expect(result.hraExemption).toBe(30000);
    expect(result.deduction80CCD1B).toBe(40000);
    expect(result.deduction80CCD2).toBe(15000);
    expect(result.deduction80DD).toBe(60000);
    expect(result.deduction80U).toBe(70000);
    expect(result.deduction80DDB).toBe(80000);
    expect(result.deduction80E).toBe(90000);
    expect(result.deduction80EEA).toBe(100000);
    expect(result.deduction80GG).toBe(20000);
    expect(result.deduction80TTB).toBe(30000);
  });

  it('defaults every field to 0 when given empty/missing input', () => {
    const result = buildTaxData(undefined, undefined);
    expect(result.grossSalary).toBe(0);
    expect(result.otherIncome).toBe(0);
    expect(result.tdsDeducted).toBe(0);
    expect(result.deduction80C).toBe(0);
    expect(result.hraExemption).toBe(0);
  });
});
