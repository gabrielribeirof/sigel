import { useMemo } from 'react'
import { useAuth } from './use-auth'
import {
  hasPermission,
  parsePermissionsMask,
  type PermissionBit,
  type PermissionRequirement,
} from './permissions'

export function usePermissions() {
  const { user } = useAuth()
  const permissionsMask = useMemo(
    () => parsePermissionsMask(user?.permissionsMask),
    [user?.permissionsMask],
  )

  return useMemo(
    () => ({
      permissionsMask,
      can: (requirement?: PermissionRequirement | PermissionBit) =>
        hasPermission(permissionsMask, requirement),
    }),
    [permissionsMask],
  )
}
