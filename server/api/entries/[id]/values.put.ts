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
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const entryId = getRouterParam(event, 'id')!
  assertCan(user, 'edit', entryId)

  const { localeCode, values } = bodySchema.parse(await readBody(event))

  // Upsert each value
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

  return { ok: true }
})
