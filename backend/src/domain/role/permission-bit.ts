import { AppError } from '../../shared/errors/app.error.js'
import { ValueObject } from '../../shared/seedwork/value-object.js'

export class PermissionBit extends ValueObject<bigint> {
	private constructor(value: bigint) {
		super(value)
	}

	public static create(value: bigint): PermissionBit {
		if (value <= 0n || (value & (value - 1n)) !== 0n) {
			throw new AppError('INVALID_PARAMETERS', 'Permission bit must contain exactly one permission')
		}
		return new PermissionBit(value)
	}
}
