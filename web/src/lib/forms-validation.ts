// Pure checks for the public forms (tested in forms.test.ts). The field names match the current SAGEC
// contact form (frontend/src/sections/contact/ContactMain.jsx), so the ported form keeps working.

export type FormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Record<string, string>;
  /** What the visitor typed, sent back with an error so the form can show it again. */
  values?: Record<string, string>;
};

type Result<T> = { status: 'ok'; data: T; values: Record<string, string> } | { status: 'done'; state: FormState };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const field = (data: FormData, key: string, max = 2000) =>
  String(data.get(key) ?? '')
    .trim()
    .slice(0, max);

/** A filled hidden "hp" field means a bot. It gets a neutral error and nothing is saved or sent. */
const BOT: FormState = { status: 'error', message: 'Your message could not be sent. Please try again.' };

export type ContactData = { name: string; email: string; phone: string; category: string; organisation: string; subject: string; message: string; source: string };

export function validateContact(data: FormData): Result<ContactData> {
  if (field(data, 'hp')) return { status: 'done', state: BOT };
  const first = field(data, 'first_name', 60);
  const last = field(data, 'last_name', 60);
  const values = {
    first_name: first,
    last_name: last,
    email: field(data, 'email', 200),
    phone: field(data, 'phone', 40),
    category: field(data, 'category', 20) === 'company' ? 'company' : 'personal',
    organisation: field(data, 'organisation', 200),
    subject: field(data, 'subject', 300),
    message: field(data, 'message', 5000),
  };
  const fieldErrors: Record<string, string> = {};
  if (first.length < 2) fieldErrors.first_name = 'Please enter your first name.';
  if (!EMAIL.test(values.email)) fieldErrors.email = 'Please enter a valid email address.';
  if (values.phone && !/^\+?[\d\s()-]{7,25}$/.test(values.phone)) fieldErrors.phone = 'Please enter a valid phone number.';
  if (values.category === 'company' && !values.organisation) fieldErrors.organisation = 'Please enter your company name.';
  if (!values.subject) fieldErrors.subject = 'Please add a subject.';
  if (values.message.length < 10) fieldErrors.message = 'Please write a little more (at least 10 characters).';
  if (Object.keys(fieldErrors).length) return { status: 'done', state: { status: 'error', message: 'Please check the highlighted fields.', fieldErrors, values } };
  return {
    status: 'ok',
    values,
    data: {
      name: `${first} ${last}`.trim(),
      email: values.email.toLowerCase(),
      phone: values.phone,
      category: values.category,
      organisation: values.category === 'company' ? values.organisation : '',
      subject: values.subject,
      message: values.message,
      source: field(data, 'source', 120) || 'Contact page',
    },
  };
}

export type CommentData = { name: string; email: string; website: string; text: string };

export function validateComment(data: FormData): Result<CommentData> {
  if (field(data, 'hp')) return { status: 'done', state: BOT };
  const values = { name: field(data, 'name', 120), email: field(data, 'email', 200), website: field(data, 'website', 300), text: field(data, 'message', 3000) };
  const fieldErrors: Record<string, string> = {};
  if (values.name.length < 2) fieldErrors.name = 'Please enter your name.';
  if (!EMAIL.test(values.email)) fieldErrors.email = 'Please enter a valid email address.';
  let website = '';
  if (values.website) {
    try {
      const u = new URL(/^https?:\/\//i.test(values.website) ? values.website : `https://${values.website}`);
      if (u.protocol === 'https:' || u.protocol === 'http:') website = u.toString();
    } catch {
      fieldErrors.website = 'Please enter a valid web address, or leave it empty.';
    }
  }
  if (values.text.length < 3) fieldErrors.message = 'Please write your comment.';
  if (Object.keys(fieldErrors).length) return { status: 'done', state: { status: 'error', message: 'Please check the highlighted fields.', fieldErrors, values } };
  return { status: 'ok', values, data: { name: values.name, email: values.email.toLowerCase(), website, text: values.text } };
}

export function validateSubscribe(data: FormData): Result<{ email: string; source: string }> {
  if (field(data, 'hp')) return { status: 'done', state: BOT };
  const email = field(data, 'email', 200).toLowerCase();
  if (!EMAIL.test(email)) return { status: 'done', state: { status: 'error', message: 'Please enter a valid email address.', fieldErrors: { email: 'Please enter a valid email address.' }, values: { email } } };
  return { status: 'ok', values: { email }, data: { email, source: field(data, 'source', 120) || 'Website' } };
}
