import { z } from 'zod'
import db from '../../../db/client'
import { assertCan } from '../../../utils/permissions'

const permSchema = z.object({
  entryId: z.string().nullable().optional(),
  canView: z.boolean().default(false),
  canCreate: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canArchive: z.boolean().default(false),
})

const bodySchema = z.object({
  permissions: z.array(permSchema),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  assertCan(user, 'edit')

  const roleId = getRouterParam(event, 'id')!
  const { permissions } = bodySchema.parse(await readBody(event))

  await db.$transaction([
    db.permission.deleteMany({ where: { roleId } }),
    ...permissions.map(p =>
      db.permission.create({
        data: {
          roleId,
          entryId: p.entryId ?? null,
          canView: p.canView,
          canCreate: p.canCreate,
          canEdit: p.canEdit,
          canArchive: p.canArchive,
        },
      }),
    ),
  ])

  return db.permission.findMany({ where: { roleId } })
})
