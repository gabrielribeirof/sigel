import vine, { errors as vineErrors } from '@vinejs/vine'
import type { Infer, SchemaTypes } from '@vinejs/vine/types'
import { InvalidParametersError, type ErrorDetails } from '../errors/app.error.js'

const messages: Record<string, string> = {
	required: 'Campo obrigatório',
	string: 'Campo deve ser texto',
	number: 'Campo deve ser número',
	boolean: 'Campo deve ser booleano',
	object: 'Campo deve ser um objeto',
	array: 'Campo deve ser uma lista',
}

export async function validate<Schema extends SchemaTypes>(
	schema: Schema,
	data: unknown,
): Promise<Infer<Schema>> {
	try {
		return await vine.validate({
			schema,
			data,
		})
	}
	catch (error) {
		if (!(error instanceof vineErrors.E_VALIDATION_ERROR)) throw error

		const fieldErrors: ErrorDetails = {}
		for (const validationError of error.messages as Array<{
			field: string
			rule: string
		}>) {
			const field = fieldErrors[validationError.field] ?? []
			field.push(messages[validationError.rule] ?? 'Campo inválido')
			fieldErrors[validationError.field] = field
		}
		throw new InvalidParametersError(fieldErrors)
	}
}
