import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../access/isLoggedIn'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'


export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => !user?.roles?.includes('admin'),
  },
  access: {
    create: isAdmin,
    read: () => true,
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

    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    //discription
    {
      name: 'description',
      type: 'textarea',access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },

    },
    //price
    {
      name: 'price',
      type: 'number',
      required: true,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    //stock
    {
      name: 'stock',
      type: 'number',
      required: true,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    //image
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },


   
  ],
}
