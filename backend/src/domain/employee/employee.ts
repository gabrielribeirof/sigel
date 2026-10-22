import { AppError } from '../../shared/errors/app.error.js'
import { Identifier } from '../shared/identifier.js'
import { EmployeeName } from './employee-name.js'
import { Registration } from './registration.js'

export type EmployeeSector = 'logistics' | 'assembly' | 'service' | 'administrative'

export type EmployeeCreateProps = {
	registration: Registration
	name: EmployeeName
	sector: EmployeeSector
	admissionDate: Date
	terminationDate: Date | null
	userId: Identifier | null
}

export type EmployeeReconstitutedProps = {
	id: string | Identifier
	registration: Registration
	name: EmployeeName
	sector: EmployeeSector
	admissionDate: Date
	terminationDate: Date | null
	userId: Identifier | null
	createdAt: Date
	updatedAt: Date
}

export type EmployeeUpdateProps = {
	registration?: Registration
	name?: EmployeeName
	sector?: EmployeeSector
	admissionDate?: Date
	terminationDate?: Date | null
	userId?: Identifier | null
}

export class Employee {
	private readonly _id: Identifier

	private _registration: Registration

	private _name: EmployeeName

	private _sector: EmployeeSector

	private _admissionDate: Date

	private _terminationDate: Date | null

	private _userId: Identifier | null

	private readonly _createdAt: Date

	private _updatedAt: Date

	private constructor(props: EmployeeReconstitutedProps) {
		if (props.terminationDate && props.terminationDate < props.admissionDate) {
			throw new AppError('INVALID_PARAMETERS', 'Termination date cannot precede admission date')
		}
		this._id = Identifier.from(props.id)
		this._registration = props.registration
		this._name = props.name
		this._sector = props.sector
		this._admissionDate = props.admissionDate
		this._terminationDate = props.terminationDate
		this._userId = props.userId
		this._createdAt = props.createdAt
		this._updatedAt = props.updatedAt
	}

	public static create(props: EmployeeCreateProps): Employee {
		const now = new Date()
		return new Employee({
			id: Identifier.generate(),
			registration: props.registration,
			name: props.name,
			sector: props.sector,
			admissionDate: props.admissionDate,
			terminationDate: props.terminationDate,
			userId: props.userId,
			createdAt: now,
			updatedAt: now,
		})
	}

	public static reconstitute(props: EmployeeReconstitutedProps): Employee {
		return new Employee(props)
	}

	public get id(): Identifier {
		return this._id
	}

	public get registration(): string {
		return this._registration.value
	}

	public get name(): string {
		return this._name.value
	}

	public get sector(): EmployeeSector {
		return this._sector
	}

	public get admissionDate(): Date {
		return this._admissionDate
	}

	public get terminationDate(): Date | null {
		return this._terminationDate
	}

	public get userId(): Identifier | null {
		return this._userId
	}

	public get createdAt(): Date {
		return this._createdAt
	}

	public get updatedAt(): Date {
		return this._updatedAt
	}

	public update(props: EmployeeUpdateProps): void {
		const admissionDate = props.admissionDate ?? this._admissionDate
		const terminationDate = props.terminationDate === undefined ? this._terminationDate : props.terminationDate
		if (terminationDate && terminationDate < admissionDate) {
			throw new AppError('INVALID_PARAMETERS', 'Termination date cannot precede admission date')
		}
		if (props.registration !== undefined) this._registration = props.registration
		if (props.name !== undefined) this._name = props.name
		if (props.sector !== undefined) this._sector = props.sector
		this._admissionDate = admissionDate
		this._terminationDate = terminationDate
		if (props.userId !== undefined) {
			this._userId = props.userId
		}
		this._updatedAt = new Date()
	}
}
