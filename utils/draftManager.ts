/**
 * Draft Manager - localStorage-based auto-save for interview setup
 * Handles draft creation, recovery, and cleanup
 */

import type { InterviewConfig, RoleContext } from '@/lib/schema';

const DRAFT_KEY = 'interviewDraft';
const DRAFT_EXPIRY_MS = 60 * 60 * 1000; // 60 minutes

export interface InterviewDraft {
  lastSaved: string;
  screenOneConfig: InterviewConfig;
  roleContext: Partial<RoleContext>;
}

/**
 * Save draft to localStorage
 */
export function saveDraft(draft: Omit<InterviewDraft, 'lastSaved'>): void {
  try {
    const draftWithTimestamp: InterviewDraft = {
      ...draft,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftWithTimestamp));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

/**
 * Load draft from localStorage
 * Returns null if no draft exists or if expired
 */
export function loadDraft(): InterviewDraft | null {
  try {
    const draftStr = localStorage.getItem(DRAFT_KEY);
    if (!draftStr) return null;

    const draft: InterviewDraft = JSON.parse(draftStr);
    const savedAt = new Date(draft.lastSaved);
    const now = new Date();
    const ageMs = now.getTime() - savedAt.getTime();

    // Expired drafts are automatically cleaned up
    if (ageMs > DRAFT_EXPIRY_MS) {
      clearDraft();
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}

/**
 * Get human-readable time since draft was saved
 */
export function getDraftAge(draft: InterviewDraft): string {
  const savedAt = new Date(draft.lastSaved);
  const now = new Date();
  const diffMs = now.getTime() - savedAt.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} min ago`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

/**
 * Check if draft exists and is not expired
 */
export function hasDraft(): boolean {
  return loadDraft() !== null;
}

/**
 * Debounce helper for auto-save
 */
export function createDebouncedSave(delayMs: number = 500) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (draft: Omit<InterviewDraft, 'lastSaved'>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      saveDraft(draft);
      timeoutId = null;
    }, delayMs);
  };
}

