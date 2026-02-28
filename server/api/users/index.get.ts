import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'view')

  const { search, limit, offset } = querySchema.parse(getQuery(event))

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true, email: true, name: true, status: true,
        lastLoginAt: true, createdAt: true,
        roles: { select: { role: { select: { id: true, name: true } } } },
      },
    }),
    db.user.count({ where }),
  ])

  return { items, total }
})
