import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

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
          if (!fs.existsSync(filePath)) return doc

          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'madhura-vilas',
            overwrite: true,
          })

          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: { cloudinaryUrl: result.secure_url },
            req,
          })

          return { ...doc, url: result.secure_url, cloudinaryUrl: result.secure_url }
        } catch (err) {
          console.error('Cloudinary upload failed:', err)
          return doc
        }
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.cloudinaryUrl) {
          doc.url = doc.cloudinaryUrl
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
    { name: 'cloudinaryUrl', type: 'text' },
  ],
}
