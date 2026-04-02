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
        { label: 'Non-Veg',         value: 'Non-Veg' },
        { label: 'Chicken',         value: 'Chicken' },
        { label: 'Mutton',          value: 'Mutton' },
        { label: 'Seafoods',        value: 'Seafoods' },
        { label: 'Veg',             value: 'Veg' },
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
