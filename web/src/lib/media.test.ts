import { test } from 'node:test';
import assert from 'node:assert/strict';
import imageLoader from './image-loader';
import { photoUrl } from './media';

const KEY = 'uploads/2026/10/abc123.webp';
const variants = [
  { w: 480, h: 270, key: 'uploads/2026/10/abc123-480.webp' },
  { w: 960, h: 540, key: 'uploads/2026/10/abc123-960.webp' },
  { w: 1600, h: 900, key: 'uploads/2026/10/abc123-1600.webp' },
];

test('a photo address lists its stored widths; videos and odd entries are left plain', () => {
  process.env.R2_PUBLIC_HOSTNAME = 'media.sagecltd.com';
  assert.equal(photoUrl({ objectKey: KEY, width: 2400, variants, kind: 'IMAGE' }), `https://media.sagecltd.com/${KEY}#w=480.960.1600~2400`);
  // a small original has no smaller copies
  assert.equal(photoUrl({ objectKey: KEY, width: 400, variants: [], kind: 'IMAGE' }), `https://media.sagecltd.com/${KEY}#w=~400`);
  // copies stored under another name are ignored (the loader rebuilds the name from the width)
  assert.equal(photoUrl({ objectKey: KEY, width: 2400, variants: [{ w: 480, h: 1, key: 'elsewhere/x.webp' }], kind: 'IMAGE' }), `https://media.sagecltd.com/${KEY}#w=~2400`);
  assert.equal(photoUrl({ objectKey: 'uploads/2026/10/v.mp4', width: 1920, kind: 'VIDEO', mimeType: 'video/mp4' }), 'https://media.sagecltd.com/uploads/2026/10/v.mp4');
});

test('the loader serves the smallest stored copy at least as wide as asked, else the original', () => {
  const src = `https://media.x.rw/${KEY}#w=480.960.1600~2400`;
  assert.equal(imageLoader({ src, width: 256 }), 'https://media.x.rw/uploads/2026/10/abc123-480.webp');
  assert.equal(imageLoader({ src, width: 480 }), 'https://media.x.rw/uploads/2026/10/abc123-480.webp');
  assert.equal(imageLoader({ src, width: 640 }), 'https://media.x.rw/uploads/2026/10/abc123-960.webp');
  assert.equal(imageLoader({ src, width: 1280 }), 'https://media.x.rw/uploads/2026/10/abc123-1600.webp');
  assert.equal(imageLoader({ src, width: 1920 }), `https://media.x.rw/${KEY}`);
  assert.equal(imageLoader({ src: `https://media.x.rw/${KEY}#w=~400`, width: 1920 }), `https://media.x.rw/${KEY}`);
});
