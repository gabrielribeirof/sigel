import { AppError } from '../../shared/errors/app.error.js'
import { ValueObject } from '../../shared/seedwork/value-object.js'

export class Registration extends ValueObject<string> {
	private constructor(value: string) {
		super(value)
	}

	public static create(value: string): Registration {
		const normalized = value.trim()
		if (!normalized) throw new AppError('INVALID_PARAMETERS', 'Employee registration is required')
		return new Registration(normalized)
	}
}
