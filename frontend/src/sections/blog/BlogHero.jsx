import PageHeader from '@components/ui/PageHeader'
import { useBlogCopy } from '@hooks/useBlogPage'
import { mediaURL } from '@lib/api'

export default function BlogHero() {
  const hero = useBlogCopy('hero')

  return (
    <PageHeader
      title={hero.title}
      breadcrumbLabel={hero.breadcrumbLabel}
      backgroundImage={mediaURL(hero.backgroundImage?.url) || hero.backgroundImage}
    />
  )
}
