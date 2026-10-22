import { AppError } from '../../shared/errors/app.error.js'
import { ValueObject } from '../../shared/seedwork/value-object.js'
import type { IdentifierProvider } from './identifier-provider.js'

export class Identifier extends ValueObject<string> {
	private static provider: IdentifierProvider

	private constructor(value: string) {
		super(value)
	}

	public static configure(provider: IdentifierProvider): void {
		Identifier.provider = provider
	}

	public static generate(): Identifier {
		return new Identifier(Identifier.getProvider().generate())
	}

	public static from(value: string | Identifier): Identifier {
		if (value instanceof Identifier) return value
		if (!Identifier.getProvider().isValid(value)) {
			throw new AppError('INVALID_PARAMETERS', 'A valid UUIDv7 is required')
		}
		return new Identifier(value.toLowerCase())
	}

	private static getProvider(): IdentifierProvider {
		if (!Identifier.provider) throw new AppError('INVALID_PARAMETERS', 'Identifier provider is not configured')
		return Identifier.provider
	}
}
