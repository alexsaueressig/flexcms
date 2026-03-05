import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')!

  const entry = await db.entry.findUnique({
    where: { id },
    include: {
      parent: {
        include: {
          blueprint: { include: { fields: { orderBy: { order: 'asc' } } } },
        },
      },
      blueprint: { include: { fields: { orderBy: { order: 'asc' } } } },
      fieldValues: true,
      _count: { select: { children: { where: { isArchived: false } } } },
    },
  })

  if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })
  assertCan(user, 'view', id)

  // fieldSchema = parent's blueprint (defines what fields THIS entry has)
  // blueprint = this entry's own blueprint (defines what its CHILDREN will have)
  return {
    ...entry,
    fieldSchema: entry.parent?.blueprint ?? null,
  }
})
