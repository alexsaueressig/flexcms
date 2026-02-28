import type { H3Event } from 'h3'
import { nanoid } from 'nanoid'
import db from '../db/client'

const COOKIE_NAME = 'snapcms_session'
const SESSION_DAYS = 30

export async function createSession(
  event: H3Event,
  userId: string,
): Promise<string> {
  const token = nanoid(48)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: getRequestIP(event) ?? null,
      userAgent: getRequestHeader(event, 'user-agent') ?? null,
    },
  })

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return token
}

export async function getSessionUser(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          roles: { include: { role: { include: { permissions: true } } } },
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) return null
  if (session.user.status !== 'ACTIVE') return null

  return session.user
}

export async function deleteSession(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {})
    deleteCookie(event, COOKIE_NAME, { path: '/' })
  }
}

export function getSessionToken(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}
