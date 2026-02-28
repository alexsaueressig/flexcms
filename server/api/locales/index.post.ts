import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1),
  language: z.string().min(2),
  isDefault: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'create')

  const body = bodySchema.parse(await readBody(event))

  if (body.isDefault) {
    await db.locale.updateMany({ data: { isDefault: false } })
  }

  return db.locale.create({ data: body })
})
