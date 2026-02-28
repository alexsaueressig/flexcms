import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  roleIds: z.array(z.string()).default([]),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'create')

  const body = bodySchema.parse(await readBody(event))

  const existing = await db.user.findUnique({ where: { email: body.email } })
  if (existing) throw createError({ statusCode: 409, message: 'A user with this email already exists' })

  const newUser = await db.user.create({
    data: {
      email: body.email,
      name: body.name,
      status: 'ACTIVE',
      roles: {
        create: body.roleIds.map(roleId => ({ roleId })),
      },
    },
    include: { roles: { include: { role: true } } },
  })

  return newUser
})
