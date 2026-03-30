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
      name: 'riderEmail',
      type: 'text',
      label: 'Rider Email',
      admin: {
        readOnly: true,
      },
    },
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
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
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
            // 1. Fetch full product details for the email summary
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
                  <div style="background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 30px;">✓</div>
                  <h1 style="color: #10b981; margin-bottom: 8px;">Order Delivered!</h1>
                  <p style="font-size: 16px; color: #666;">Great news! Your order has been successfully delivered.</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <div style="border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">Delivery Summary</h3>
                    <span style="color: #666; font-size: 14px;">Order #${doc.orderId}</span>
                  </div>
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
                        <td colspan="2" style="padding: 15px 10px 10px; text-align: right; font-weight: bold;">Total Paid:</td>
                        <td style="padding: 15px 10px 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 18px;">Rs. ${Number(
                          doc.totalPrice,
                        ).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style="margin-bottom: 20px;">
                  <h3 style="border-bottom: 2px solid #eee; padding-bottom: 8px;">Delivery Information</h3>
                  <p style="margin: 8px 0;"><strong>Delivery ID:</strong> ${doc.deleveryId}</p>
                  <p style="margin: 8px 0;"><strong>Rider Email:</strong> ${doc.riderEmail}</p>
                  <p style="margin: 8px 0;"><strong>Location:</strong> ${doc.addressLine1}, ${doc.city}</p>
                </div>

                <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                  <p style="margin: 0; color: #166534; font-weight: bold;">Thank you for choosing Nawwa MC!</p>
                  <p style="margin: 5px 0 0; color: #166534; font-size: 14px;">We hope to serve you again soon.</p>
                </div>
              </div>
            `

            await req.payload.sendEmail({
              to: doc.orderedPersonEmail,
              subject: 'Your delivery has been delivered',
              html: htmlEmail,
            })
          } catch (error) {
            console.error('Error sending delivery success email:', error)
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
