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
    beforeOperation: [
      async ({ args, operation }) => {
        if (operation !== 'create') return args
        const file = args.req?.file
        if (!file) return args
        try {
          const buffer = Buffer.isBuffer(file.data)
            ? file.data
            : Buffer.from(file.data as ArrayBuffer)
          const url = await uploadBuffer(buffer)
          ;(args.req as any)._cloudinaryUrl = url
        } catch (e) {
          console.error('Cloudinary upload failed:', e)
        }
        return args
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        const url = (req as any)._cloudinaryUrl
        if (url) data.cloudinaryUrl = url
        return data
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
