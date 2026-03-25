import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })


  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://nawwa-test-bucket.s3.ap-southeast-1.amazonaws.com/logo.webp" />
          <Image
            alt="Payload Logo"
            height={165}
            src="https://nawwa-test-bucket.s3.ap-southeast-1.amazonaws.com/logo.webp"
            width={165}
          />
        </picture>
        {!user && <h1>Welcome to Nawwa MC Admin Panel.</h1>}
        
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          {/* <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a> */}
        </div>
      </div>
      {/* <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div> */}
    </div>
  )
}
