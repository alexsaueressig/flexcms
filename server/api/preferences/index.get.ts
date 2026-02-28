import { z } from 'zod'
import db from '../../db/client'

const querySchema = z.object({
  entryId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const { entryId } = querySchema.parse(getQuery(event))

  const prefs = await db.userPreference.findMany({
    where: { userId: user.id, entryId: entryId ?? null },
  })

  return Object.fromEntries(prefs.map(p => {
    try { return [p.key, JSON.parse(p.value)] }
    catch { return [p.key, p.value] }
  }))
})
