import type { CollectionConfig } from 'payload'
import { isAdminOrCustomer } from '../access/isAdminOrCustomer'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isOrderRelated } from '../access/isOrderRelated'
import { v4 as uuidv4 } from 'uuid' // Import UUID library

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'useremail',
  },
  access: {
    create: isAdminOrCustomer,
    read: isOrderRelated,
    update: isOrderRelated,
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
    {
      name: 'useremail',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'riderEmail',
      type: 'text',
      label: 'Rider Email',
      admin: {
        description: 'Assign a rider for this order',
      },
      validate: (val: string | string[] | null | undefined, { data }: { data: any }) => {
        if (data?.orderStatus === 'approved for delivery' && !val) {
          return 'Rider email is required when order is approved for delivery'
        }
        return true
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
        const isApproved = doc.orderStatus === 'approved for delivery'
        const wasApproved = previousDoc?.orderStatus === 'approved for delivery'
        const riderChanged = doc.riderEmail !== previousDoc?.riderEmail

        if (isApproved && (!wasApproved || riderChanged)) {
          // Check if a delivery already exists for this order
          const existingDeliveries = await req.payload.find({
            collection: 'deliveries',
            where: {
              orderId: {
                equals: doc.id,
              },
            },
          })

          const deliveryData = {
            products: doc.products,
            totalPrice: doc.totalPrice,
            addressLine1: doc.addressLine1,
            addressLine2: doc.addressLine2,
            city: doc.city,
            phone: doc.phone,
            location: doc.location,
            orderedPersonEmail: doc.useremail,
            riderEmail: doc.riderEmail,
            orderId: doc.id,
          }

          if (existingDeliveries.totalDocs > 0) {
            // Update the existing delivery
            await req.payload.update({
              collection: 'deliveries',
              id: existingDeliveries.docs[0].id,
              data: {
                ...deliveryData,
              },
            })
          } else {
            // Create a new delivery record
            await req.payload.create({
              collection: 'deliveries',
              data: {
                ...deliveryData,
                deleveryId: uuidv4(),
                deliveryStatus: 'pending',
              },
            })
          }

          // Send email if it's a new approval
          if (!wasApproved) {
            await req.payload.sendEmail({
              to: doc.useremail,
              subject: 'Admin Approved your order for delivery',
              text: `Your order has been approved for delivery. Your order ID is ${doc.id}`,
            })
          }
        }
      },
    ],
  },
}
