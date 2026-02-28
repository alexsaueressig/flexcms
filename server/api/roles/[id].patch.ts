import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'edit')

  const id = getRouterParam(event, 'id')!
  const role = await db.role.findUnique({ where: { id } })

  if (role?.isSystem) {
    throw createError({ statusCode: 403, message: 'System roles cannot be modified' })
  }

  const body = bodySchema.parse(await readBody(event))
  return db.role.update({ where: { id }, data: body })
})
