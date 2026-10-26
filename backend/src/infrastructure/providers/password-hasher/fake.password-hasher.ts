import type { PasswordHasher } from '../../../domain/user/password-hasher.js'

export class FakePasswordHasher implements PasswordHasher {
	public readonly hashedPasswords: string[] = []

	public async hash(password: string): Promise<string> {
		const hash = `fake:${password}`
		this.hashedPasswords.push(hash)
		return hash
	}

	public async compare(password: string, passwordHash: string): Promise<boolean> {
		return passwordHash === `fake:${password}`
	}
}
