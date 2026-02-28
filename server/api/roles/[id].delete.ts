import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'archive')

  const id = getRouterParam(event, 'id')!
  const role = await db.role.findUnique({ where: { id } })

  if (role?.isSystem) {
    throw createError({ statusCode: 403, message: 'System roles cannot be deleted' })
  }

  await db.role.delete({ where: { id } })
  return { ok: true }
})
