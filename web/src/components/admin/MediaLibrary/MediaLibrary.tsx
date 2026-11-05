'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { Field, TextInput } from '@/components/admin/Field/Field';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { MediaUploader } from '@/components/admin/MediaUploader/MediaUploader';
import { formatBytes } from '@/lib/storage/limits';
import type { AdminMedia } from '@/lib/storage/assets';
import { deleteMediaForever, restoreMedia, saveAlt, trashMedia, type MediaActionResult } from '@/app/admin/(cms)/media/actions';
import styles from './MediaLibrary.module.css';

type Props = { items: AdminMedia[]; trash: boolean };

/** Grid of everything uploaded, with a side panel to describe (alt text), copy the link, trash or restore a file. */
export function MediaLibrary({ items, trash }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = items.find((m) => m.id === selectedId) ?? null;

  const run = (task: () => Promise<MediaActionResult>, success: string, after?: () => void) =>
    startTransition(async () => {
      const result = await task();
      if (result.ok) {
        setMessage({ tone: 'ok', text: success });
        after?.();
        router.refresh();
      } else {
        setMessage({ tone: 'error', text: result.error });
      }
    });

  return (
    <div className={styles.wrap}>
      {!trash && (
        <MediaUploader
          onUploaded={() => {
            setMessage({ tone: 'ok', text: 'Added. Describe it in the panel so Google and screen readers understand it.' });
            router.refresh();
          }}
        />
      )}

      {message && (
        <p className={styles.message} data-tone={message.tone} role={message.tone === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <div className={styles.layout}>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.tile}
                data-selected={item.id === selectedId || undefined}
                data-missing-alt={(!item.alt && item.kind === 'IMAGE') || undefined}
                onClick={() => setSelectedId(item.id)}
                aria-label={`${item.alt || 'No description'} (${item.kind === 'IMAGE' ? 'photo' : 'video'}) — select`}
              >
                <MediaThumb media={item} fluid />
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <aside className={styles.panel} aria-label="Selected file">
            <MediaThumb media={selected} fluid wide alt={selected.alt} />
            <dl className={styles.facts}>
              <div>
                <dt>Size</dt>
                <dd>
                  {selected.width} × {selected.height} px · {formatBytes(selected.sizeBytes)}
                </dd>
              </div>
              <div>
                <dt>Added</dt>
                <dd>{new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
              </div>
            </dl>
            <AltForm key={selected.id} media={selected} disabled={pending || trash} onSave={(alt) => run(() => saveAlt(selected.id, alt), 'Description saved.')} />
            <div className={styles.actions}>
              <Button size="sm" onClick={() => void navigator.clipboard?.writeText(selected.url)}>
                Copy link
              </Button>
              {trash ? (
                <>
                  <Button size="sm" disabled={pending} onClick={() => run(() => restoreMedia(selected.id), 'Restored.', () => setSelectedId(null))}>
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm('Delete this file for good? This cannot be undone.')) {
                        run(() => deleteMediaForever(selected.id), 'Deleted.', () => setSelectedId(null));
                      }
                    }}
                  >
                    Delete for good
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="danger" disabled={pending} onClick={() => run(() => trashMedia(selected.id), 'Moved to the trash.', () => setSelectedId(null))}>
                  Move to trash
                </Button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function AltForm({ media, disabled, onSave }: { media: AdminMedia; disabled: boolean; onSave: (alt: string) => void }) {
  const [alt, setAlt] = useState(media.alt);
  const dirty = alt !== media.alt;
  return (
    <div className={styles.alt}>
      <Field
        label="Description"
        htmlFor={`alt-${media.id}`}
        hint="Say what the picture shows, in a sentence. Used by Google and screen readers."
      >
        <TextInput id={`alt-${media.id}`} value={alt} maxLength={300} disabled={disabled} onChange={(e) => setAlt(e.target.value)} />
      </Field>
      <Button size="sm" variant="primary" disabled={disabled || !dirty} onClick={() => onSave(alt)}>
        Save description
      </Button>
    </div>
  );
}
