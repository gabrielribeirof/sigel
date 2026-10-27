export abstract class ValueObject<T> {
	protected constructor(public readonly value: T) {}

	public equals(other: ValueObject<T>): boolean {
		return this.value === other.value
	}

	public toString(): string {
		return String(this.value)
	}
}
