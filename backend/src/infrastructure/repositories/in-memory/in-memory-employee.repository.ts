import type { Employee } from '../../../domain/employee/employee.js'
import type { EmployeeRepository } from '../../../domain/employee/employee.repository.js'
import type { Identifier } from '../../../domain/shared/identifier.js'

export class InMemoryEmployeeRepository implements EmployeeRepository {
	private readonly items = new Map<string, Employee>()

	public async save(employee: Employee): Promise<Employee> {
		this.items.set(employee.id.value, employee)
		return employee
	}

	public async findById(id: Identifier): Promise<Employee | null> {
		return this.items.get(id.value) ?? null
	}

	public async findByRegistration(registration: string): Promise<Employee | null> {
		return [...this.items.values()].find(item => item.registration === registration) ?? null
	}

	public async findAll(): Promise<Employee[]> {
		return [...this.items.values()]
	}

	public async delete(id: Identifier): Promise<void> {
		this.items.delete(id.value)
	}
}
