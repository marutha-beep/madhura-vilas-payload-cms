import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: { read: () => true },
  admin: { useAsTitle: 'label' },
  fields: [
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'label',  type: 'text',   required: true },
    { name: 'review', type: 'text',   required: true },
  ],
}
