import Seo from '@components/ui/Seo'
import ContactHero from '@sections/contact/ContactHero'
import ContactMain from '@sections/contact/ContactMain'
import ContactMap  from '@sections/contact/ContactMap'

export default function ContactPage() {
  return (
    <>
      <Seo pageKey="contact" title="Contact Us" description="Get in touch with SAGEC Ltd for your next architecture, engineering, or construction project in Rwanda." path="/contact" />
      <ContactHero />
      <ContactMain />
      <ContactMap />
    </>
  )
}