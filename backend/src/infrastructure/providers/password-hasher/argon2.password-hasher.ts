import argon2 from 'argon2'
import type { PasswordHasher } from '../../../domain/user/password-hasher.js'
import type { HashOptions } from 'argon2'
import { AppError } from '../../../shared/errors/app.error.js'

const ARGON2_OPTIONS: HashOptions = {
	type: argon2.argon2id,
	memoryCost: 19_456,
	timeCost: 2,
	parallelism: 1,
}

export class Argon2PasswordHasher implements PasswordHasher {
	public hash(password: string): Promise<string> {
		if (password.length < 8) {
			throw new AppError('INVALID_PARAMETERS', 'Password must contain at least 8 characters')
		}
		return argon2.hash(password, ARGON2_OPTIONS)
	}

	public compare(password: string, passwordHash: string): Promise<boolean> {
		return argon2.verify(passwordHash, password)
	}
}
