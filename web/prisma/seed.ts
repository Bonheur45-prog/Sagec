/*
 * Fills the database with the starting content the site needs:
 * the Site settings row, with SAGEC's current company details (src/lib/cms/settings-defaults.ts).
 *
 *   npm run db:seed
 *
 * Safe to run again: it only creates what is missing and never overwrites edits made in the CMS.
 * The header and footer need no seed: until they are published the site uses the starter versions
 * in src/lib/cms/globals-model.ts. Later phases add their starter content here.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_SETTINGS } from '../src/lib/cms/settings-defaults';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: rely on variables already set in the shell.
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  if (await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { id: true } })) {
    console.log('Site settings already exist: left as they are.');
    return;
  }
  const d = DEFAULT_SETTINGS;
  await prisma.siteSettings.create({
    data: { id: 1, ...d, businessHours: [...d.businessHours], socials: [...d.socials] },
  });
  console.log('Created the Site settings with SAGEC’s current details.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
