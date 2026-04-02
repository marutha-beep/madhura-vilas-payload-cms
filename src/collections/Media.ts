import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function uploadBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'madhura-vilas', resource_type: 'auto' },
      (err, res) => {
        if (err || !res) reject(err)
        else resolve(res.secure_url)
      }
    )
    stream.end(buffer)
  })
}

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
        if (doc.cloudinaryUrl) return doc

        // Try to get buffer from req.file (available during the same request)
        const file = (req as any).file || req.file
        if (!file?.data) {
          console.error('No file data in req.file')
          return doc
        }

        try {
          const buffer = Buffer.isBuffer(file.data)
            ? file.data
            : Buffer.from(file.data as ArrayBuffer)

          const url = await uploadBuffer(buffer)

          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: { cloudinaryUrl: url },
            req,
          })

          return { ...doc, url, cloudinaryUrl: url }
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
