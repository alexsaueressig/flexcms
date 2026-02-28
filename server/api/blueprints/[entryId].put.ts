import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'
import type { FieldType } from '@prisma/client'

const fieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9_]+$/),
  type: z.string() as z.ZodType<FieldType>,
  order: z.number().int().min(0),
  isRequired: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  config: z.record(z.any()).default({}),
})

const bodySchema = z.object({
  description: z.string().optional(),
  fields: z.array(fieldSchema),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const entryId = getRouterParam(event, 'entryId')!
  assertCan(user, 'edit', entryId)

  const body = bodySchema.parse(await readBody(event))

  // Upsert blueprint
  const blueprint = await db.blueprint.upsert({
    where: { entryId },
    create: { entryId, description: body.description },
    update: { description: body.description },
  })

  const incomingIds = body.fields.filter(f => f.id).map(f => f.id!)

  // Delete fields removed from the list
  await db.blueprintField.deleteMany({
    where: { blueprintId: blueprint.id, id: { notIn: incomingIds } },
  })

  // Upsert incoming fields
  for (const field of body.fields) {
    if (field.id) {
      await db.blueprintField.update({
        where: { id: field.id },
        data: { label: field.label, type: field.type, order: field.order, isRequired: field.isRequired, isHidden: field.isHidden, config: field.config },
      })
    } else {
      await db.blueprintField.create({
        data: { blueprintId: blueprint.id, ...field },
      })
    }
  }

  return db.blueprint.findUnique({
    where: { id: blueprint.id },
    include: { fields: { orderBy: { order: 'asc' } } },
  })
})
