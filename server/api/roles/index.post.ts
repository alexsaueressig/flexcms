import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'create')

  const body = bodySchema.parse(await readBody(event))
  return db.role.create({ data: body })
})
