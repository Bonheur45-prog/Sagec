/**
 * SEED: Contact Page Global
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx src/seed/seedContactPage.ts
 *
 * Guarded like the other global seeders: skipped if hero.headline
 * is already set. Phone/email/address are NOT here on purpose —
 * they live in Company Info (see seedCompanyInfo.ts) and the
 * Contact page reads them from there, so they're only ever edited
 * in one place.
 *
 * NOTE ("How can we help?" form copy): the CMS's `form` field group
 * only models a single "name" field, while the actual form on the
 * site has separate First Name / Last Name / Organisation / Subject
 * fields and a Personal/Company toggle. This seeder maps what has a
 * matching field (labels, placeholders, submit/success/error text,
 * core validation messages) — the rest (Last Name, Organisation,
 * Subject labels, the toggle) stay hardcoded in ContactMain.jsx for
 * now. Extending the schema to cover those is a bigger change than
 * "wire what exists," so it's left for a follow-up.
 * ─────────────────────────────────────────────────────────────
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../../.env') })

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  const current = await payload.findGlobal({ slug: 'contact-page' })
  if (current?.hero?.headline) {
    console.log('ContactPage already has content (hero.headline is set) — skipping to avoid overwriting your edits.')
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'contact-page',
    data: {
      hero: {
        eyebrow: 'Reach Out',
        headline: "Let's Talk",
        subline: 'Tell us about your vision and our team will get back to you within 24 hours.',
      },
      infoSection: {
        eyebrow: 'Contact Details',
        heading: "We're Here For You",
      },
      form: {
        eyebrow: 'Send us a message',
        heading: 'How can we help?',
        nameLabel: 'First Name',
        namePlaceholder: 'John',
        emailLabel: 'Email Address',
        emailPlaceholder: 'john@example.com',
        phoneLabel: 'Phone Number',
        phonePlaceholder: '+250 7XX XXX XXX',
        messageLabel: 'Message',
        messagePlaceholder: 'Describe your project or enquiry in detail...',
        submitLabel: 'Send Message',
        submitLoadingLabel: 'Sending...',
        successMessage: "\u2713 Message sent! We'll get back to you within 24 hours.",
        errorMessage: 'Something went wrong. Please try again or email us directly.',
        validationNameRequired: 'First name is required',
        validationEmailRequired: 'Email is required',
        validationEmailInvalid: 'Enter a valid email',
        validationPhoneRequired: 'Phone number is required',
        validationMessageRequired: 'Message is required',
      },
      map: {
        label: 'SAGEC Ltd — Kigali, Rwanda',
        title: 'SAGEC Ltd',
        subtitle: 'Architectural & Engineering Solutions',
        embedSrc:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.1908685827!2d29.92358695!3d-1.9440727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1699000000000!5m2!1sen!2srw',
        directionsLink: 'https://maps.google.com/?q=Kigali,Rwanda',
        directionsLabel: 'Get Directions',
      },
    },
  })

  console.log('\nContactPage Global seeded ✓')
  process.exit(0)
}

run()
