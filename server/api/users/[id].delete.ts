import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'archive')

  const id = getRouterParam(event, 'id')!

  if (id === user.id) {
    throw createError({ statusCode: 400, message: 'You cannot delete your own account' })
  }

  // Soft-delete by deactivating
  await db.user.update({ where: { id }, data: { status: 'INACTIVE' } })
  return { ok: true }
})
