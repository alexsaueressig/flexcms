import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const querySchema = z.object({
  locale: z.string().default('en'),
  limit: z.coerce.number().min(1).max(200).default(25),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'view')

  const query = querySchema.parse(getQuery(event))

  const where = {
    parentId: null,
    localeCode: query.locale,
    isArchived: false,
    ...(query.search
      ? { title: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  }

  const [items, total] = await Promise.all([
    db.entry.findMany({
      where,
      orderBy: { order: 'asc' },
      skip: query.offset,
      take: query.limit,
      select: {
        id: true, slug: true, title: true, localeCode: true,
        order: true, createdAt: true, updatedAt: true,
        _count: { select: { children: { where: { isArchived: false } } } },
      },
    }),
    db.entry.count({ where }),
  ])

  return { items, total, limit: query.limit, offset: query.offset }
})
