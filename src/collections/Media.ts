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
    handlers: [
      async (req) => {
        const fileData = req.file
        if (!fileData) return

        const buffer: Buffer = Buffer.isBuffer(fileData.data)
          ? fileData.data
          : Buffer.from(fileData.data)

        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'madhura-vilas', resource_type: 'auto' },
            (err, res) => (err ? reject(err) : resolve(res))
          )
          stream.end(buffer)
        })

        if (req.file) req.file.data = buffer
        ;(req as any).cloudinaryURL = result.secure_url
      },
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const url = (req as any).cloudinaryURL
        if (url) {
          data.url = url
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text' },
    { name: 'url', type: 'text' },
  ],
}
