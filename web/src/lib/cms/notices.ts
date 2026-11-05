// Messages shown after an action redirects (?notice=… or ?error=…). Only these codes are shown,
// so a crafted link cannot put arbitrary text on a CMS page. Later phases add their own codes.

export const NOTICES = {
  saved: 'Saved.',
  'user-added': 'User added. Give them their email and password; they can change the password after logging in.',
  'password-set': 'Password changed. That user was logged out everywhere.',
  'own-password': 'Your password was changed. You were logged out on your other devices.',
  'user-off': 'User deactivated and logged out. They can no longer log in.',
  'user-on': 'User reactivated. They can log in again.',
} as const;

export const ERRORS = {
  'not-found': 'It no longer exists. It may have been deleted in another window.',
  'bad-email': 'Use a valid email address.',
  'bad-name': 'Add a name (at most 80 characters).',
  'short-password': 'Use a password of at least 10 characters (at most 200).',
  'email-taken': 'A user with this email already exists. Reset their password instead.',
  'wrong-password': 'Your current password is not correct.',
  mismatch: 'The two new passwords are not the same.',
  self: 'You cannot deactivate your own account.',
  'last-user': 'At least one active user must remain.',
} as const;

export type NoticeCode = keyof typeof NOTICES;
export type ErrorCode = keyof typeof ERRORS;

export function noticeFrom(params: Record<string, string | string[] | undefined>) {
  const notice = params.notice;
  const error = params.error;
  return {
    notice: typeof notice === 'string' && notice in NOTICES ? NOTICES[notice as NoticeCode] : null,
    error: typeof error === 'string' && error in ERRORS ? ERRORS[error as ErrorCode] : null,
  };
}
