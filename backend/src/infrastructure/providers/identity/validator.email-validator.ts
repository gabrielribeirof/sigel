import validator from 'validator'
import type { EmailValidator } from '../../../domain/user/email-validator.js'

export class ValidatorEmailValidator implements EmailValidator {
	public isValid(value: string): boolean {
		return validator.isEmail(value)
	}
}
