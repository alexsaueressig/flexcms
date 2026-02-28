import db from '../../db/client'

export default defineEventHandler(async () => {
  return db.fieldTypeDefinition.findMany({
    where: { isActive: true },
    orderBy: { type: 'asc' },
  })
})
