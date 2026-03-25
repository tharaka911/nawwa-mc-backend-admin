import type { CollectionConfig } from 'payload'
import { isAdminOrSelf } from '../access/isAdminOrSelf'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isAdminCreate } from '../access/isAdminCreates'


export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // verify: true,
    useAPIKey: true,
    // Allow users without passwords (for Google OAuth)
    // disableLocalStrategy: true,
  },
  access: {
    // anyone can create an account 
    create: () => true,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,

    // only allow admins to access admin panel
    admin: ({ req: { user } }) => {
      return !!(user && Array.isArray(user.roles) && user.roles.includes('admin'));
    },
  },

  fields: [
    // name
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      label: 'Roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['customer'],
      access: {
        create: isAdminCreate,
        update: isAdminFieldLevel,
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Rider',
          value: 'rider',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
    },

    // address block
    {
      type: 'row',
      fields: [
        // address line 1
        {
          name: 'addressLine1',
          label: 'Address Line 1',
          type: 'text',
        },

        // address line 2
        {
          name: 'addressLine2',
          label: 'Address Line 2',
          type: 'text',
        },

        // city
        {
          name: 'city',
          label: 'City',
          type: 'text',
        },
      ],
    },

    // phone
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
    },
    
    // profile image
    {
      name: 'profileImage',
      label: 'Profile Image',
      type: 'upload',
      relationTo: 'media',
      defaultValue: '67c1babd9f41846dd16b48c8',
    },
  ],
}
