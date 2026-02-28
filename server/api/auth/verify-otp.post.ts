import { z } from 'zod'
import { verifyOtp } from '../../utils/otp'
import { createSession } from '../../utils/session'
import db from '../../db/client'

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, code } = bodySchema.parse(body)

  const result = await verifyOtp(email, code)
  if (!result.valid || !result.userId) {
    throw createError({ statusCode: 401, message: 'Invalid or expired code' })
  }

  await createSession(event, result.userId)

  const user = await db.user.findUniqueOrThrow({
    where: { id: result.userId },
    select: { id: true, email: true, name: true, status: true },
  })

  return { user }
})
