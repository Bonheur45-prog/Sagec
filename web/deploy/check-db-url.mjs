// Used by the deploy and import workflows before touching the database.
// Tidies the DATABASE_URL secret (a line copied from .env often keeps `DATABASE_URL=` or the quotes) and,
// if it still is not a valid address, stops with a clear message that never shows the password.
import { appendFileSync } from 'node:fs';

let raw = (process.env.DATABASE_URL ?? '').trim();
raw = raw.replace(/^DATABASE_URL\s*=\s*/, '').trim();
raw = raw.replace(/^(['"])(.*)\1$/s, '$2').trim();

const fail = (why) => {
  console.log(`::error title=DATABASE_URL secret::${why} Expected: postgresql://sagec:PASSWORD@localhost:5432/sagec?schema=public (no quotes, no "DATABASE_URL=").`);
  process.exit(1);
};

if (!raw) fail('It is empty.');
if (/[<>\s]/.test(raw)) fail('It contains a space or < > (a placeholder like <password> left in?).');
let u;
try {
  u = new URL(raw);
} catch {
  fail('It is not a valid address. If the password has characters like # / ? @ :, make a new password with only letters and numbers.');
}
if (!/^postgres(ql)?:$/.test(u.protocol)) fail(`It must start with postgresql:// (it starts with ${u.protocol}//).`);
if (!u.username || !u.password) fail('The user name or password is missing.');
if (u.port && !/^\d+$/.test(u.port)) fail('The port is not a number.');
if (u.pathname.length < 2) fail('The database name is missing (…:5432/sagec).');

console.log(`::add-mask::${raw}`);
console.log(`::add-mask::${decodeURIComponent(u.password)}`);
console.log(`Database address OK: user ${u.username}, host ${u.hostname}, port ${u.port || 5432}, database ${u.pathname.slice(1)}.`);
if (process.env.GITHUB_ENV) appendFileSync(process.env.GITHUB_ENV, `DATABASE_URL=${raw}\n`);
