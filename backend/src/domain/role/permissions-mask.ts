import { AppError } from '../../shared/errors/app.error.js'
import { ValueObject } from '../../shared/seedwork/value-object.js'

export class PermissionsMask extends ValueObject<bigint> {
	private constructor(value: bigint) {
		super(value)
	}

	public static create(value: bigint = 0n): PermissionsMask {
		if (value < 0n) throw new AppError('INVALID_PARAMETERS', 'Role permissions mask cannot be negative')
		return new PermissionsMask(value)
	}

	public grant(bit: bigint | { value: bigint }): PermissionsMask {
		return PermissionsMask.create(this.value | (typeof bit === 'bigint' ? bit : bit.value))
	}

	public revoke(bit: bigint | { value: bigint }): PermissionsMask {
		const value = typeof bit === 'bigint' ? bit : bit.value
		return PermissionsMask.create(this.value & ~value)
	}

	public has(bit: bigint | { value: bigint }): boolean {
		const value = typeof bit === 'bigint' ? bit : bit.value
		return (this.value & value) === value
	}
}
