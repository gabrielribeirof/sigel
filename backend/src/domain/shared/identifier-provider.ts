export interface IdentifierProvider {
	generate(): string
	isValid(value: string): boolean
}
