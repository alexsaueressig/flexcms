import { z } from 'zod'
import db from '../../db/client'

const querySchema = z.object({
  q: z.string().min(1),
  locale: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export default defineEventHandler(async (event) => {
  const { q, locale, limit } = querySchema.parse(getQuery(event))

  return db.entry.findMany({
    where: {
      isArchived: false,
      ...(locale ? { localeCode: locale } : {}),
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { fieldValues: { some: { valueText: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    take: limit,
    select: {
      id: true, title: true, slug: true, localeCode: true,
      parent: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
})
