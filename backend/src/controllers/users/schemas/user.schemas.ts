import vine from '@vinejs/vine'

export const userIdSchema = vine.object({ id: vine.string() })
export const userLoginSchema = vine.object({
	email: vine.string(),
	password: vine.string(),
})
export const userCreateSchema = vine.object({
	email: vine.string(),
	password: vine.string(),
	roleId: vine.string(),
	employeeId: vine.string().nullable().optional(),
})
export const userUpdateSchema = vine.object({
	email: vine.string().optional(),
	password: vine.string().optional(),
	roleId: vine.string().optional(),
	employeeId: vine.string().nullable().optional(),
	active: vine.boolean().optional(),
})
