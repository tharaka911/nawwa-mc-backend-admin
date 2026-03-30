import type { CollectionConfig } from 'payload'
import { isCustomer } from '../access/isCustomer'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isOrderRelated } from '../access/isOrderRelated'
import { v4 as uuidv4 } from 'uuid' // Import UUID library

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'useremail',
    hidden: ({ user }) => !user?.roles?.includes('admin'),
  },
  access: {
    create: isCustomer,
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
      name: 'assignedRider',
      type: 'relationship',
      relationTo: 'users',
      label: 'Assigned Rider',
      admin: {
        description: 'Assign a rider for this order',
      },
      filterOptions: {
        roles: {
          contains: 'rider',
        },
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data?.orderStatus === 'approved for delivery' && !val) {
          return 'Rider is required when order is approved for delivery'
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
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
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
              item.image = typeof product.image === 'object' ? product.image.id : product.image
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
        const riderChanged = doc.assignedRider !== previousDoc?.assignedRider

        if (isApproved && (!wasApproved || riderChanged)) {
          // Fetch the rider's email if assigned
          let riderEmail = ''
          if (doc.assignedRider) {
            const riderId =
              typeof doc.assignedRider === 'string' ? doc.assignedRider : doc.assignedRider.id
            const riderUser = await req.payload.findByID({
              collection: 'users',
              id: riderId,
            })
            riderEmail = riderUser?.email || ''
          }

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
            riderEmail: riderEmail,
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

          // Send refined HTML email if it's a new approval
          if (!wasApproved) {
            try {
              // 1. Fetch full product details for the email
              const productSummary = await Promise.all(
                (doc.products || []).map(async (item: any) => {
                  try {
                    const productId = typeof item.product === 'object' ? item.product.id : item.product
                    const product = await req.payload.findByID({
                      collection: 'products',
                      id: productId,
                    })
                    return {
                      name: product.name || 'Untitled Product',
                      quantity: item.quantity || 0,
                      price: product.price || 0,
                    }
                  } catch (e) {
                    return { name: 'Unknown Product', quantity: item.quantity || 0, price: 0 }
                  }
                }),
              )

              // 2. Build rows for the HTML table
              const productRows = productSummary
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${Number(
                    item.price,
                  ).toLocaleString()}</td>
                </tr>
              `,
                )
                .join('')

              // 3. Define the professional HTML template
              const htmlEmail = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #007bff; margin-bottom: 8px;">Order Approved!</h1>
                    <p style="font-size: 16px; color: #666;">Your order #${
                      doc.id
                    } is now being prepared for delivery.</p>
                  </div>
                  
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 8px;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr>
                          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Item</th>
                          <th style="text-align: center; padding: 10px; border-bottom: 2px solid #eee;">Qty</th>
                          <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eee;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${productRows}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 15px 10px 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                          <td style="padding: 15px 10px 10px; text-align: right; font-weight: bold; color: #007bff; font-size: 18px;">Rs. ${Number(
                            doc.totalPrice,
                          ).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div style="margin-bottom: 20px;">
                    <h3 style="border-bottom: 2px solid #eee; padding-bottom: 8px;">Delivery Details</h3>
                    <p style="margin: 8px 0;"><strong>Address:</strong> ${doc.addressLine1}${
                doc.addressLine2 ? ', ' + doc.addressLine2 : ''
              }, ${doc.city}</p>
                    <p style="margin: 8px 0;"><strong>Phone:</strong> ${doc.phone}</p>
                  </div>

                  <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">Thank you for shopping with Nawwa MC!</p>
                </div>
              `

              await req.payload.sendEmail({
                to: doc.useremail,
                subject: 'Admin Approved your order for delivery',
                html: htmlEmail,
              })
            } catch (error) {
              console.error('Error sending order approval email:', error)
            }
          }
        }
      },
    ],
  },
}
