import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PageLoader from '@components/ui/PageLoader'
import Layout from '@components/layout/Layout'

const HomePage           = lazy(() => import('@pages/HomePage'))
const AboutPage          = lazy(() => import('@pages/AboutPage'))
const ServicesPage       = lazy(() => import('@pages/ServicesPage'))
const ServiceDetailPage  = lazy(() => import('@pages/ServiceDetailPage'))
const ProjectsPage       = lazy(() => import('@pages/ProjectsPage'))
const ProjectDetailPage  = lazy(() => import('@pages/ProjectDetailPage'))
const TestimonialsPage   = lazy(() => import('@pages/TestimonialsPage'))
const CareersPage        = lazy(() => import('@pages/CareersPage'))
const BlogPage           = lazy(() => import('@pages/BlogPage'))
const BlogPostPage       = lazy(() => import('@pages/BlogPostPage'))
const ContactPage        = lazy(() => import('@pages/ContactPage'))
const NotFoundPage       = lazy(() => import('@pages/NotFoundPage'))

// Wraps a lazy component in Suspense — called inline in route elements
const Wrap = ({ Component }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout hasHero={true} />,
    children: [
      { index: true, element: <Wrap Component={HomePage} /> },
    ],
  },
  {
    path: '/',
    element: <Layout hasHero={false} />,
    children: [
      { path: 'about',          element: <Wrap Component={AboutPage} /> },
      { path: 'services',       element: <Wrap Component={ServicesPage} /> },
      { path: 'services/:slug', element: <Wrap Component={ServiceDetailPage} /> },
      { path: 'projects',       element: <Wrap Component={ProjectsPage} /> },
      { path: 'projects/:slug', element: <Wrap Component={ProjectDetailPage} /> },
      { path: 'testimonials',   element: <Wrap Component={TestimonialsPage} /> },
      { path: 'careers',        element: <Wrap Component={CareersPage} /> },
      { path: 'blog',           element: <Wrap Component={BlogPage} /> },
      { path: 'blog/:slug',     element: <Wrap Component={BlogPostPage} /> },
      { path: 'contact',        element: <Wrap Component={ContactPage} /> },
    ],
  },
  {
    path: '*',
    element: <Wrap Component={NotFoundPage} />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

export default router
