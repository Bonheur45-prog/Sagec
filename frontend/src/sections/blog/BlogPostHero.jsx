import { useParams } from 'react-router-dom'
import PageHeader from '@components/ui/PageHeader'
import { useBlogPost } from '@hooks/useBlog'
import { useBlogCopy } from '@hooks/useBlogPage'
import { mediaURL } from '@lib/api'

export default function BlogPostHero() {
  const { slug } = useParams()
  const { data: post } = useBlogPost(slug)
  const copy = useBlogCopy('post')

  // While the post is loading (or if it 404s), fall back to a generic
  // header rather than showing nothing — BlogPostContent below handles
  // the actual loading/error/not-found states in detail.
  return (
    <PageHeader
      title={post?.title ?? copy.heroTitle}
      breadcrumbParent={{ label: copy.breadcrumbParentLabel, to: '/blog' }}
      breadcrumbLabel={post?.title ?? copy.heroTitle}
      backgroundImage={post?.coverImage?.url ? mediaURL(post.coverImage.url) : undefined}
    />
  )
}
