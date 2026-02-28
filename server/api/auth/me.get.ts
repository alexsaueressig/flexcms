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

  return { id, email, name, status, lastLoginAt, roles }
})
