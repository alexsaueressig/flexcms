import { z } from 'zod'
import db from '../../db/client'
import { generateOtp, createOtpToken } from '../../utils/otp'
import { sendOtpEmail } from '../../utils/mail'

const bodySchema = z.object({
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = bodySchema.parse(body)

  const user = await db.user.findUnique({ where: { email } })
  if (!user || user.status !== 'ACTIVE') {
    // Generic message to avoid user enumeration
    return { ok: true }
  }

  const code = generateOtp()
  await createOtpToken(user.id, code)
  if (process.env.NODE_ENV !== 'development') await sendOtpEmail(email, code)

  return { ok: true, devOtp: process.env.NODE_ENV === 'development' ? code : null }
})
