import { z } from 'zod'
import db from '../../../db/client'

const querySchema = z.object({
  locale: z.string().default('en'),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const { locale } = querySchema.parse(getQuery(event))

  const entry = await db.entry.findUnique({
    where: { id, isArchived: false },
    include: {
      blueprint: { include: { fields: { orderBy: { order: 'asc' } } } },
      fieldValues: { where: { localeCode: locale } },
    },
  })

  if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })
  return entry
})
