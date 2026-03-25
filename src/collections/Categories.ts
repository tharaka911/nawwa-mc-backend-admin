import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isLoggedIn } from '../access/isLoggedIn'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: isAdmin,
    read: isLoggedIn,
    update: isAdmin,
    delete: isAdmin,
  },

  fields: [
    //name
    {
      name: 'name',
      type: 'text',
      required: true,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },

    },
    //discription
    {
      name: 'description',
      type: 'textarea',
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
  ],
}
