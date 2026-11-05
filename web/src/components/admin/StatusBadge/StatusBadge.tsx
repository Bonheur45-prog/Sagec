import styles from './StatusBadge.module.css';

const LABELS: Record<string, { text: string; tone: 'success' | 'muted' | 'warning' | 'danger' }> = {
  PUBLISHED: { text: 'Published', tone: 'success' },
  DRAFT: { text: 'Draft', tone: 'muted' },
  SCHEDULED: { text: 'Scheduled', tone: 'muted' },
  NEW: { text: 'New', tone: 'warning' },
  CONTACTED: { text: 'Contacted', tone: 'success' },
  CLOSED: { text: 'Closed', tone: 'muted' },
  DELETED: { text: 'In trash', tone: 'danger' },
};

/** `label` replaces the usual word (e.g. job openings: Open / Closed) but keeps the colour. */
export function StatusBadge({ status, label: text }: { status: string; label?: string }) {
  const label = LABELS[status] ?? { text: status, tone: 'muted' as const };
  return <span className={`${styles.badge} ${styles[label.tone]}`}>{text ?? label.text}</span>;
}
