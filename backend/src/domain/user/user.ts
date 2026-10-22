import { AppError } from '../../shared/errors/app.error.js'
import { Identifier } from '../shared/identifier.js'
import { Email } from './email.js'
import { Password } from './password.js'

export type UserCreateProps = {
	email: string
	password: Password
	roleId: Identifier
	employeeId: Identifier | null
}

export type UserReconstitutedProps = {
	id: string | Identifier
	email: string
	password: Password
	roleId: Identifier
	employeeId: Identifier | null
	active: boolean
	createdAt: Date
	updatedAt: Date
}

export type UserUpdateProps = {
	email?: string
	password?: Password
	roleId?: Identifier
	employeeId?: Identifier | null
	active?: boolean
}

export const MASTER_USER_ID = '01900000-0000-7000-8000-000000000002'

export class User {
	private readonly _id: Identifier

	private _email: Email

	private _password: Password

	private _roleId: Identifier

	private _employeeId: Identifier | null

	private _active: boolean

	private readonly _createdAt: Date

	private _updatedAt: Date

	private constructor(props: UserReconstitutedProps) {
		if (!props.roleId) throw new AppError('INVALID_PARAMETERS', 'User role is required')
		this._id = Identifier.from(props.id)
		this._email = Email.create(props.email)
		this._password = props.password
		this._roleId = props.roleId
		this._employeeId = props.employeeId
		this._active = props.active
		this._createdAt = props.createdAt
		this._updatedAt = props.updatedAt
	}

	public static create(props: UserCreateProps): User {
		const now = new Date()
		return new User({
			id: Identifier.generate(),
			email: props.email,
			password: props.password,
			roleId: props.roleId,
			employeeId: props.employeeId,
			active: true,
			createdAt: now,
			updatedAt: now,
		})
	}

	public static reconstitute(props: UserReconstitutedProps): User {
		return new User(props)
	}

	public get id(): Identifier {
		return this._id
	}

	public get email(): string {
		return this._email.value
	}

	public get password(): Password {
		return this._password
	}

	public get roleId(): Identifier {
		return this._roleId
	}

	public get employeeId(): Identifier | null {
		return this._employeeId
	}

	public get active(): boolean {
		return this._active
	}

	public get createdAt(): Date {
		return this._createdAt
	}

	public get updatedAt(): Date {
		return this._updatedAt
	}

	public update(props: UserUpdateProps): void {
		if (props.email !== undefined) {
			this._email = Email.create(props.email)
		}
		if (props.password !== undefined) this._password = props.password
		if (props.roleId !== undefined) this._roleId = props.roleId
		if (props.employeeId !== undefined) {
			this._employeeId = props.employeeId
		}
		if (props.active !== undefined) this._active = props.active
		this._updatedAt = new Date()
	}
}
