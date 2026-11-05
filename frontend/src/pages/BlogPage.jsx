import Seo from '@components/ui/Seo';
import BlogHero from '@sections/blog/BlogHero';
import BlogGrid from '@sections/blog/BlogGrid';

export default function BlogPage() {
  return (
    <>
      <Seo pageKey="blog" title="Blog" description="Insights on architecture, engineering, and construction in Rwanda from the SAGEC Ltd team." path="/blog" />
      <BlogHero />
      <BlogGrid />
    </>
  );
}
