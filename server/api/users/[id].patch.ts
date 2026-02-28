import { z } from 'zod'
import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  roleIds: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'edit')

  const id = getRouterParam(event, 'id')!
  const body = bodySchema.parse(await readBody(event))

  // Prevent self-deactivation
  if (id === user.id && body.status === 'INACTIVE') {
    throw createError({ statusCode: 400, message: 'You cannot deactivate your own account' })
  }

  const { roleIds, ...data } = body

  if (roleIds !== undefined) {
    await db.$transaction([
      db.userRole.deleteMany({ where: { userId: id } }),
      ...roleIds.map(roleId => db.userRole.create({ data: { userId: id, roleId } })),
    ])
  }

  return db.user.update({
    where: { id },
    data,
    include: { roles: { include: { role: true } } },
  })
})
