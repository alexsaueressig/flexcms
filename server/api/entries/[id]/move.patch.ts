import { z } from 'zod'
import db from '../../../db/client'
import { assertCan } from '../../../utils/permissions'

const bodySchema = z.object({
  newParentId: z.string().nullable(),
  order: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')!
  assertCan(user, 'edit', id)

  const { newParentId, order } = bodySchema.parse(await readBody(event))

  // Prevent circular reference: new parent cannot be a descendant of this entry
  async function isDescendant(targetId: string, ancestorId: string): Promise<boolean> {
    if (targetId === ancestorId) return true
    const entry = await db.entry.findUnique({ where: { id: targetId }, select: { parentId: true } })
    if (!entry?.parentId) return false
    return isDescendant(entry.parentId, ancestorId)
  }

  if (newParentId && await isDescendant(newParentId, id)) {
    throw createError({ statusCode: 400, message: 'Cannot move an entry to one of its own descendants' })
  }

  const updated = await db.entry.update({
    where: { id },
    data: {
      parentId: newParentId,
      ...(order !== undefined ? { order } : {}),
    },
  })

  return updated
})
