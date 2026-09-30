export const CPSE_LIST = [
  { code: 'ONGC', name: 'Oil and Natural Gas Corporation', sector: 'Petroleum' },
  { code: 'BHEL', name: 'Bharat Heavy Electricals Limited', sector: 'Heavy Engineering' },
  { code: 'NTPC', name: 'NTPC Limited', sector: 'Power' },
  { code: 'SAIL', name: 'Steel Authority of India Limited', sector: 'Steel' },
  { code: 'IOCL', name: 'Indian Oil Corporation Limited', sector: 'Petroleum' },
  { code: 'GAIL', name: 'GAIL (India) Limited', sector: 'Energy' },
  { code: 'CIL', name: 'Coal India Limited', sector: 'Mining' },
  { code: 'BPCL', name: 'Bharat Petroleum Corporation Limited', sector: 'Petroleum' },
] as const;

export const MATERIAL_CATEGORIES = [
  'Mechanical',
  'Electrical',
  'Instrumentation & Control',
  'Piping & Fittings',
  'Valves',
  'Civil & Structural',
  'Chemicals & Lubricants',
  'Safety & Fire Fighting',
  'Tools & Hardware'
] as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 85,
  MEDIUM: 65,
  LOW: 0
};

// Set VITE_API_URL to the backend origin (for example http://localhost:8080).
// Keep /api as a same-origin fallback for proxy-based deployments.
export const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE_URL = API_URL
  ? (API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`)
  : '/api';
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const PORTAL_TITLE = import.meta.env.VITE_PORTAL_TITLE || 'CPSE Material Harmonization Platform';

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};
