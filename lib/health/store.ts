'use client';

/**
 * Health LOB Store — wraps the existing store for the Health journey.
 * In the future this will use createJourneyStore() from core.
 * For now, re-exports the existing store to maintain backward compatibility.
 */
export { useJourneyStore } from '../store';
