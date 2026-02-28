import db from '../../../../db/client'
import { assertCan } from '../../../../utils/permissions'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const sourceEntryId = getRouterParam(event, 'id')!
  const blueprintFieldId = getRouterParam(event, 'fieldId')!
  assertCan(user, 'view', sourceEntryId)

  const relations = await db.entryRelation.findMany({
    where: { sourceEntryId, blueprintFieldId },
    orderBy: { order: 'asc' },
    include: {
      targetEntry: {
        select: { id: true, title: true, slug: true, localeCode: true },
      },
    },
  })

  return relations.map(r => r.targetEntry)
})
