import axios from 'axios'

/**
 * Base URL of the Payload CMS (no trailing slash, no /api).
 * Set VITE_API_URL in .env — defaults to the local Payload dev server.
 */
export const CMS_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/** Shared axios instance for all Payload REST API calls. */
export const apiClient = axios.create({
  baseURL: `${CMS_BASE_URL}/api`,
})