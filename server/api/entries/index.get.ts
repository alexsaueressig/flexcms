import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(25),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  archived: z.coerce.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'view')

  const query = querySchema.parse(getQuery(event))

  const where = {
    parentId: null,
    isArchived: query.archived,
    ...(query.search
      ? { title: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  }

  const [rawItems, total] = await Promise.all([
    db.entry.findMany({
      where,
      orderBy: { order: 'asc' },
      skip: query.offset,
      take: query.limit,
      select: {
        id: true, slug: true, title: true,
        order: true, createdAt: true, updatedAt: true, archivedAt: true, createdBy: true,
        _count: { select: { children: { where: { isArchived: false } } } },
      },
    }),
    db.entry.count({ where }),
  ])

  // Resolve author names for archived listings
  let items: typeof rawItems & { authorName?: string | null }[] = rawItems as any
  if (query.archived) {
    const authorIds = [...new Set(rawItems.map(e => e.createdBy).filter(Boolean))] as string[]
    const authors = authorIds.length
      ? await db.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } })
      : []
    const authorMap = Object.fromEntries(authors.map(u => [u.id, u.name]))
    items = rawItems.map(e => ({ ...e, authorName: e.createdBy ? (authorMap[e.createdBy] ?? null) : null }))
  }

  return { items, total, limit: query.limit, offset: query.offset }
})
