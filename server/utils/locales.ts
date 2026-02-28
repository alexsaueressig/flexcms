import db from '../db/client'

/** Returns all active locales from the database. */
export async function getActiveLocales() {
  return db.locale.findMany({
    where: { isActive: true },
    orderBy: [{ isDefault: 'desc' }, { code: 'asc' }],
  })
}

/** Returns the default locale code from the database. */
export async function getDefaultLocale(): Promise<string> {
  const locale = await db.locale.findFirst({ where: { isDefault: true } })
  return locale?.code ?? 'en'
}
