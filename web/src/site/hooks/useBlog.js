'use client';

import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, createDoc } from '@lib/api'
import { toast } from 'sonner'

// ── QUERY DEFINITIONS ────────────────────────────────────────
// Exported as factories so prefetch-on-hover call sites and the
// actual useQuery hooks below share one definition — see
// useProjects.js for the fuller rationale.

export const blogPostsQuery = () =>
  queryOptions({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      // depth=1 populates coverImage, author, and tags — enough for the
      // grid and sidebar, which only ever show the author's NAME, never
      // their avatar. author.avatar (an upload field one hop further
      // in, since author itself is already a relationship hop) stays
      // an unresolved id at this depth — that's fine here, nothing in
      // the list views reads it. See blogPostQuery below for why the
      // single-post fetch goes to depth=2 instead.
      const res = await fetchCollection('blog-posts', '?sort=-publishedAt&limit=100&depth=1')
      return res.docs
    },
    meta: { errorMessage: 'Could not load blog posts. Please try again shortly.' },
  })

export const blogPostQuery = (slug) =>
  queryOptions({
    queryKey: ['blog-posts', slug],
    queryFn: async () => {
      // depth=2 here (not 1, unlike the list query above): the post
      // detail page's author bio DOES show the author's avatar, which
      // is a second relationship hop (post -> author -> author.avatar).
      // This is a single-document fetch, not a list, so the extra
      // depth costs nothing meaningful.
      const res = await fetchCollection(
        'blog-posts',
        `?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
      )
      return res.docs[0] ?? null
    },
    enabled: Boolean(slug),
    meta: { errorMessage: 'Could not load this article. Please try again shortly.' },
  })

export const blogCommentsQuery = (postId) =>
  queryOptions({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      // No need to filter on `approved` here — BlogComments' own access
      // control already restricts unauthenticated reads to approved
      // comments only, server-side. Filtering again client-side would
      // just be redundant.
      const res = await fetchCollection(
        'blog-comments',
        `?where[post][equals]=${encodeURIComponent(postId)}&depth=1&sort=-createdAt&limit=100`,
      )
      return res.docs
    },
    enabled: Boolean(postId),
    meta: { errorMessage: 'Could not load comments right now.' },
  })

export const tagsQuery = () =>
  queryOptions({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetchCollection('tags', '?sort=name&limit=100')
      return res.docs
    },
    meta: { errorMessage: 'Could not load tags. Please try again shortly.' },
  })

// ── HOOKS ─────────────────────────────────────────────────────

/** All blog posts, newest first. */
export function useBlogPosts() {
  return useQuery(blogPostsQuery())
}

/**
 * A single blog post by its URL slug — powers /blog/:slug.
 * Returns `data: null` (not undefined, not an error) when no post
 * matches — callers should treat that as "genuinely not found" and
 * distinguish it from `isLoading`/`isError`, which mean something
 * different (still fetching / the request itself failed).
 */
export function useBlogPost(slug) {
  return useQuery(blogPostQuery(slug))
}

/** Approved comments for one post, newest first. */
export function useBlogComments(postId) {
  return useQuery(blogCommentsQuery(postId))
}

/** All tags, alphabetical — powers the sidebar's tag cloud. */
export function useTags() {
  return useQuery(tagsQuery())
}

/**
 * Submits a new blog comment. Succeeds immediately from the visitor's
 * point of view (toast + form reset) but the comment itself stays
 * invisible on the public site — BlogComments defaults new entries to
 * `approved: false` — until approved in the CMS admin. Invalidating
 * the comments query means that once it IS approved, the next time
 * anyone (including the commenter, on a later visit) loads this post,
 * they see it — not an optimistic local insert, since that would
 * render successfully then vanish on the next real fetch, which reads
 * as more broken than just not showing it immediately.
 */
export function useSubmitComment(postId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => createDoc('blog-comments', { ...payload, message: payload.text, post: postId }),
    onSuccess: (result) => {
      toast.success(result?.message || 'Thanks! Your comment will appear once it\u2019s been reviewed.')
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] })
    },
    onError: (error) => {
      toast.error(Object.values(error?.data?.fieldErrors ?? {})[0] || error?.data?.message || 'Could not submit your comment. Please try again.')
    },
  })
}