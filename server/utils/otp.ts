import { createHash, randomInt } from 'node:crypto'
import db from '../db/client'

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export function generateOtp(): string {
  return String(randomInt(100000, 999999))
}

export async function createOtpToken(userId: string, code: string) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  await db.otpToken.create({
    data: { userId, codeHash: hashCode(code), expiresAt },
  })
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<{ valid: boolean; userId?: string }> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { valid: false }

  const token = await db.otpToken.findFirst({
    where: {
      userId: user.id,
      codeHash: hashCode(code),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!token) return { valid: false }

  await db.otpToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  })

  return { valid: true, userId: user.id }
}
