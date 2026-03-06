import { z } from 'zod'
import db from '../../../db/client'
import { assertCan } from '../../../utils/permissions'

const bodySchema = z.object({
  localeCode: z.string().min(1),
  action: z.enum(['publish', 'unpublish', 'schedule']),
  publishAt: z.string().datetime().optional(),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const entryId = getRouterParam(event, 'id')!
  assertCan(user, 'publish', entryId)

  const entry = await db.entry.findUnique({ where: { id: entryId } })
  if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })
  if (entry.isArchived) throw createError({ statusCode: 400, message: 'Cannot change publish status of an archived entry' })

  const { localeCode, action, publishAt } = bodySchema.parse(await readBody(event))

  const locale = await db.locale.findUnique({ where: { code: localeCode } })
  if (!locale) throw createError({ statusCode: 400, message: 'Invalid locale' })

  if (action === 'schedule' && !publishAt) {
    throw createError({ statusCode: 400, message: 'publishAt is required for schedule action' })
  }

  const publishStatus =
    action === 'publish' ? 'PUBLISHED' :
    action === 'schedule' ? 'SCHEDULED' :
    'DRAFT'

  const record = await db.entryLocale.upsert({
    where: { entryId_localeCode: { entryId, localeCode } },
    create: {
      entryId,
      localeCode,
      publishStatus,
      publishAt: action === 'schedule' ? new Date(publishAt!) : null,
    },
    update: {
      publishStatus,
      publishAt: action === 'schedule' ? new Date(publishAt!) : null,
    },
  })

  return record
})
