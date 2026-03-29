import type { CollectionConfig } from 'payload'
import { isOwner } from '../access/isOwner'
import { isAdminOrMediaCreatedUser } from '../access/isAdminOrMediaCreatedUser'
import { isAdminOrCustomer } from '../access/isAdminOrCustomer'

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    useAsTitle: 'useremail',
    hidden: ({ user }) => !user?.roles?.includes('admin'),
  },
  access: {
    create: isAdminOrCustomer,
    read: isAdminOrMediaCreatedUser,
    update: isAdminOrMediaCreatedUser,
    delete: isAdminOrMediaCreatedUser,
  },

  fields: [
    //useremail
    {
      name: 'useremail',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

    //need product array with number of products
    {
      name: 'products',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
        },
      ],
    },

    //total price
    {
      name: 'totalPrice',
      label: 'Total Price',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },

    //status
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'make a order',
          value: 'make a order',
        },
      ],
      defaultValue: 'pending',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (req.user) {
          data.useremail = req.user.email
        }

        if (data.products && Array.isArray(data.products)) {
          let totalPrice = 0

          for (const item of data.products) {
            const product = await req.payload.findByID({
              collection: 'products',
              id: item.product,
            })

            if (product) {
              totalPrice += product.price * item.quantity
            }
          }

          data.totalPrice = totalPrice
        }

        // Prevent changing status back to "pending"
        if (originalDoc?.status === 'make a order' && data.status === 'pending') {
          throw new Error('Cannot change status back to pending once it is set to make a order')
        }

        // Decrease stock in products collection only when creating or changing status to "make a order"
        if (
          !originalDoc ||
          (originalDoc.status !== 'make a order' && data.status === 'make a order')
        ) {
          for (const item of data.products) {
            const product = await req.payload.findByID({
              collection: 'products',
              id: item.product,
            })

            if (product) {
              const newStock = product.stock - item.quantity
              await req.payload.update({
                collection: 'products',
                id: item.product,
                data: {
                  stock: newStock,
                },
              })
            }
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, previousDoc }) => {
        // Check if status is changed to "make a order"
        if (doc.status === 'make a order' && previousDoc.status !== 'make a order') {
          await req.payload.create({
            collection: 'orders',
            data: {
              useremail: doc.useremail,
              products: doc.products,
              totalPrice: doc.totalPrice,
              orderStatus: 'pending',
            },
          })
        }
      },
    ],
  },
}
