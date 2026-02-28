import db from '../../../db/client'
import { assertCan } from '../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')!
  assertCan(user, 'archive', id)

  const entry = await db.entry.findUnique({ where: { id } })
  if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })

  await db.entry.update({
    where: { id },
    data: { isArchived: false, archivedAt: null },
  })

  return { ok: true }
})
