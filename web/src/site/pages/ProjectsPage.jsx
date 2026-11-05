'use client';

import Seo from '@components/ui/Seo'
import ProjectsHero    from '@sections/projects/ProjectsHero'
import ProjectsStats   from '@sections/projects/ProjectsStats'
import FeaturedProject from '@sections/projects/FeaturedProject'
import ProjectsGrid    from '@sections/projects/ProjectsGrid'
import ProjectsCTA     from '@sections/projects/ProjectsCTA'

export default function ProjectsPage() {
  return (
    <>
      <Seo pageKey="projects" title="Our Projects" description="Explore landmark commercial, residential, and interior design projects delivered by SAGEC Ltd across Rwanda." path="/projects" />
      <ProjectsHero />
      <ProjectsStats />
      <FeaturedProject />
      <ProjectsGrid />
      <ProjectsCTA />
    </>
  )
}