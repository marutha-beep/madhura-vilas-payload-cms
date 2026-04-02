import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const UPLOAD_DIR = process.env.VERCEL ? '/tmp/media' : path.join(process.cwd(), 'media')

// Ensure directory exists at startup
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }) } catch {}

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: UPLOAD_DIR,
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return doc
        if (!doc.filename) return doc

        try {
          const filePath = path.join(UPLOAD_DIR, doc.filename)

          // Wait briefly for file to be written
          await new Promise(r => setTimeout(r, 500))

          if (!fs.existsSync(filePath)) {
            console.error('File not found at:', filePath)
            return doc
          }

          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'madhura-vilas',
            overwrite: true,
            resource_type: 'auto',
          })

          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: { cloudinaryUrl: result.secure_url },
            req,
          })

          return { ...doc, cloudinaryUrl: result.secure_url }
        } catch (err) {
          console.error('Cloudinary upload failed:', err)
          return doc
        }
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.cloudinaryUrl) doc.url = doc.cloudinaryUrl
        return doc
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
    { name: 'cloudinaryUrl', type: 'text' },
  ],
}
