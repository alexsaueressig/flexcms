import db from '../../db/client'

export default defineEventHandler(async () => {
  return db.role.findMany({
    orderBy: { name: 'asc' },
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
  })
})
