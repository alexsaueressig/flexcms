import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const querySchema = z.object({
  q: z.string().default(''),
  locale: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  parentId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'view')

  const { q, locale, limit, parentId } = querySchema.parse(getQuery(event))

  const textFilter = q
    ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { slug: { contains: q, mode: 'insensitive' as const } },
        {
          fieldValues: {
            some: {
              valueText: { contains: q, mode: 'insensitive' as const },
              ...(locale ? { localeCode: locale } : {}),
            },
          },
        },
      ],
    }
    : {}

  const entries = await db.entry.findMany({
    where: {
      isArchived: false,
      ...(parentId ? { parentId } : {}),
      ...textFilter,
    },
    take: limit,
    select: {
      id: true, title: true, slug: true,
      blueprint: { select: { id: true } },
      parent: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return entries
})
