import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isAdminOrRider } from '../access/isAdminOrRider'
import { v4 as uuidv4 } from 'uuid' // Import UUID library


export const Deliveries: CollectionConfig = {
  slug: 'deliveries',
  admin: {
    useAsTitle: 'deleveryId',
  },
  access: {
    create: isAdmin,
    read: isAdminOrRider,
    update: isAdminOrRider,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'deliveryStatus',
      label: 'Delivery Status',
      type: 'select',
      options: ['pending', 'in transit', 'delivered'],
      defaultValue: 'pending',
    },
    {
      name: 'orderedPersonEmail',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'orderId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'deleveryId',
      type: 'text',
      admin: {
        readOnly: true,
      },
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
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
          access: {
            create: isAdminFieldLevel,
            update: isAdminFieldLevel,
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          access: {
            create: isAdminFieldLevel,
            update: isAdminFieldLevel,
          },
        },
      ],
    },
    {
      name: 'totalPrice',
      type: 'number',
      admin: {
        readOnly: true,
      },
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'addressLine1',
          label: 'Address Line 1',
          type: 'text',
          access: {
            create: isAdminFieldLevel,
            update: isAdminFieldLevel,
          },
        },
        {
          name: 'addressLine2',
          label: 'Address Line 2',
          type: 'text',
          access: {
            create: isAdminFieldLevel,
            update: isAdminFieldLevel,
          },
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          access: {
            create: isAdminFieldLevel,
            update: isAdminFieldLevel,
          },
        },
      ],
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'location',
      label: 'location',
      type: 'text',
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    // {
    //   name: 'emailSent',
    //   type: 'checkbox',
    //   defaultValue: false,
    //   admin: {
    //     readOnly: true,
    //   },
    // },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.deleveryId) {
          data.deleveryId = uuidv4() // Generate and assign a unique ID
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {

        if (doc.deliveryStatus === 'delivered' && previousDoc.deliveryStatus !== 'delivered') {


          await req.payload.update({
            collection: 'orders',
            id: doc.orderId, // Ensure the correct reference to the order ID
            data: {
              orderStatus: 'Delivery Success',
            },
          })

          try {
            const productDetails = doc.products
              .map(
                (product: { product: { name: string }; quantity: number }) =>
                  `- ${product.product.name} (Quantity: ${product.quantity})`,
              )
              .join('\n')
            const emailContent = `
            Dear Customer,

            Your order has been successfully delivered. Here are the details of your order:

            Order ID: ${doc.orderId}
            Delivery ID: ${doc.deleveryId}
            Total Price: ${doc.totalPrice}

            Products:
            ${productDetails}

            Thank you for shopping with us!

            Best regards,
            Nawwa MC.
          `

            await req.payload.sendEmail({
              to: doc.orderedPersonEmail,
              subject: 'Your delivery has been delivered',
              text: emailContent,
            })
          } catch (error) {
            console.error('Error sending email:', error)
          }

          // // Update the emailSent field in the delivery document
          // await req.payload.update({
          //   collection: 'deliveries',
          //   id: doc.id,
          //   data: {
          //     emailSent: true,
          //   },
          // })
        }

        if (doc.deliveryStatus === 'in transit' && previousDoc.deliveryStatus !== 'in transit') {
          await req.payload.update({
            collection: 'orders',
            id: doc.orderId, // Ensure the correct reference to the order ID
            data: {
              orderStatus: 'In Transit',
            },
          })
        }

        // if (doc.deliveryStatus === 'delivered' && previousDoc.deliveryStatus !== 'delivered') {

        // }
      },
    ],
  },
}
