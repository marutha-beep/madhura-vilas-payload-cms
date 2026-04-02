import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: '/tmp/media',
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return doc
        try {
          const filePath = `/tmp/media/${doc.filename}`
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'madhura-vilas',
            public_id: doc.id,
            overwrite: true,
          })
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: { url: result.secure_url },
          })
          return { ...doc, url: result.secure_url }
        } catch (err) {
          console.error('Cloudinary upload failed:', err)
          return doc
        }
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
}
