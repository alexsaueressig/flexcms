import db from '../../db/client'

export default defineEventHandler(async () => {
  return db.locale.findMany({
    where: { isActive: true },
    orderBy: [{ isDefault: 'desc' }, { code: 'asc' }],
  })
})
