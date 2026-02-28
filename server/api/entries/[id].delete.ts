import db from '../../db/client'
import { assertCan } from '../../utils/permissions'

/** Soft-deletes an entry and all descendants recursively. */
async function archiveTree(id: string) {
  const now = new Date()
  await db.entry.update({ where: { id }, data: { isArchived: true, archivedAt: now } })
  const children = await db.entry.findMany({ where: { parentId: id }, select: { id: true } })
  for (const child of children) {
    await archiveTree(child.id)
  }
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')!
  assertCan(user, 'archive', id)

  await archiveTree(id)
  return { ok: true }
})
