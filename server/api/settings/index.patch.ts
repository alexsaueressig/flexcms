import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.record(z.any())

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'edit')

  const body = bodySchema.parse(await readBody(event))

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      db.siteSetting.updateMany({
        where: { key },
        data: { value: JSON.stringify(value) },
      }),
    ),
  )

  return { ok: true }
})
