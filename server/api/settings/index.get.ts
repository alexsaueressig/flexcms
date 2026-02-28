import db from '../../db/client'

export default defineEventHandler(async () => {
  const settings = await db.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] })
  // Deserialize JSON values
  return settings.map(s => ({
    ...s,
    parsedValue: (() => { try { return JSON.parse(s.value) } catch { return s.value } })(),
  }))
})
