'use client';

import { useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { MediaPicker, type PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { Notice } from '@/components/admin/Notice/Notice';
import { PublishBar } from '@/components/admin/PublishBar/PublishBar';
import { useDocEditor } from '@/components/admin/PublishBar/useDocEditor';
import type { PageKey } from '@/lib/cms/drafts';
import type { Problems } from '@/lib/cms/globals-model';
import { MAX_ROWS, emptyRow, fieldLabel, flatFields, optionLabel, optionValue, type Field } from '@/lib/pages/fields';
import styles from './PageEditor.module.css';

/*
 * Editor for one page's texts and photos, drawn from the page's field list: text boxes, choices,
 * photo pickers and repeatable lists (slides, values, steps…). Draft → publish like the header and footer.
 */

type Doc = Record<string, unknown>;
type Props = { pageKey: PageKey; fields: Field[]; initial: Doc; unpublished: boolean; media: Record<string, PickedMedia> };

const newId = () => Math.random().toString(36).slice(2, 10);
const obj = (v: unknown): Doc => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Doc) : {});

export function PageEditor({ pageKey, fields, initial, unpublished, media: initialMedia }: Props) {
  const ed = useDocEditor<Doc>(pageKey, initial, unpublished);
  const [media, setMedia] = useState(initialMedia);
  const ctx: Ctx = { problems: ed.problems, media, remember: (m) => setMedia((all) => ({ ...all, [m.id]: m })) };
  const top = flatFields(fields);
  const loose = top.filter((f) => f.type !== 'group');
  const errorCount = Object.keys(ed.problems).length;

  return (
    <div className={styles.editor}>
      {ed.status.kind === 'error' && (
        <Notice tone="error">
          {ed.status.message}
          {errorCount > 0 && ` (${errorCount} ${errorCount === 1 ? 'field' : 'fields'})`}
        </Notice>
      )}
      {loose.length > 0 && (
        <Section title="Page texts">
          <Fields fields={loose} value={ed.doc} onChange={(next) => ed.setDoc((d) => ({ ...d, ...next }))} path="" ctx={ctx} />
        </Section>
      )}
      {top
        .filter((f) => f.type === 'group')
        .map((g) => (
          <Section key={g.name} title={fieldLabel(g)} description={g.description}>
            <Fields fields={g.fields ?? []} value={obj(ed.doc[g.name!])} onChange={(next) => ed.setDoc((d) => ({ ...d, [g.name!]: next }))} path={`${g.name}.`} ctx={ctx} />
          </Section>
        ))}
      <PublishBar dirty={ed.dirty} unpublished={ed.unpublished} status={ed.status} pending={ed.pending} onSave={ed.save} onPublish={ed.publish} />
    </div>
  );
}

type Ctx = { problems: Problems; media: Record<string, PickedMedia>; remember: (m: PickedMedia) => void };

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <details className={styles.section} open>
      <summary className={styles.sectionTitle}>{title}</summary>
      {description && <p className={styles.hint}>{description}</p>}
      <div className={styles.sectionBody}>{children}</div>
    </details>
  );
}

/** The fields of one object (the page, a group, or one list item). */
function Fields({ fields, value, onChange, path, ctx }: { fields: Field[]; value: Doc; onChange: (next: Doc) => void; path: string; ctx: Ctx }) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });
  return (
    <div className={styles.fields}>
      {flatFields(fields).map((f) => {
        if (!f.name) return null;
        const key = path + f.name;
        const v = value[f.name];
        const error = ctx.problems[key];
        if (f.type === 'group')
          return (
            <fieldset key={key} className={styles.group}>
              <legend className={styles.legend}>{fieldLabel(f)}</legend>
              {f.description && <p className={styles.hint}>{f.description}</p>}
              <Fields fields={f.fields ?? []} value={obj(v)} onChange={(next) => set(f.name!, next)} path={`${key}.`} ctx={ctx} />
            </fieldset>
          );
        if (f.type === 'array') return <List key={key} field={f} rows={Array.isArray(v) ? (v as Doc[]) : []} onChange={(rows) => set(f.name!, rows)} path={key} ctx={ctx} />;
        if (f.type === 'upload') return <Upload key={key} field={f} value={typeof v === 'string' ? v : null} onChange={(id) => set(f.name!, id)} error={error} ctx={ctx} />;
        return <Input key={key} field={f} value={v} onChange={(x) => set(f.name!, x)} error={error} />;
      })}
    </div>
  );
}

