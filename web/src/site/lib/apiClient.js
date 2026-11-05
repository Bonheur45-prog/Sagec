/**
 * The website asks its own server for content: /api/… answers in the same format the old Payload CMS
 * used (see src/lib/site/payload.ts), so the sections did not need to change. Pages arrive with their
 * content already filled in by the server; these requests only run when content is refreshed in the browser.
 */
export const CMS_BASE_URL = ''

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const error = new Error(data?.errors?.[0]?.message || data?.message || `Request failed (${res.status})`)
    error.status = res.status
    error.data = data
    throw error
  }
  return { data }
}

/** Same calls as the axios instance it replaces: apiClient.get(path) / apiClient.post(path, body) → { data }. */
export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
}
