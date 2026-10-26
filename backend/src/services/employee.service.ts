import { Employee, type EmployeeCreateProps, type EmployeeUpdateProps } from '../domain/employee/employee.js'
import type { EmployeeRepository } from '../domain/employee/employee.repository.js'
import { ConflictError, NotFoundError } from '../shared/errors/app.error.js'
import { Identifier } from '../domain/shared/identifier.js'
import { EmployeeName } from '../domain/employee/employee-name.js'
import { Registration } from '../domain/employee/registration.js'

export type EmployeeCreateInput = Omit<EmployeeCreateProps, 'registration' | 'name' | 'userId'> & {
	registration: string
	name: string
	userId: string | null
}
export type EmployeeUpdateInput = Omit<EmployeeUpdateProps, 'registration' | 'name' | 'userId'> & {
	registration?: string
	name?: string
	userId?: string | null
}

export class EmployeeService {
	public constructor(private readonly employees: EmployeeRepository) {}

	public async create(input: EmployeeCreateInput): Promise<Employee> {
		if (await this.employees.findByRegistration(input.registration)) {
			throw new ConflictError('Employee registration already exists')
		}

		return this.employees.save(Employee.create({
			...input,
			registration: Registration.create(input.registration),
			name: EmployeeName.create(input.name),
			userId: input.userId ? Identifier.from(input.userId) : null,
		}))
	}

	public findById(id: string | Identifier): Promise<Employee | null> {
		return this.employees.findById(Identifier.from(id))
	}

	public findAll(): Promise<Employee[]> {
		return this.employees.findAll()
	}

	public async update(id: string | Identifier, input: EmployeeUpdateInput): Promise<Employee> {
		const employee = await this.employees.findById(Identifier.from(id))
		if (!employee) throw new NotFoundError('Employee')
		employee.update({
			...input,
			registration: input.registration === undefined ? undefined : Registration.create(input.registration),
			name: input.name === undefined ? undefined : EmployeeName.create(input.name),
			userId: input.userId === undefined
				? undefined
				: input.userId === null ? null : Identifier.from(input.userId),
		})
		return this.employees.save(employee)
	}

	public delete(id: string | Identifier): Promise<void> {
		return this.employees.delete(Identifier.from(id))
	}
}
