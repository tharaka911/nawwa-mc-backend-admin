import React from 'react'
import Image from 'next/image'

const Logo = () => (
  <div>
    <Image
      src="https://nawwa-test-bucket.s3.ap-southeast-1.amazonaws.com/logo.webp"
      alt="Logo"
      width={250}
      height={250}
    />
  </div>
)

export default Logo
