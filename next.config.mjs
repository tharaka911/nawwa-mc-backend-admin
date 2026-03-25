import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nawwa-test-bucket.s3.ap-southeast-1.amazonaws.com',
        pathname: '**',
      },
    ],
  },
  output: 'standalone',
  // Your Next.js config here
}

export default withPayload(nextConfig)
