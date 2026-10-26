import { v7, validate, version } from 'uuid'
import type { IdentifierProvider } from '../../../domain/shared/identifier-provider.js'

export class UUIDv7IdentifierProvider implements IdentifierProvider {
	public generate(): string {
		return v7()
	}

	public isValid(value: string): boolean {
		return validate(value) && version(value) === 7
	}
}
