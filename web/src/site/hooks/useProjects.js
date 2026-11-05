'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchGlobal } from '@lib/api'

/**
 * Mirrors the `category` select field's options on the Projects
 * collection in Payload (src/collections/Projects.ts). Kept as a
 * frontend constant rather than an extra API call — this list only
 * changes when someone edits the collection schema itself.
 */
export const PROJECT_CATEGORIES = [
  'All',
  'Commercial',
  'Residential',
  'Interior Design',
  'Infrastructure',
  'Institutional/Civic',
]

/**
 * The old static data had a `specs` object per project. The CMS models
 * the same information as flat fields on the Projects collection instead
 * (location, year, category, client, area, status) — this derives the
 * same ordered key/value list from those fields so existing UI that
 * iterates over "specs entries" doesn't need to change shape.
 */
export function getProjectSpecs(project) {
  if (!project) return []
  return [
    ['Location', project.location],
    ['Year', project.year],
    ['Category', project.category],
    ['Client', project.client],
    ['Area', project.area],
    ['Status', project.status],
  ].filter(([, value]) => Boolean(value))
}

// ── QUERY DEFINITIONS ────────────────────────────────────────
// Exported as factories (not just used inline in the hooks below) so
// that usePrefetch() call sites — e.g. onMouseEnter on a project card
// — can prefetch with queryClient.prefetchQuery(projectQuery(slug))
// using the EXACT same queryKey/queryFn as the hook that will later
// read it. Two definitions of the same query is how they silently
// drift apart; one definition used two ways can't.

export const projectsQuery = () =>
  queryOptions({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetchCollection('projects', '?sort=order&limit=100&depth=1')
      return res.docs
    },
    meta: { errorMessage: 'Could not load projects. Please try again shortly.' },
  })

export const projectQuery = (slug) =>
  queryOptions({
    queryKey: ['projects', slug],
    queryFn: async () => {
      const res = await fetchCollection(
        'projects',
        `?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
      )
      return res.docs[0] ?? null
    },
    enabled: Boolean(slug),
    meta: { errorMessage: 'Could not load this project. Please try again shortly.' },
  })

export const projectsPageQuery = () =>
  queryOptions({
    queryKey: ['projects-page'],
    queryFn: () => fetchGlobal('projects-page', '?depth=2'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

// ── HOOKS ─────────────────────────────────────────────────────

/** All projects, in the CMS's configured display order. */
export function useProjects(select) {
  return useQuery({ ...projectsQuery(), select })
}

/**
 * A single project by its URL slug — powers /projects/:slug.
 * Returns `data: null` (not undefined, not an error) when no project
 * matches — callers should treat that as "genuinely not found" and
 * distinguish it from `isLoading`/`isError`, which mean something
 * different (still fetching / the request itself failed).
 */
export function useProject(slug) {
  return useQuery(projectQuery(slug))
}

/**
 * Fetches the whole ProjectsPage global once. ProjectsHero, ProjectsGrid
 * (empty-state message), and ProjectsCTA all use this with a `select` —
 * React Query dedupes identical queryKeys, so this is a single network
 * request no matter how many sections use it.
 */
export function useProjectsPage(select) {
  return useQuery({ ...projectsPageQuery(), select })
}