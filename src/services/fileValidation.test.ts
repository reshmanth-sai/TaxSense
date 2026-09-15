import { describe, it, expect } from 'vitest';

// Testable mirror of validateFileSignature logic used in api/extract-pdf.ts
function validateFileSignature(base64Data: string, mimeType: string): boolean {
  try {
    const prefixBuffer = Buffer.from(base64Data.slice(0, 64), 'base64');
    if (prefixBuffer.length < 4) return false;

    if (mimeType === 'application/pdf') {
      return prefixBuffer.subarray(0, 4).toString('ascii') === '%PDF';
    }
    if (mimeType === 'image/png') {
      return (
        prefixBuffer[0] === 0x89 &&
        prefixBuffer[1] === 0x50 &&
        prefixBuffer[2] === 0x4e &&
        prefixBuffer[3] === 0x47
      );
    }
    if (mimeType === 'image/jpeg') {
      return prefixBuffer[0] === 0xff && prefixBuffer[1] === 0xd8 && prefixBuffer[2] === 0xff;
    }
    if (mimeType === 'image/webp') {
      return (
        prefixBuffer.length >= 12 &&
        prefixBuffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        prefixBuffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }
    return false;
  } catch {
    return false;
  }
}

describe('File Signature Security Validation', () => {
  it('accepts valid PDF magic bytes (%PDF-)', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7 header content here');
    const base64 = validPdfBuffer.toString('base64');
    expect(validateFileSignature(base64, 'application/pdf')).toBe(true);
  });

  it('rejects spoofed text file masquerading as PDF', () => {
    const fakePdf = Buffer.from('This is just plain text masquerading as a PDF');
    const base64 = fakePdf.toString('base64');
    expect(validateFileSignature(base64, 'application/pdf')).toBe(false);
  });

  it('accepts valid PNG magic bytes', () => {
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const base64 = validPng.toString('base64');
    expect(validateFileSignature(base64, 'image/png')).toBe(true);
  });

  it('accepts valid JPEG magic bytes', () => {
    const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const base64 = validJpg.toString('base64');
    expect(validateFileSignature(base64, 'image/jpeg')).toBe(true);
  });

  it('accepts valid WebP magic bytes', () => {
    const validWebp = Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ');
    const base64 = validWebp.toString('base64');
    expect(validateFileSignature(base64, 'image/webp')).toBe(true);
  });

  it('rejects payload if mimeType does not match signature', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7 header content here');
    const base64 = validPdfBuffer.toString('base64');
    // PDF signature submitted with image/png declared MIME
    expect(validateFileSignature(base64, 'image/png')).toBe(false);
  });

  it('rejects empty or truncated buffers', () => {
    expect(validateFileSignature('', 'application/pdf')).toBe(false);
    expect(validateFileSignature('AA==', 'application/pdf')).toBe(false);
  });
});
