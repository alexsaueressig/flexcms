import { z } from 'zod'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { nanoid } from 'nanoid'
import db from '../../db/client'

const bodySchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  entryId: z.string().optional(),
})

function getFirebaseAdmin() {
  if (getApps().length) return getApps()[0]!
  const config = useRuntimeConfig()
  const serviceAccount = JSON.parse(config.firebaseServiceAccount)
  return initializeApp({ credential: cert(serviceAccount), storageBucket: config.firebaseStorageBucket })
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = bodySchema.parse(await readBody(event))

  const app = getFirebaseAdmin()
  const bucket = getStorage(app).bucket()

  const ext = body.fileName.split('.').pop()
  const storagePath = `uploads/${nanoid()}${ext ? '.' + ext : ''}`

  const file = bucket.file(storagePath)
  const [signedUrl] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType: body.mimeType,
  })

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

  // Record the pending media
  const record = await db.mediaRecord.create({
    data: {
      storagePath,
      publicUrl,
      fileName: body.fileName,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      uploadedBy: user.id,
      entryId: body.entryId ?? null,
    },
  })

  return { signedUrl, storagePath, publicUrl, recordId: record.id }
})
