import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const entryId = getRouterParam(event, 'entryId')!
  assertCan(user, 'view', entryId)

  const blueprint = await db.blueprint.findUnique({
    where: { entryId },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  if (!blueprint) return null
  return blueprint
})
