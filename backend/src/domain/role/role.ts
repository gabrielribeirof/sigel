import type { PermissionBit } from './permission.js'
import { AppError } from '../../shared/errors/app.error.js'
import { Identifier } from '../shared/identifier.js'
import { PermissionsMask } from './permissions-mask.js'

export const ADMINISTRATOR_ROLE_ID = '01900000-0000-7000-8000-000000000001'

export type RoleCreateProps = {
	name: string
	permissionsMask?: PermissionsMask
}

export type RoleReconstitutedProps = {
	id: string | Identifier
	name: string
	permissionsMask: PermissionsMask
	createdAt: Date
	updatedAt: Date
}

export class Role {
	private readonly _id: Identifier

	private _name: string

	private _permissionsMask: PermissionsMask

	private readonly _createdAt: Date

	private _updatedAt: Date

	private constructor(props: RoleReconstitutedProps) {
		if (!props.name.trim()) throw new AppError('INVALID_PARAMETERS', 'Role name is required')
		this._id = Identifier.from(props.id)
		this._name = props.name.trim()
		this._permissionsMask = props.permissionsMask
		this._createdAt = props.createdAt
		this._updatedAt = props.updatedAt
	}

	public static create(props: RoleCreateProps): Role {
		const now = new Date()
		return new Role({
			id: Identifier.generate(),
			name: props.name,
			permissionsMask: props.permissionsMask ?? PermissionsMask.create(),
			createdAt: now,
			updatedAt: now,
		})
	}

	public static reconstitute(props: RoleReconstitutedProps): Role {
		return new Role(props)
	}

	public get id(): Identifier {
		return this._id
	}

	public get name(): string {
		return this._name
	}

	public get createdAt(): Date {
		return this._createdAt
	}

	public get updatedAt(): Date {
		return this._updatedAt
	}

	public get mask(): bigint {
		return this._permissionsMask.value
	}

	public rename(name: string): void {
		this.ensureMutable()
		if (!name.trim()) throw new AppError('INVALID_PARAMETERS', 'Role name is required')
		this._name = name.trim()
		this._updatedAt = new Date()
	}

	public setPermissions(mask: bigint | PermissionsMask): void {
		this.ensureMutable()
		this._permissionsMask = mask instanceof PermissionsMask ? mask : PermissionsMask.create(mask)
		this._updatedAt = new Date()
	}

	public grant(permission: PermissionBit): void {
		this.setPermissions(this._permissionsMask.grant(permission))
	}

	public revoke(permission: PermissionBit): void {
		this.setPermissions(this._permissionsMask.revoke(permission))
	}

	public has(permission: PermissionBit): boolean {
		return this._permissionsMask.has(permission)
	}

	private ensureMutable(): void {
		if (this._id.value === ADMINISTRATOR_ROLE_ID) {
			throw new AppError('ADMINISTRATOR_ROLE_PROTECTED', 'A role administradora não pode ser alterada.')
		}
	}
}
