const raw = import.meta.env.VITE_ADMIN_PANEL_VERSION as string | undefined;

export const APP_VERSION = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : '0.1.0';
