import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')!

  const entry = await db.entry.findUnique({
    where: { id },
    include: {
      blueprint: { include: { fields: { orderBy: { order: 'asc' } } } },
      fieldValues: true,
      _count: { select: { children: { where: { isArchived: false } } } },
    },
  })

  if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })
  assertCan(user, 'view', id)

  return entry
})
