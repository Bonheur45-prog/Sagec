import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { cloudinaryStorage } from 'payload-cloudinary'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { ServicesPage } from './globals/ServicesPage'
import { Projects } from './collections/Projects'
import { ProjectsPage } from './globals/ProjectsPage'
import { Testimonials } from './collections/Testimonials'
import { TestimonialsPage } from './globals/TestimonialsPage'
import { CompanyInfo } from './globals/CompanyInfo'
import { ContactPage } from './globals/ContactPage'
import { Tags } from './collections/Tags'
import { BlogAuthors } from './collections/BlogAuthors'
import { BlogPosts } from './collections/BlogPosts'
import { BlogComments } from './collections/BlogComments'
import { AboutPage } from './globals/AboutPage'
import { HomePage } from './globals/HomePage'
import { SeoSettings } from './globals/SeoSettings'
import { BlogPage } from './globals/BlogPage'
import { Partners } from './collections/Partners'
import { ContactSubmissions } from './collections/ContactSubmissions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Cloudinary is OFF by default — Media just uses Payload's built-in local
// disk storage, exactly like before. The moment real credentials are added
// to .env (all three vars below), uploads switch to Cloudinary automatically.
// No code change needed to turn it on later.
const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

// Local dev origins + live frontend origin(s). Set FRONTEND_URLS on the server
// as a comma-separated list, e.g. https://sagecltd.com,https://www.sagecltd.com
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5174',
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
]

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
    graphics: {
      Logo: '/components/admin/Logo#Logo',
      Icon: '/components/admin/Logo#Icon',
    },
    beforeDashboard: ['/components/admin/BeforeDashboard#BeforeDashboard'],
    beforeLogin: ['/components/admin/BeforeLogin#BeforeLogin'],
  },
  },
  cors: allowedOrigins,
  collections: [Users, Media, Services, Projects, Testimonials, Tags, BlogAuthors, BlogPosts, BlogComments, Partners, ContactSubmissions],
  globals: [ServicesPage, ProjectsPage, CompanyInfo, ContactPage, TestimonialsPage, AboutPage, HomePage, SeoSettings, BlogPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    cloudinaryStorage({
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
        api_key: process.env.CLOUDINARY_API_KEY || '',
        api_secret: process.env.CLOUDINARY_API_SECRET || '',
      },
      collections: {
        media: true,
      },
      folder: 'sagec-media',
      disableLocalStorage: true,
      enabled: cloudinaryEnabled,
    }),
  ],
})