function Input({ field: f, value, onChange, error }: { field: Field; value: unknown; onChange: (v: unknown) => void; error?: string }) {
  const id = useId();
  const label = (
    <label htmlFor={id} className={styles.label}>
      {fieldLabel(f)}
      {f.required && <span className={styles.req}> *</span>}
    </label>
  );
  let control: ReactNode;
  if (f.type === 'textarea')
    control = <textarea id={id} className={styles.input} rows={3} maxLength={4000} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} />;
  else if (f.type === 'number')
    control = (
      <input id={id} type="number" className={styles.input} value={typeof value === 'number' ? value : ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    );
  else if (f.type === 'select')
    control = (
      <select id={id} className={styles.input} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || null)}>
        {!f.required && <option value="">—</option>}
        {(f.options ?? []).map((o) => (
          <option key={optionValue(o)} value={optionValue(o)}>
            {optionLabel(o)}
          </option>
        ))}
      </select>
    );
  else
    control = (
      <input id={id} type={f.type === 'email' ? 'email' : 'text'} className={styles.input} maxLength={300} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} />
    );
  return (
    <div className={`${styles.field} ${f.type === 'textarea' ? styles.wide : ''}`} data-invalid={error ? true : undefined}>
      {label}
      {control}
      {error ? <span className={styles.error}>{error}</span> : f.description && <span className={styles.hint}>{f.description}</span>}
    </div>
  );
}

function Upload({ field: f, value, onChange, error, ctx }: { field: Field; value: string | null; onChange: (id: string | null) => void; error?: string; ctx: Ctx }) {
  const [open, setOpen] = useState(false);
  const kind = /video/i.test(f.name ?? '') ? 'VIDEO' : 'IMAGE';
  const picked = value ? ctx.media[value] : null;
  return (
    <div className={styles.field} data-invalid={error ? true : undefined}>
      <span className={styles.label}>{fieldLabel(f)}</span>
      <div className={styles.uploadRow}>
        <MediaThumb media={value ? { kind: picked?.kind ?? kind, thumbUrl: picked?.thumbUrl ?? null, durationSec: null } : null} size={72} alt={picked?.alt} />
        <Button size="sm" onClick={() => setOpen(true)}>{value ? 'Change' : 'Choose'}</Button>
        {value && (
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : (
        <span className={styles.hint}>{f.description ?? (value ? '' : 'Empty: the website uses its built-in photo.')}</span>
      )}
      <MediaPicker
        open={open}
        kind={kind}
        title={fieldLabel(f)}
        onClose={() => setOpen(false)}
        onPick={(m) => {
          ctx.remember(m);
          onChange(m.id);
          setOpen(false);
        }}
      />
    </div>
  );
}

function List({ field: f, rows, onChange, path, ctx }: { field: Field; rows: Doc[]; onChange: (rows: Doc[]) => void; path: string; ctx: Ctx }) {
  const max = Math.min(f.maxRows ?? MAX_ROWS, MAX_ROWS);
  const error = ctx.problems[path];
  const titleOf = (row: Doc, i: number) => {
    const first = flatFields(f.fields ?? []).find((x) => (x.type === 'text' || x.type === 'textarea') && typeof row[x.name ?? ''] === 'string' && row[x.name!]);
    return first ? String(row[first.name!]).slice(0, 60) : `Item ${i + 1}`;
  };
  const move = (i: number, step: number) => {
    const j = i + step;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className={`${styles.group} ${styles.wide}`} data-invalid={error ? true : undefined}>
      <legend className={styles.legend}>
        {fieldLabel(f)} <span className={styles.count}>({rows.length}{f.maxRows ? ` of at most ${f.maxRows}` : ''})</span>
      </legend>
      {f.description && <p className={styles.hint}>{f.description}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {rows.map((row, i) => (
        <details key={String(row.id ?? i)} className={styles.item}>
          <summary className={styles.itemHead}>
            <span className={styles.itemTitle}>
              {i + 1}. {titleOf(row, i)}
              {Object.keys(ctx.problems).some((k) => k.startsWith(`${path}.${i}.`)) && <span className={styles.itemError}> · needs attention</span>}
            </span>
            <span className={styles.tools}>
              <Button size="sm" variant="ghost" onClick={() => move(i, -1)} aria-label={`Move item ${i + 1} up`}>↑</Button>
              <Button size="sm" variant="ghost" onClick={() => move(i, 1)} aria-label={`Move item ${i + 1} down`}>↓</Button>
              <Button size="sm" variant="ghost" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove item ${i + 1}`}>Remove</Button>
            </span>
          </summary>
          <Fields fields={f.fields ?? []} value={row} onChange={(next) => onChange(rows.map((r, j) => (j === i ? next : r)))} path={`${path}.${i}.`} ctx={ctx} />
        </details>
      ))}
      {rows.length < max && (
        <div>
          <Button size="sm" onClick={() => onChange([...rows, emptyRow(f, newId())])}>
            + Add {fieldLabel(f).toLowerCase().replace(/s$/, '')}
          </Button>
        </div>
      )}
    </fieldset>
  );
}
