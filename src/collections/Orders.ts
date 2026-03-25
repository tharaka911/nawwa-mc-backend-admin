import type { CollectionConfig } from 'payload'
import { isAdminOrCustomer } from '../access/isAdminOrCustomer'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isAdminOrMediaCreatedUser } from '@/access/isAdminOrMediaCreatedUser'
import { v4 as uuidv4 } from 'uuid' // Import UUID library

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'useremail',
  },
  access: {
    create: isAdminOrCustomer,
    read: isAdminOrMediaCreatedUser,
    update: isAdminOrMediaCreatedUser,
    delete: isAdmin,
  },
  
  fields: [
    {
      name: 'orderStatus',
      label: 'Order Status',
      type: 'select',
      options: ['pending', 'rejected', 'approved for delivery','In Transit' ,'Delivery Success'],
      defaultValue: 'pending',
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    //email
    {
      name: 'useremail',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

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

    //total price of the order
    {
      name: 'totalPrice',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },

    //adress block
    {
      type: 'row',
      fields: [
        //address line 1
        {
          name: 'addressLine1',
          label: 'Address Line 1',
          type: 'text',
        },

        //address line 2
        {
          name: 'addressLine2',
          label: 'Address Line 2',
          type: 'text',
        },

        //city
        {
          name: 'city',
          label: 'City',
          type: 'text',
        },
      ],
    },

    //phone
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
    },

    //geo location
    {
      name: 'location',
      label: 'location',
      type: 'text',
    },

    //order status
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
      

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

        return data
      },
    ],

    afterChange: [
      async ({ doc, req, previousDoc }) => {
        if (
          doc.orderStatus === 'approved for delivery' &&
          previousDoc.orderStatus !== 'approved for delivery'
        ) {
          await req.payload.create({
            collection: 'deliveries',
            data: {
              deleveryId: uuidv4(),
              products: doc.products,
              totalPrice: doc.totalPrice,
              addressLine1: doc.addressLine1,
              addressLine2: doc.addressLine2,
              city: doc.city,
              phone: doc.phone,
              location: doc.location,
              deliveryStatus: 'pending',
              orderedPersonEmail: doc.useremail,
              orderId: doc.id,
            },
          })

          //send email to the using payload resend email function
          await req.payload.sendEmail({
            to: doc.useremail,
            subject: 'Admin Approved your order for delivery',
            text: `Your order has been approved for delivery. Your order ID is ${doc.id}`,
          })

        }
      },
    ],
  },
}
