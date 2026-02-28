import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-_]+$/),
  title: z.string().min(1),
  parentId: z.string().nullable().default(null),
  localeCode: z.string().default('en'),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = bodySchema.parse(await readBody(event))

  assertCan(user, 'create', body.parentId)

  // Auto-assign order at end of siblings
  const maxOrder = await db.entry.aggregate({
    where: { parentId: body.parentId, localeCode: body.localeCode },
    _max: { order: true },
  })

  const entry = await db.entry.create({
    data: {
      slug: body.slug,
      title: body.title,
      parentId: body.parentId,
      localeCode: body.localeCode,
      order: (maxOrder._max.order ?? -1) + 1,
      createdBy: user.id,
    },
  })

  return entry
})
