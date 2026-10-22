import type { Employee } from './employee.js'
import type { Identifier } from '../shared/identifier.js'

export interface EmployeeRepository {
	save(employee: Employee): Promise<Employee>
	findById(id: Identifier): Promise<Employee | null>
	findByRegistration(registration: string): Promise<Employee | null>
	findAll(): Promise<Employee[]>
	delete(id: Identifier): Promise<void>
}
