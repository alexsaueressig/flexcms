import { z } from 'zod'
import db from '../../../../db/client'
import { assertCan } from '../../../../utils/permissions'

const bodySchema = z.object({
  targetEntryIds: z.array(z.string()),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const sourceEntryId = getRouterParam(event, 'id')!
  const blueprintFieldId = getRouterParam(event, 'fieldId')!
  assertCan(user, 'edit', sourceEntryId)

  const { targetEntryIds } = bodySchema.parse(await readBody(event))

  // Replace all relations for this field
  await db.$transaction([
    db.entryRelation.deleteMany({ where: { sourceEntryId, blueprintFieldId } }),
    ...targetEntryIds.map((targetEntryId, order) =>
      db.entryRelation.create({
        data: { sourceEntryId, targetEntryId, blueprintFieldId, order },
      }),
    ),
  ])

  return { ok: true }
})
