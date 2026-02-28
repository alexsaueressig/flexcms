import { z } from 'zod'
import db from '../../../../db/client'

const querySchema = z.object({
  locale: z.string().default('en'),
  limit: z.coerce.number().min(1).max(200).default(25),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const parentId = getRouterParam(event, 'id')!
  const { locale, limit, offset, search } = querySchema.parse(getQuery(event))

  const where = {
    parentId,
    localeCode: locale,
    isArchived: false,
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [items, total] = await Promise.all([
    db.entry.findMany({
      where,
      orderBy: { order: 'asc' },
      skip: offset,
      take: limit,
      include: { fieldValues: { where: { localeCode: locale } } },
    }),
    db.entry.count({ where }),
  ])

  return { items, total, limit, offset }
})
