import { getSessionToken, getSessionUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getSessionToken(event)
  if (!token) throw createError({ statusCode: 401, message: 'Unauthenticated' })

  const user = await getSessionUser(token)
  if (!user) throw createError({ statusCode: 401, message: 'Session expired' })

  const { id, email, name, status, lastLoginAt } = user
  const roles = user.roles.map(ur => ({
    id: ur.role.id,
    name: ur.role.name,
  }))

  // Aggregate global permissions across all roles
  const allPerms = user.roles.flatMap(ur => ur.role.permissions.filter(p => !p.entryId))
  const permissions = {
    canView: allPerms.some(p => p.canView),
    canCreate: allPerms.some(p => p.canCreate),
    canEdit: allPerms.some(p => p.canEdit),
    canPublish: allPerms.some(p => p.canPublish),
    canArchive: allPerms.some(p => p.canArchive),
  }

  return { id, email, name, status, lastLoginAt, roles, permissions }
})
