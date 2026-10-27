import { Employee } from '../../domain/employee/employee.js'
import type { EmployeeTypeormEntity } from '../../config/typeorm/entities/employee.typeorm-entity.js'
import { Identifier } from '../../domain/shared/identifier.js'
import { EmployeeName } from '../../domain/employee/employee-name.js'
import { Registration } from '../../domain/employee/registration.js'
import { formatDateOnly, parseDateOnly } from '../dates/date-only.js'

export type EmployeeDTO = {
	id: string
	registration: string
	name: string
	sector: Employee['sector']
	admissionDate: string
	terminationDate: string | null
	userId: string | null
	createdAt: string
	updatedAt: string
}

export class EmployeeMapper {
	public static toDomain(entity: EmployeeTypeormEntity): Employee {
		return Employee.reconstitute({
			...entity,
			admissionDate: parseDateOnly(entity.admissionDate),
			terminationDate: entity.terminationDate ? parseDateOnly(entity.terminationDate) : null,
			id: Identifier.from(entity.id),
			registration: Registration.create(entity.registration),
			name: EmployeeName.create(entity.name),
			userId: entity.userId ? Identifier.from(entity.userId) : null,
		})
	}

	public static toPersistence(employee: Employee): EmployeeTypeormEntity {
		return {
			id: employee.id.value,
			registration: employee.registration,
			name: employee.name,
			sector: employee.sector,
			admissionDate: formatDateOnly(employee.admissionDate),
			terminationDate: employee.terminationDate ? formatDateOnly(employee.terminationDate) : null,
			userId: employee.userId?.value ?? null,
			createdAt: employee.createdAt,
			updatedAt: employee.updatedAt,
		}
	}

	public static toDTO(employee: Employee): EmployeeDTO {
		return {
			id: employee.id.value,
			registration: employee.registration,
			name: employee.name,
			sector: employee.sector,
			admissionDate: formatDateOnly(employee.admissionDate),
			terminationDate: employee.terminationDate ? formatDateOnly(employee.terminationDate) : null,
			userId: employee.userId?.value ?? null,
			createdAt: employee.createdAt.toISOString(),
			updatedAt: employee.updatedAt.toISOString(),
		}
	}
}
