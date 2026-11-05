// The settings SAGEC starts with: the values the current site uses (cms/src/seed/seedCompanyInfo.ts
// and seedSeo.ts). Used by the seed (npm run db:seed) and as the form's starting values before the
// first save. Nothing here is shown to visitors once Site settings has been saved.

export const DEFAULT_SETTINGS = {
  companyName: 'SAGEC Ltd',
  legalName: 'SAGEC Ltd',
  tagline:
    'Delivering landmark architectural and engineering construction projects across Rwanda and East Africa — built to last, designed to inspire.',
  footerDescription: '',
  phone: '+250 788 470 243',
  secondaryPhone: '',
  publicEmail: 'sagecltd@gmail.com',
  notificationEmail: 'sagecltd@gmail.com',
  whatsappNumber: '250788470243',
  whatsappLabel: 'Chat on WhatsApp',
  responseNote: 'Prefer a quick reply? WhatsApp is the fastest way to reach our team.',
  addressStreet: '', // TODO: SAGEC's street address (helps Google show the office on maps)
  addressCity: 'Kigali',
  addressCountry: 'Rwanda',
  addressCountryCode: 'RW',
  businessHours: [
    { day: 'Monday – Friday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 1:00 PM' },
  ],
  // The old site's social links were placeholders (https://instagram.com …), so none are carried over.
  // TODO: add SAGEC's real social pages in Site settings.
  socials: [] as { platform: string; url: string }[],
  seoTitle: 'SAGEC Ltd — Architectural and Engineering Solutions',
  seoDescription:
    "SAGEC Ltd — Architectural and Engineering Solutions. Rwanda's leading firm delivering innovative architecture, engineering, and construction excellence in Kigali.",
  titleTemplate: '%s | SAGEC Ltd',
} as const;
