import { getSessionToken, getSessionUser } from '../utils/session'

export default defineEventHandler(async (event) => {
  // Only protect /api/** routes (not /api/auth/** and not /api/v1/**)
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/auth/')) return
  if (path.startsWith('/api/v1/')) return

  const token = getSessionToken(event)
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthenticated' })
  }

  const user = await getSessionUser(token)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Session expired or invalid' })
  }

  event.context.user = user
})
