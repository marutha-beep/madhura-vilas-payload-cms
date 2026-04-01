import type { CollectionConfig } from 'payload'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  access: { read: () => true },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name',        type: 'text',   required: true },
    { name: 'description', type: 'text',   required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Special Dishes',  value: 'Special dishes' },
        { label: 'Seafood',         value: 'Seafood' },
        { label: 'Biryani & Rice',  value: 'Biryani & Rice' },
        { label: 'Breads',          value: 'Breads' },
        { label: 'Beverages',       value: 'Beverages' },
        { label: 'Desserts',        value: 'Desserts' },
      ],
    },
    { name: 'rating',       type: 'number',   min: 0, max: 5 },
    {
      name: 'badge',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None',         value: 'none' },
        { label: 'Chef Special', value: 'chef_special' },
        { label: 'Our Special',  value: 'our_special' },
      ],
    },
    { name: 'is_signature', type: 'checkbox', defaultValue: false },
    { name: 'image',        type: 'upload',   relationTo: 'media' },
  ],
}
