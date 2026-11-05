'use client';

import { useActionState, useState, useTransition } from 'react';
import { saveSettings, type SettingsFormState } from '@/app/admin/(cms)/settings/actions';
import { Checkbox, Field, Fieldset, Select, TextArea, TextInput } from '@/components/admin/Field/Field';
import { Button } from '@/components/admin/Button/Button';
import { MediaField, type PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { Notice } from '@/components/admin/Notice/Notice';
import { MAX_HOURS_ROWS, SOCIAL_NETWORKS, type HoursRow } from '@/lib/cms/settings-validation';
import { FONTS, type FontKey } from '@/lib/fonts';
import styles from './SettingsForm.module.css';

export type SettingsInitial = {
  companyName: string;
  legalName: string;
  tagline: string;
  footerDescription: string;
  phone: string;
  secondaryPhone: string;
  publicEmail: string;
  notificationEmail: string;
  whatsappNumber: string;
  whatsappLabel: string;
  responseNote: string;
  addressStreet: string;
  addressCity: string;
  addressCountry: string;
  addressCountryCode: string;
  businessHours: HoursRow[];
  socials: Record<string, string>;
  logo: PickedMedia | null;
  logoLight: PickedMedia | null;
  defaultOg: PickedMedia | null;
  seoTitle: string;
  seoDescription: string;
  titleTemplate: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  headingFont: FontKey;
  bodyFont: FontKey;
  smoothScroll: boolean;
  parallax: boolean;
};

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

export function SettingsForm({ initial: s }: { initial: SettingsInitial }) {
  const [state, action] = useActionState<SettingsFormState, FormData>(saveSettings, { status: 'idle' });
  const [seo, setSeo] = useState({ title: s.seoTitle, description: s.seoDescription });
  // Submitted by hand (not <form action>) so React does not reset the fields, keeping typed text after an error.
  const [pending, startSubmit] = useTransition();
  const e = state.status === 'error' ? state.errors : {};

  const text = (name: keyof SettingsInitial, label: string, opts: { hint?: string; type?: string; required?: boolean; max?: number } = {}) => (
    <Field label={label} htmlFor={name} hint={opts.hint} error={e[name]} required={opts.required}>
      <TextInput id={name} name={name} type={opts.type ?? 'text'} defaultValue={String(s[name] ?? '')} maxLength={opts.max ?? 200} required={opts.required} />
    </Field>
  );
  // Always show the saved rows plus one empty row to add another (up to MAX_HOURS_ROWS).
  const hourRows = Array.from({ length: Math.min(MAX_HOURS_ROWS, s.businessHours.length + 1) }, (_, i) => s.businessHours[i] ?? { day: '', hours: '' });

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startSubmit(() => action(data));
      }}
    >
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {state.status === 'saved' && <Notice tone="success">Saved at {time.format(state.savedAt)}. The website shows it now.</Notice>}

      <Fieldset legend="Company">
        {text('companyName', 'Company name', { required: true, max: 120 })}
        {text('legalName', 'Legal name', { required: true, max: 160, hint: 'Used in the copyright line and for Google.' })}
        {text('tagline', 'Tagline', { max: 200, hint: 'One sentence about SAGEC, shown in the footer and used by Google.' })}
        <Field label="Footer description" htmlFor="footerDescription" error={e.footerDescription} hint="Empty = the tagline.">
          <TextArea id="footerDescription" name="footerDescription" defaultValue={s.footerDescription} maxLength={500} rows={3} />
        </Field>
        <MediaField name="logoMediaId" label="Logo (for light backgrounds)" initial={s.logo} hint="Empty = the built-in SAGEC logo." />
        <MediaField name="logoLightMediaId" label="Logo for dark backgrounds" initial={s.logoLight} hint="Used in the footer and over the hero." />
      </Fieldset>

      <Fieldset legend="Contact">
        {text('phone', 'Phone', { max: 40 })}
        {text('secondaryPhone', 'Second phone', { max: 40 })}
        {text('publicEmail', 'Public email', { type: 'email', required: true, hint: 'Shown on the website.' })}
        {text('notificationEmail', 'Notification email', { type: 'email', required: true, hint: 'New contact messages are emailed here. Not shown on the website.' })}
        {text('addressStreet', 'Street')}
        {text('addressCity', 'City', { max: 80 })}
        {text('addressCountry', 'Country', { max: 80 })}
        {text('addressCountryCode', 'Country code', { max: 2, hint: '2 letters, e.g. RW. Helps Google show your location.' })}
      </Fieldset>

      <Fieldset legend="WhatsApp" description="The quickest way for visitors to reach the team. Leave the number empty to hide the WhatsApp button.">
        {text('whatsappNumber', 'WhatsApp number', { max: 30, hint: 'With the country code, e.g. 250 788 470 243.' })}
        {text('whatsappLabel', 'Button text', { max: 60, hint: 'e.g. Chat on WhatsApp' })}
        {text('responseNote', 'Response note', { max: 200, hint: 'Short line shown with the contact details, e.g. how fast you reply.' })}
      </Fieldset>

      <Fieldset legend="Opening hours" description="One row per group of days. Leave a row empty to remove it; save to get another empty row.">
        {hourRows.map((row, i) => (
          <div key={i} className={styles.pair}>
            <Field label="Days" htmlFor={`hours.${i}.day`} error={e[`hours.${i}.day`]}>
              <TextInput id={`hours.${i}.day`} name={`hours.${i}.day`} defaultValue={row.day} maxLength={60} placeholder="e.g. Sunday" />
            </Field>
            <Field label="Hours" htmlFor={`hours.${i}.hours`} error={e[`hours.${i}.hours`]}>
              <TextInput id={`hours.${i}.hours`} name={`hours.${i}.hours`} defaultValue={row.hours} maxLength={60} placeholder="e.g. Closed" />
            </Field>
          </div>
        ))}
      </Fieldset>

      <Fieldset legend="Social media" description="Paste the full link of each page you have. Empty ones are hidden.">
        {SOCIAL_NETWORKS.map((n) => (
          <Field key={n.key} label={n.label} htmlFor={`social.${n.key}`} error={e[`social.${n.key}`]}>
            <TextInput id={`social.${n.key}`} name={`social.${n.key}`} type="url" defaultValue={s.socials[n.key] ?? ''} maxLength={300} placeholder="https://" />
          </Field>
        ))}
      </Fieldset>

      <Fieldset legend="Search engines" description="Used on pages that have no title or description of their own.">
        <Field label="Default page title" htmlFor="seoTitle" error={e.seoTitle} required hint="Aim for 50–60 characters.">
          <TextInput id="seoTitle" name="seoTitle" defaultValue={s.seoTitle} maxLength={120} onChange={(ev) => setSeo((x) => ({ ...x, title: ev.target.value }))} />
        </Field>
        <Field label="Default description" htmlFor="seoDescription" error={e.seoDescription} required hint="Aim for 120–160 characters.">
          <TextArea id="seoDescription" name="seoDescription" defaultValue={s.seoDescription} maxLength={300} rows={3} onChange={(ev) => setSeo((x) => ({ ...x, description: ev.target.value }))} />
        </Field>
        <div className={styles.preview} aria-label="Google preview">
          <p className={styles.previewLabel}>Google preview</p>
          <p className={styles.previewTitle}>{seo.title || 'Page title'}</p>
          <p className={styles.previewDesc}>{seo.description || 'Description'}</p>
          <p className={styles.previewCount} data-warn={seo.title.length > 60 || seo.description.length > 160 || undefined}>
            Title {seo.title.length}/60 · description {seo.description.length}/160
          </p>
        </div>
        {text('titleTemplate', 'Title pattern', { required: true, max: 120, hint: '%s is replaced by the page title, e.g. “%s | SAGEC Ltd”.' })}
        {text('googleSiteVerification', 'Google Search Console code', { max: 300, hint: 'Optional. Paste the code or the whole meta tag Google gives you.' })}
        <MediaField name="defaultOgMediaId" label="Default share image" initial={s.defaultOg} hint="Shown when a page is shared on WhatsApp, LinkedIn… and has no image of its own. Best size 1200 × 630." />
      </Fieldset>

      <Fieldset
        legend="Google Analytics"
        description="See how many people visit, which pages they read and where they come from. Visits to this content manager (/admin) are never counted."
      >
        {text('googleAnalyticsId', 'Measurement ID', {
          max: 2000,
          hint: 'Google Analytics → Admin → Data streams → your web stream → Measurement ID (starts with G-). Pasting Google’s whole tag snippet also works. Leave empty to turn analytics off.',
        })}
      </Fieldset>

      <Fieldset legend="Fonts" description="Self-hosted for speed. Visitors only download the two fonts chosen here.">
        {(['headingFont', 'bodyFont'] as const).map((name) => (
          <Field key={name} label={name === 'headingFont' ? 'Headings' : 'Body text'} htmlFor={name}>
            <Select id={name} name={name} defaultValue={s[name]}>
              {FONTS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} ({f.kind}) — {f.note}
                </option>
              ))}
            </Select>
          </Field>
        ))}
      </Fieldset>

      <Fieldset legend="Motion" description="Both are switched off automatically for visitors whose device asks for reduced motion.">
        <Checkbox name="smoothScroll" defaultChecked={s.smoothScroll} label="Smooth scrolling" hint="Computers only; phones keep their own scrolling." />
        <Checkbox name="parallax" defaultChecked={s.parallax} label="Parallax backgrounds" hint="Background photos move slower than the page." />
      </Fieldset>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={pending} aria-busy={pending || undefined}>
          {pending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}
