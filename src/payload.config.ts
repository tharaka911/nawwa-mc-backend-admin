import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { openapi, scalar } from 'payload-oapi'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Carts } from './collections/Carts'
import { Orders } from './collections/Orders'
import { Notifications } from './collections/Notifications'
import { Deliveries} from './collections/Deliveries'
import { Cars } from './collections/Cars'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  email: resendAdapter({
    defaultFromAddress: 'admin@noreply.macna.app',
    defaultFromName: 'admin',
    apiKey: process.env.RESEND_API_KEY || '',
  }),

  admin: {
    user: Users.slug,

    components: {
      graphics: {
        Logo: '@/app/(payload)/graphics/Logo.tsx',
      },  
    },
  },

  collections: [Users, Media, Categories, Products, Carts, Orders, Notifications, Deliveries, Cars],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
      },
    }),
    openapi({
       openapiVersion: '3.1',
       metadata: {
         title: 'Nawwa MECOM API',
         version: '1.0.0',
       },
    }),
    scalar({
       docsUrl: '/docs',
       specEndpoint: '/openapi.json',
    }),
  ],
  // cors: "*",
  // csrf: process.env.CSRF_URLS ? process.env.CSRF_URLS.split(",") : [],
})
