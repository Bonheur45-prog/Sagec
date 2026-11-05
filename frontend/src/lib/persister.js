import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

/**
 * Persists the entire query cache to localStorage.
 *
 * Without this, staleTime/gcTime only help WITHIN a session — a hard
 * refresh (or a first visit after closing the tab) throws the cache
 * away entirely, so every page shows a loading state again even for
 * content that hasn't changed. With this, a cold reload rehydrates
 * from localStorage and shows the last-known content instantly, while
 * a background refetch quietly checks for anything newer.
 *
 * Only successful queries get persisted (TanStack's default
 * shouldDehydrateQuery) — nothing mid-flight or errored is saved, so
 * there's no risk of "resuming" into a broken state.
 */
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'sagec-query-cache',
})

/**
 * buster: bump this string whenever a collection/global's shape
 * changes in a way that could break old cached data (renamed field,
 * removed field a component relies on, etc). Any persisted cache
 * with a different buster value is discarded on load instead of
 * being rehydrated — cheap insurance against "works until someone's
 * browser has a stale shape cached."
 */
export const persistOptions = {
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours — content is a marketing site, not a live feed
  buster: 'sagec-v1',
}