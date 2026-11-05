// Field-list helpers shared by the server and the CMS page editor (no content files here, so the
// editor stays small). Pure.

export type Option = string | { label: string; value: string };
export type Field = {
  name?: string;
  type: 'group' | 'array' | 'collapsible' | 'text' | 'textarea' | 'email' | 'number' | 'select' | 'upload';
  label?: string;
  description?: string;
  required?: boolean;
  options?: Option[];
  defaultValue?: unknown;
  minRows?: number;
  maxRows?: number;
  fields?: Field[];
};
export type PageSchema = { slug: string; label: string; description?: string; fields: Field[] };

/** "headlineLine1" → "Headline line 1" */
export function humanize(name: string): string {
  const words = name
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .trim();
  return words
    .replace(/\bcta\b/g, 'call to action')
    .replace(/\bseo\b/g, 'SEO')
    .replace(/\bbtn\b/g, 'button')
    .replace(/^./, (c) => c.toUpperCase());
}
export const fieldLabel = (f: Field) => f.label || (f.name ? humanize(f.name) : '');
export const optionValue = (o: Option) => (typeof o === 'string' ? o : o.value);
export const optionLabel = (o: Option) => (typeof o === 'string' ? humanize(o) : o.label);

/** Fields of a list of fields, with the "collapsible" boxes (layout only in Payload) opened up. */
export function flatFields(fields: Field[]): Field[] {
  return fields.flatMap((f) => (f.type === 'collapsible' ? flatFields(f.fields ?? []) : [f]));
}

const MAX_TEXT = 300;
const MAX_LONG = 4000;
export const MAX_ROWS = 40;

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const rowId = (v: unknown, i: number) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : `r${i}`);

function parseValue(f: Field, v: unknown): unknown {
  switch (f.type) {
    case 'text':
    case 'email':
      return typeof v === 'string' ? v.slice(0, MAX_TEXT) : typeof v === 'number' ? String(v) : '';
    case 'textarea':
      return typeof v === 'string' ? v.slice(0, MAX_LONG) : '';
    case 'number': {
      const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
      return Number.isFinite(n) ? n : null;
    }
    case 'select': {
      const values = (f.options ?? []).map(optionValue);
      if (typeof v === 'string' && values.includes(v)) return v;
      return typeof f.defaultValue === 'string' && values.includes(f.defaultValue) ? f.defaultValue : null;
    }
    case 'upload': {
      // A media id. An object (old Payload format, or the site's resolved form) is read as its id.
      const id = typeof v === 'string' ? v : typeof obj(v).id === 'string' ? (obj(v).id as string) : null;
      return id && /^[\w-]{1,40}$/.test(id) ? id : null;
    }
    case 'group':
      return parseFields(f.fields ?? [], v);
    case 'array':
      return (Array.isArray(v) ? v : []).slice(0, Math.min(f.maxRows ?? MAX_ROWS, MAX_ROWS)).map((row, i) => ({ id: rowId(obj(row).id, i), ...parseFields(f.fields ?? [], row) }));
    default:
      return null;
  }
}

export function parseFields(fields: Field[], raw: unknown): Record<string, unknown> {
  const o = obj(raw);
  const out: Record<string, unknown> = {};
  for (const f of flatFields(fields)) if (f.name) out[f.name] = parseValue(f, o[f.name]);
  return out;
}

/** A new, empty item for a list field (texts empty, choices at their default). */
export function emptyRow(field: Field, id: string): Record<string, unknown> {
  return { id, ...parseFields(field.fields ?? [], {}) };
}
