import { z } from 'zod'
import db from '../../db/client'

const bodySchema = z.object({
  entryId: z.string().nullable().optional(),
  prefs: z.record(z.any()),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const { entryId, prefs } = bodySchema.parse(await readBody(event))

  await Promise.all(
    Object.entries(prefs).map(([key, value]) =>
      db.userPreference.upsert({
        where: { userId_entryId_key: { userId: user.id, entryId: entryId ?? null, key } },
        create: { userId: user.id, entryId: entryId ?? null, key, value: JSON.stringify(value) },
        update: { value: JSON.stringify(value) },
      }),
    ),
  )

  return { ok: true }
})
