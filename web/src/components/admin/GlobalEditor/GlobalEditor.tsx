'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { Checkbox } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import { PublishBar } from '@/components/admin/PublishBar/PublishBar';
import { useDocEditor } from '@/components/admin/PublishBar/useDocEditor';
import {
  MAX_LINKS,
  MAX_NAV_ITEMS,
  type FooterDoc,
  type HeaderDoc,
  type LinkDoc,
  type NavItemDoc,
  type Problems,
} from '@/lib/cms/globals-model';
import styles from './GlobalEditor.module.css';

type Props =
  | { kind: 'header'; initial: HeaderDoc; unpublished: boolean; pages: string[] }
  | { kind: 'footer'; initial: FooterDoc; unpublished: boolean; pages: string[] };

const newId = () => Math.random().toString(36).slice(2, 10);

function move<X>(list: X[], i: number, step: number): X[] {
  const j = i + step;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** One line of text. */
function Text({ label, value, onChange, error, max = 80, hint }: { label: string; value: string; onChange: (v: string) => void; error?: string; max?: number; hint?: string }) {
  return (
    <label className={styles.field} data-invalid={error ? true : undefined}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

function UrlInput({ value, onChange, error, listId }: { value: string; onChange: (v: string) => void; error?: string; listId: string }) {
  return (
    <label className={styles.field} data-invalid={error ? true : undefined}>
      <span className={styles.label}>Link</span>
      <input className={styles.input} value={value} list={listId} maxLength={500} placeholder="/about or https://…" onChange={(e) => onChange(e.target.value)} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

function RowTools({ onUp, onDown, onRemove, what }: { onUp: () => void; onDown: () => void; onRemove: () => void; what: string }) {
  return (
    <div className={styles.tools}>
      <Button size="sm" variant="ghost" onClick={onUp} aria-label={`Move ${what} up`}>↑</Button>
      <Button size="sm" variant="ghost" onClick={onDown} aria-label={`Move ${what} down`}>↓</Button>
      <Button size="sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${what}`}>Remove</Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/** A list of simple links (footer quick links, legal links). */
function LinkList({ items, onChange, problems, prefix, listId, max }: { items: LinkDoc[]; onChange: (l: LinkDoc[]) => void; problems: Problems; prefix: string; listId: string; max: number }) {
  const set = (i: number, patch: Partial<LinkDoc>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      {items.map((l, i) => (
        <div key={l.id} className={styles.row}>
          <Text label="Label" value={l.label} onChange={(label) => set(i, { label })} error={problems[`${prefix}.${i}.label`]} />
          <UrlInput value={l.url} onChange={(url) => set(i, { url })} error={problems[`${prefix}.${i}.url`]} listId={listId} />
          <Checkbox label="New tab" checked={l.newTab} onChange={(e) => set(i, { newTab: e.target.checked })} />
          <RowTools what="link" onUp={() => onChange(move(items, i, -1))} onDown={() => onChange(move(items, i, 1))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      {items.length < max && (
        <Button size="sm" onClick={() => onChange([...items, { id: newId(), label: '', url: '', newTab: false }])}>
          + Add link
        </Button>
      )}
    </>
  );
}

export function GlobalEditor(props: Props) {
  const ed = useDocEditor<HeaderDoc | FooterDoc>(props.kind, props.initial, props.unpublished);
  const p = ed.problems;
  const listId = `pages-${props.kind}`;

  return (
    <div className={styles.editor}>
      {ed.status.kind === 'error' && <Notice tone="error">{ed.status.message}</Notice>}
      <datalist id={listId}>
        {props.pages.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      {props.kind === 'header' ? (
        <HeaderFields doc={ed.doc as HeaderDoc} setDoc={(f) => ed.setDoc((d) => f(d as HeaderDoc))} problems={p} listId={listId} />
      ) : (
        <FooterFields doc={ed.doc as FooterDoc} setDoc={(f) => ed.setDoc((d) => f(d as FooterDoc))} problems={p} listId={listId} />
      )}

      <PublishBar dirty={ed.dirty} unpublished={ed.unpublished} status={ed.status} pending={ed.pending} onSave={ed.save} onPublish={ed.publish} />
    </div>
  );
}

function HeaderFields({ doc, setDoc, problems: p, listId }: { doc: HeaderDoc; setDoc: (f: (d: HeaderDoc) => HeaderDoc) => void; problems: Problems; listId: string }) {
  const setNav = (navItems: NavItemDoc[]) => setDoc((d) => ({ ...d, navItems }));
  const setItem = (i: number, patch: Partial<NavItemDoc>) => setNav(doc.navItems.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <>
      <Section title="Menu">
        {p.navItems && <p className={styles.error}>{p.navItems}</p>}
        {doc.navItems.map((n, i) => (
          <div key={n.id} className={styles.card}>
            <div className={styles.row}>
              <Text label="Menu label" value={n.label} onChange={(label) => setItem(i, { label })} error={p[`nav.${i}.label`]} />
              <UrlInput value={n.url} onChange={(url) => setItem(i, { url })} error={p[`nav.${i}.url`]} listId={listId} />
              <Checkbox label="New tab" checked={n.newTab} onChange={(e) => setItem(i, { newTab: e.target.checked })} />
              <RowTools what="menu item" onUp={() => setNav(move(doc.navItems, i, -1))} onDown={() => setNav(move(doc.navItems, i, 1))} onRemove={() => setNav(doc.navItems.filter((_, j) => j !== i))} />
            </div>
          </div>
        ))}
        {doc.navItems.length < MAX_NAV_ITEMS && (
          <Button size="sm" onClick={() => setNav([...doc.navItems, { id: newId(), label: '', url: '', newTab: false, children: [] }])}>
            + Add menu item
          </Button>
        )}
      </Section>

      <Section title="Button on the right">
        <Checkbox label="Show the button" checked={doc.cta.enabled} onChange={(e) => setDoc((d) => ({ ...d, cta: { ...d.cta, enabled: e.target.checked } }))} />
        {doc.cta.enabled && (
          <div className={styles.row}>
            <Text label="Button text" value={doc.cta.label} max={40} onChange={(label) => setDoc((d) => ({ ...d, cta: { ...d.cta, label } }))} error={p['cta.label']} />
            <UrlInput value={doc.cta.url} onChange={(url) => setDoc((d) => ({ ...d, cta: { ...d.cta, url } }))} error={p['cta.url']} listId={listId} />
          </div>
        )}
      </Section>

      <Section title="Behaviour">
        <Checkbox label="See-through over hero photos (solid once the visitor scrolls)" checked={doc.transparentOnHero} onChange={(e) => setDoc((d) => ({ ...d, transparentOnHero: e.target.checked }))} />
      </Section>
    </>
  );
}

function FooterFields({ doc, setDoc, problems: p, listId }: { doc: FooterDoc; setDoc: (f: (d: FooterDoc) => FooterDoc) => void; problems: Problems; listId: string }) {
  const set = (patch: Partial<FooterDoc>) => setDoc((d) => ({ ...d, ...patch }));
  return (
    <>
      <p className={styles.hint}>
        The first column (logo, company description and social icons) and the contact column (address, phone, email, hours)
        come from Site settings, so they are always the same as everywhere else on the site.
      </p>

      <Section title="Quick links column">
        <Text label="Column heading" value={doc.quickLinksHeading} max={60} onChange={(quickLinksHeading) => set({ quickLinksHeading })} />
        <LinkList items={doc.quickLinks} onChange={(quickLinks) => set({ quickLinks })} problems={p} prefix="quickLinks" listId={listId} max={MAX_LINKS} />
      </Section>

      <Section title="Services column">
        <Checkbox label="Show the services column" checked={doc.showServices} onChange={(e) => set({ showServices: e.target.checked })} />
        {doc.showServices && (
          <Text label="Column heading" value={doc.servicesHeading} max={60} onChange={(servicesHeading) => set({ servicesHeading })} hint="Lists the published services, with a “View all services” link." />
        )}
      </Section>

      <Section title="Contact column">
        <Text label="Column heading" value={doc.contactHeading} max={60} onChange={(contactHeading) => set({ contactHeading })} />
      </Section>

      <Section title="Bottom bar">
        <Text
          label="Copyright line"
          value={doc.copyright}
          max={200}
          onChange={(copyright) => set({ copyright })}
          hint="{year} becomes the current year. Empty = “© {year} <legal name from Site settings>. All rights reserved.”"
        />
        <p className={styles.hint}>Small links next to the copyright, e.g. a privacy policy. Optional.</p>
        <LinkList items={doc.legalLinks} onChange={(legalLinks) => set({ legalLinks })} problems={p} prefix="legalLinks" listId={listId} max={MAX_LINKS} />
        <p className={styles.hint}>Credit at the bottom right, e.g. “Built by BrightLink Technologies”. Leave the name empty to hide it.</p>
        <div className={styles.row}>
          <Text label="Credit text" value={doc.credit.prefix} max={40} onChange={(prefix) => set({ credit: { ...doc.credit, prefix } })} />
          <Text label="Credit name" value={doc.credit.name} max={80} onChange={(name) => set({ credit: { ...doc.credit, name } })} />
          <UrlInput value={doc.credit.url} onChange={(url) => set({ credit: { ...doc.credit, url } })} error={p['credit.url']} listId={listId} />
        </div>
      </Section>
    </>
  );
}
