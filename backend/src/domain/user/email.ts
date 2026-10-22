import { AppError } from '../../shared/errors/app.error.js'
import { ValueObject } from '../../shared/seedwork/value-object.js'
import type { EmailValidator } from './email-validator.js'

export class Email extends ValueObject<string> {
	private static validator: EmailValidator

	private constructor(value: string) {
		super(value)
	}

	public static configure(validator: EmailValidator): void {
		Email.validator = validator
	}

	public static create(value: string): Email {
		const normalized = value.trim().toLowerCase()
		if (!Email.getValidator().isValid(normalized)) {
			throw new AppError('INVALID_PARAMETERS', 'A valid user email is required')
		}
		return new Email(normalized)
	}

	public static from(value: string): Email {
		return Email.create(value)
	}

	private static getValidator(): EmailValidator {
		if (!Email.validator) throw new AppError('INVALID_PARAMETERS', 'Email validator is not configured')
		return Email.validator
	}
}
