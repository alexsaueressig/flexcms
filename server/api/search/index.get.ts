import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const querySchema = z.object({
  q: z.string().min(1),
  locale: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'view')

  const { q, locale, limit } = querySchema.parse(getQuery(event))

  const entries = await db.entry.findMany({
    where: {
      isArchived: false,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        {
          fieldValues: {
            some: {
              valueText: { contains: q, mode: 'insensitive' },
              ...(locale ? { localeCode: locale } : {}),
            },
          },
        },
      ],
    },
    take: limit,
    select: {
      id: true, title: true, slug: true,
      parent: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return entries
})
