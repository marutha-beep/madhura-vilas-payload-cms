import type { CollectionConfig } from 'payload'

export const IconicDishes: CollectionConfig = {
  slug: 'iconic-dishes',
  access: { read: () => true },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name',        type: 'text', required: true },
    { name: 'description', type: 'text', required: true },
    { name: 'image',       type: 'upload', relationTo: 'media' },
  ],
}
