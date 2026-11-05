import type { TextField } from 'payload'

/**
 * Spam trap for public forms (contact form, blog comments).
 *
 * The website renders a matching input that real visitors can't see or
 * reach, so it's always sent empty. Bots that auto-fill every field fill
 * it in, and the submission is rejected here — on the server, so it can't
 * be bypassed by skipping the frontend. `hidden` keeps it out of the admin
 * UI and out of every API response.
 */
export const honeypotField: TextField = {
  name: 'hp',
  type: 'text',
  hidden: true,
  validate: (value: string | null | undefined) =>
    !value || 'Submission rejected.',
}
