import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '@/access/isLoggedIn'
import { isAdmin } from '../access/isAdmin'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'messageTitle',
    hidden: ({ user }) => !user?.roles?.includes('admin'),
  },
   access: {
      //amyone can create an account
      create: isAdmin,
      read: isLoggedIn,
      update: isAdmin,
      delete: isAdmin,
    },
  fields: [
    //email
    {
      name: 'useremail',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

    //notification message title
    {
      name: 'messageTitle',
      type: 'text',
      required: true,
    },
     //notification message nody
     {
      name: 'message body',
      type: 'text',
      required: true,
    },
    //notification type
    {
      name: 'type',
      type: 'select',
      options: ['sales', 'update', 'other'],
      defaultValue: 'update',
      required: true,
    },
    //notification status
    {
      name: 'status',
      type: 'select',
      options: ['ready to delever', 'delevared'],
      defaultValue: 'ready to delever',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (req.user) {
          data.useremail = req.user.email
        }

        return data
      },
    ],
  },
}
