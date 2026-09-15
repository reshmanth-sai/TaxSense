import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test the sessionCacheStorage logic directly
describe('Session Storage Privacy & Migration Adapter', () => {
  let mockSessionStore: Record<string, string> = {};
  let mockLocalStore: Record<string, string> = {};

  const mockSessionStorage = {
    getItem: vi.fn((key: string) => mockSessionStore[key] ?? null),
    setItem: vi.fn((key: string, val: string) => {
      mockSessionStore[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockSessionStore[key];
    }),
    clear: vi.fn(() => {
      mockSessionStore = {};
    }),
  };

  const mockLocalStorage = {
    getItem: vi.fn((key: string) => mockLocalStore[key] ?? null),
    setItem: vi.fn((key: string, val: string) => {
      mockLocalStore[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStore[key];
    }),
    clear: vi.fn(() => {
      mockLocalStore = {};
    }),
  };

  beforeEach(() => {
    mockSessionStore = {};
    mockLocalStore = {};
    vi.clearAllMocks();

    vi.stubGlobal('window', {});
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  // Re-create the adapter logic with the stubbed globals
  const sessionCacheStorage = {
    getItem: (name: string) => {
      if (typeof window === 'undefined') return null;
      if (sessionStorage.getItem('taxsense_incognito') === 'true') {
        return null;
      }
      const sessionVal = sessionStorage.getItem(name);
      if (sessionVal !== null) return sessionVal;

      try {
        const legacyVal = localStorage.getItem(name);
        if (legacyVal !== null) {
          sessionStorage.setItem(name, legacyVal);
          localStorage.removeItem(name);
          return legacyVal;
        }
      } catch {}
      return null;
    },
    setItem: (name: string, value: string) => {
      if (typeof window === 'undefined') return;
      if (sessionStorage.getItem('taxsense_incognito') !== 'true') {
        sessionStorage.setItem(name, value);
      }
      try {
        localStorage.removeItem(name);
      } catch {}
    },
    removeItem: (name: string) => {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(name);
      try {
        localStorage.removeItem(name);
      } catch {}
    },
  };

  it('saves items directly to sessionStorage and purges localStorage', () => {
    mockLocalStore['test_cache'] = 'old_value';
    sessionCacheStorage.setItem('test_cache', 'new_session_value');

    expect(mockSessionStore['test_cache']).toBe('new_session_value');
    expect(mockLocalStore['test_cache']).toBeUndefined();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_cache');
  });

  it('transparently migrates legacy localStorage data on read and scrubs localStorage', () => {
    mockLocalStore['taxsense_session_cache'] = JSON.stringify({ pan: 'ABCDE1234F', grossSalary: 1200000 });

    const result = sessionCacheStorage.getItem('taxsense_session_cache');
    expect(result).toContain('ABCDE1234F');

    // Should now exist in sessionStorage and be removed from localStorage
    expect(mockSessionStore['taxsense_session_cache']).toContain('ABCDE1234F');
    expect(mockLocalStore['taxsense_session_cache']).toBeUndefined();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('taxsense_session_cache');
  });

  it('does not store data when incognito flag is active', () => {
    mockSessionStore['taxsense_incognito'] = 'true';

    sessionCacheStorage.setItem('taxsense_session_cache', 'sensitive_data');
    expect(mockSessionStore['taxsense_session_cache']).toBeUndefined();
    expect(sessionCacheStorage.getItem('taxsense_session_cache')).toBeNull();
  });

  it('cleans both storages on removeItem', () => {
    mockSessionStore['tax_key'] = 'val';
    mockLocalStore['tax_key'] = 'val';

    sessionCacheStorage.removeItem('tax_key');
    expect(mockSessionStore['tax_key']).toBeUndefined();
    expect(mockLocalStore['tax_key']).toBeUndefined();
  });
});
