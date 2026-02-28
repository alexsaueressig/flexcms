import { createError } from 'h3'
import type { User, Role, Permission, UserRole } from '@prisma/client'

type UserWithRoles = User & {
  roles: (UserRole & {
    role: Role & {
      permissions: Permission[]
    }
  })[]
}

type Action = 'view' | 'create' | 'edit' | 'archive'

function checkField(action: Action): keyof Permission {
  const map: Record<Action, keyof Permission> = {
    view: 'canView',
    create: 'canCreate',
    edit: 'canEdit',
    archive: 'canArchive',
  }
  return map[action]
}

export function userCan(
  user: UserWithRoles,
  action: Action,
  entryId?: string | null,
): boolean {
  // Collect all permissions from all roles
  for (const ur of user.roles) {
    for (const perm of ur.role.permissions) {
      // Check entry-scoped permission first, then global (entryId = null)
      if (perm.entryId === (entryId ?? null) || perm.entryId === null) {
        if (perm[checkField(action)] === true) return true
      }
    }
  }
  return false
}

export function assertCan(
  user: UserWithRoles,
  action: Action,
  entryId?: string | null,
): void {
  if (!userCan(user, action, entryId)) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to perform this action',
    })
  }
}
