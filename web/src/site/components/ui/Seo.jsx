/**
 * Page titles, descriptions and share previews are now written by the server before the page is sent
 * (generateMetadata in src/app/(site), from CMS → Pages → Search & sharing), so search engines and
 * link previews see them without running any JavaScript. The pages still render <Seo …/>; it draws nothing.
 */
export default function Seo() {
  return null
}
