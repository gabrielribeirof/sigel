import vine from '@vinejs/vine'

export const roleIdSchema = vine.object({ id: vine.string() })
export const roleCreateSchema = vine.object({
	name: vine.string(),
	permissionsMask: vine.string().optional(),
})
export const roleUpdateSchema = vine.object({
	name: vine.string(),
	permissionsMask: vine.string(),
})
