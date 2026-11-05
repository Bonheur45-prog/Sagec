import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateComment, validateContact, validateSubscribe } from './forms-validation';

const fd = (o: Record<string, string>) => {
  const d = new FormData();
  for (const [k, v] of Object.entries(o)) d.set(k, v);
  return d;
};
const contact = { first_name: 'Aline', last_name: 'Uwase', email: 'Aline@Example.rw', phone: '+250 788 000 000', category: 'personal', subject: 'New house', message: 'We want to build a family house in Kigali.' };

test('contact: a complete message is accepted and cleaned', () => {
  const r = validateContact(fd(contact));
  assert.equal(r.status, 'ok');
  if (r.status !== 'ok') return;
  assert.equal(r.data.name, 'Aline Uwase');
  assert.equal(r.data.email, 'aline@example.rw');
  assert.equal(r.data.organisation, '', 'organisation only kept for companies');
});

test('contact: missing fields come back with the typed values; companies need their name', () => {
  const r = validateContact(fd({ ...contact, email: 'nope', message: 'hi', category: 'company' }));
  assert.equal(r.status, 'done');
  if (r.status !== 'done') return;
  assert.equal(r.state.status, 'error');
  assert.ok(r.state.fieldErrors?.email && r.state.fieldErrors?.message && r.state.fieldErrors?.organisation);
  assert.equal(r.state.values?.first_name, 'Aline', 'what was typed is kept');
});

test('bots (hidden field filled) never get a success message, on any form', () => {
  for (const r of [validateContact(fd({ ...contact, hp: 'x' })), validateComment(fd({ name: 'Bot', email: 'b@b.co', message: 'spam', hp: 'x' })), validateSubscribe(fd({ email: 'b@b.co', hp: 'x' }))]) {
    assert.equal(r.status, 'done');
    if (r.status === 'done') assert.equal(r.state.status, 'error');
  }
});

test('comments and newsletter: checks', () => {
  const c = validateComment(fd({ name: 'Jean', email: 'jean@x.rw', website: 'sagec.rw', message: 'Great article.' }));
  assert.ok(c.status === 'ok' && c.data.website === 'https://sagec.rw/');
  const bad = validateComment(fd({ name: 'J', email: 'x', message: '' }));
  assert.ok(bad.status === 'done' && bad.state.fieldErrors?.name && bad.state.fieldErrors?.email && bad.state.fieldErrors?.message);
  const s = validateSubscribe(fd({ email: ' News@SAGEC.rw ' }));
  assert.ok(s.status === 'ok' && s.data.email === 'news@sagec.rw');
});
