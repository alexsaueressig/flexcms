import { deleteSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await deleteSession(event)
  return { ok: true }
})
