import type { CollectionConfig } from 'payload'

export const Cars: CollectionConfig = {
  slug: 'cars',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Make all operations openly accessible
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    // name
    {
      name: 'name',
      label: 'Car Name',
      type: 'text',
      required: true,
    },
    // brand
    {
      name: 'brand',
      label: 'Brand',
      type: 'text',
      required: true,
    },
    // model
    {
      name: 'model',
      label: 'Model',
      type: 'text',
      required: true,
    },
    // year
    {
      name: 'year',
      label: 'Year',
      type: 'number',
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1, // Allow next year for upcoming models
    },
  ],
}