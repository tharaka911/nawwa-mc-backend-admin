import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '@/access/isLoggedIn'
// import { isAdminOrMediaCreatedUser } from '@/access/isAdminOrMediaCreatedUser'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: ({ user }) => !user?.roles?.includes('admin'),
  },
  access: {
    create: isLoggedIn,
    read: () => true,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'useremail',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.user) {
          data.useremail = req.user.email
        }
        return data
      },
    ],
  },
  upload: true,
}
