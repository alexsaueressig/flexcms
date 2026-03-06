import db from '../../../db/client'
import { assertCan } from '../../../utils/permissions'

/** Permanently deletes an archived entry and all its descendants recursively. */
async function deleteTree(id: string) {
    const children = await db.entry.findMany({ where: { parentId: id }, select: { id: true } })
    for (const child of children) {
        await deleteTree(child.id)
    }
    await db.entry.delete({ where: { id } })
}

export default defineEventHandler(async (event) => {
    const user = event.context.user
    const id = getRouterParam(event, 'id')!
    assertCan(user, 'archive', id)

    const entry = await db.entry.findUnique({ where: { id } })
    if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })
    if (!entry.isArchived) throw createError({ statusCode: 400, message: 'Entry must be archived before permanent deletion' })

    await deleteTree(id)
    return { ok: true }
})
