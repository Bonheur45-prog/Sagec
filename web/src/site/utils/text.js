/**
 * Turns a full name into up-to-2-character initials for avatar fallbacks.
 * e.g. "Isaac Byiringiro" -> "IB"
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}