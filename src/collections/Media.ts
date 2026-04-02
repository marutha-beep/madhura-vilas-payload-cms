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

        try {
          // req.file is available during the same request lifecycle
          const file = req.file as any
          console.log('req.file keys:', file ? Object.keys(file) : 'null')
          console.log('req.file.data type:', file?.data ? typeof file.data : 'null')
          console.log('req.file.data length:', file?.data?.length || file?.data?.byteLength || 0)

          if (!file) {
            console.error('req.file is null/undefined')
            return doc
          }

          let buffer: Buffer
          if (Buffer.isBuffer(file.data)) {
            buffer = file.data
          } else if (file.data instanceof ArrayBuffer) {
            buffer = Buffer.from(file.data)
          } else if (file.data && typeof file.data === 'object') {
            buffer = Buffer.from(Object.values(file.data) as number[])
          } else {
            console.error('Unknown file.data type:', typeof file.data)
            return doc
          }

          console.log('Buffer size:', buffer.length)
          const url = await uploadBuffer(buffer)
          console.log('Cloudinary URL:', url)

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
