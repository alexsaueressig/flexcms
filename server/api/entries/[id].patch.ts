import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-_]+$/).optional(),
  title: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  localeCode: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')!
  assertCan(user, 'edit', id)

  const body = bodySchema.parse(await readBody(event))

  const entry = await db.entry.update({
    where: { id },
    data: body,
  })

  return entry
})
