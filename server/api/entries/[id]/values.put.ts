import { z } from 'zod'
import db from '../../../db/client'
import { assertCan } from '../../../utils/permissions'

const bodySchema = z.object({
  localeCode: z.string().default('en'),
  values: z.array(z.object({
    blueprintFieldId: z.string(),
    valueText: z.string().nullable().optional(),
    valueNumber: z.number().nullable().optional(),
    valueBool: z.boolean().nullable().optional(),
    valueJson: z.any().optional(),
    valueMedia: z.string().nullable().optional(),
  })),
  relations: z.array(z.object({
    blueprintFieldId: z.string(),
    targetEntryIds: z.array(z.string()),
  })).optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const entryId = getRouterParam(event, 'id')!
  assertCan(user, 'edit', entryId)

  const { localeCode, values, relations } = bodySchema.parse(await readBody(event))

  // Upsert each field value
  await Promise.all(values.map(v =>
    db.fieldValue.upsert({
      where: {
        entryId_blueprintFieldId_localeCode: {
          entryId, blueprintFieldId: v.blueprintFieldId, localeCode,
        },
      },
      create: { entryId, blueprintFieldId: v.blueprintFieldId, localeCode, ...v },
      update: v,
    }),
  ))

  // Upsert entry relations
  if (relations?.length) {
    for (const rel of relations) {
      // Delete existing relations for this field
      await db.entryRelation.deleteMany({
        where: { sourceEntryId: entryId, blueprintFieldId: rel.blueprintFieldId },
      })
      // Create new relations
      if (rel.targetEntryIds.length) {
        await db.entryRelation.createMany({
          data: rel.targetEntryIds.map((targetEntryId, i) => ({
            sourceEntryId: entryId,
            targetEntryId,
            blueprintFieldId: rel.blueprintFieldId,
            order: i,
          })),
        })
      }
    }
  }

  return { ok: true }
})
