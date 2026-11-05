// Messages shown after an action redirects (?notice=… or ?error=…). Only these codes are shown,
// so a crafted link cannot put arbitrary text on a CMS page. Later phases add their own codes.

export const NOTICES = {
  saved: 'Saved.',
  created: 'Created as a draft. Fill it in, then set it to Published (or Open) and save.',
  trashed: 'Moved to the trash. You can restore it from Trash.',
  restored: 'Restored as a draft. Publish it again when ready.',
  'deleted-entity': 'Deleted for good. Its photos are still in the media library.',
  'lead-deleted': 'Message deleted.',
  'status-new': 'Marked as new.',
  'status-contacted': 'Marked as contacted.',
  'status-closed': 'Closed. It stays in the inbox under “Closed”.',
  'deleted-category': 'Category deleted.',
  'deleted-author': 'Author removed. Their articles now show “SAGEC Team”.',
  'comment-approved': 'Comment approved. It is on the website now.',
  'comment-hidden': 'Comment hidden from the website.',
  'comment-deleted': 'Comment deleted.',
  discarded: 'Unpublished changes thrown away. The editor shows what is live again.',
  'version-restored': 'That version is now in the draft. Check it, then publish to put it live.',
  'user-added': 'User added. Give them their email and password; they can change the password after logging in.',
  'password-set': 'Password changed. That user was logged out everywhere.',
  'own-password': 'Your password was changed. You were logged out on your other devices.',
  'user-off': 'User deactivated and logged out. They can no longer log in.',
  'user-on': 'User reactivated. They can log in again.',
} as const;

export const ERRORS = {
  'not-found': 'It no longer exists. It may have been deleted in another window.',
  'missing-title': 'Type a name first.',
  'not-empty': 'This category still has articles. Move them to another category first.',
  'no-category': 'Add a category first: every article belongs to one.',
  'bad-slug': 'Use lowercase letters, numbers and dashes for the address.',
  'slug-taken': 'Another category already uses this address.',
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
