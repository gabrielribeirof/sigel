import type { PasswordHasher } from './password-hasher.js'
import { AppError } from '../../shared/errors/app.error.js'
import { ValueObject } from '../../shared/seedwork/value-object.js'

export class Password extends ValueObject<string> {
	private constructor(hash: string) {
		super(hash)
	}

	public static async create(plainText: string, hasher: PasswordHasher): Promise<Password> {
		if (!plainText) throw new AppError('INVALID_PARAMETERS', 'User password is required')
		return new Password(await hasher.hash(plainText))
	}

	public static fromHash(hash: string): Password {
		if (!hash) throw new AppError('INVALID_PARAMETERS', 'User password hash is required')
		return new Password(hash)
	}

	public async matches(plainText: string, hasher: PasswordHasher): Promise<boolean> {
		return hasher.compare(plainText, this.value)
	}
}
