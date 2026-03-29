import type { CollectionConfig, PayloadRequest } from 'payload'
import { isAdminOrSelf } from '../access/isAdminOrSelf'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isAdminCreate } from '../access/isAdminCreates'
import crypto from 'crypto'


export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !user?.roles?.includes('admin'),
  },
  auth: {
    verify: {
      generateEmailHTML: ({ token, user }) => {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/verify-email?token=${token}`

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
            <p>Hello <strong>${user.name || 'User'}</strong>,</p>
            <p>Thank you for signing up with Nawwa! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #007bff; text-align: center; word-break: break-all;">${url}</p>
          </div>
        `
      },
      generateEmailSubject: () => 'Verify your Nawwa account',
    },
    useAPIKey: true,
  },
  access: {
    // anyone can create an account 
    create: () => true,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,

    // allow admins and riders to access admin panel
    admin: ({ req: { user } }) => {
      return !!(user && Array.isArray(user.roles) && (user.roles.includes('admin') || user.roles.includes('rider')));
    },
  },
  hooks: {
    afterLogin: [
      async ({ user, req }: { user: any; req: PayloadRequest }) => {
        if (!user.apiKey) {
          const apiKey = crypto.randomBytes(24).toString('hex')
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
              apiKey,
            },
          })
        }
      },
    ],
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
    // Explicitly hide apiKey from regular users
    {
      name: 'apiKey',
      type: 'text',
      access: {
        read: ({ req: { user }, doc }) => {
          if (user?.roles?.includes('admin')) return true
          if (user?.id === doc?.id) return true
          return false
        },
      },
    },
    {
      name: 'enableAPIKey',
      type: 'checkbox',
      access: {
        read: ({ req: { user }, doc }) => {
          if (user?.roles?.includes('admin')) return true
          if (user?.id === doc?.id) return true
          return false
        },
      },
    },
  ],
}
