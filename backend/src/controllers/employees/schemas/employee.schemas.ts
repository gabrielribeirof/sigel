import vine from '@vinejs/vine'

export const employeeIdSchema = vine.object({ id: vine.string() })

export const employeeCreateSchema = vine.object({
	registration: vine.string(),
	name: vine.string(),
	sector: vine.string(),
	admissionDate: vine.string(),
	terminationDate: vine.string().nullable().optional(),
	userId: vine.string().nullable().optional(),
})

export const employeeUpdateSchema = vine.object({
	registration: vine.string().optional(),
	name: vine.string().optional(),
	sector: vine.string().optional(),
	admissionDate: vine.string().optional(),
	terminationDate: vine.string().nullable().optional(),
	userId: vine.string().nullable().optional(),
})
