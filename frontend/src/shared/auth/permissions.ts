export type PermissionBit = bigint

export const Permission = {
  ManageUsers: 1n << 0n,
  ManageEmployees: 1n << 1n,
  ManageRoles: 1n << 2n,
  ManageCategories: 1n << 3n,
  ManageEquipments: 1n << 4n,
  ManagePromotions: 1n << 5n,
  ManageCustomers: 1n << 6n,
  ManageSuppliers: 1n << 7n,
} as const

export interface PermissionRequirement {
  isSatisfiedBy(mask: bigint): boolean
}

export const PermissionRequirement = {
  from(requirement: PermissionRequirement | PermissionBit): PermissionRequirement {
    if (typeof requirement === 'bigint') {
      return {
        isSatisfiedBy: mask => (mask & requirement) === requirement,
      }
    }
    return requirement
  },

  all(...requirements: Array<PermissionRequirement | PermissionBit>): PermissionRequirement {
    const normalized = requirements.map(PermissionRequirement.from)
    return {
      isSatisfiedBy: mask => normalized.every(requirement => requirement.isSatisfiedBy(mask)),
    }
  },

  any(...requirements: Array<PermissionRequirement | PermissionBit>): PermissionRequirement {
    const normalized = requirements.map(PermissionRequirement.from)
    return {
      isSatisfiedBy: mask => normalized.some(requirement => requirement.isSatisfiedBy(mask)),
    }
  },
}

export function parsePermissionsMask(mask?: string | null): bigint {
  if (!mask) return 0n
  try {
    return BigInt(mask)
  } catch {
    return 0n
  }
}

export function hasPermission(
  mask: bigint | string | null | undefined,
  requirement?: PermissionRequirement | PermissionBit,
): boolean {
  if (!requirement) return true
  const resolvedMask = typeof mask === 'bigint' ? mask : parsePermissionsMask(mask)
  return PermissionRequirement.from(requirement).isSatisfiedBy(resolvedMask)
}
