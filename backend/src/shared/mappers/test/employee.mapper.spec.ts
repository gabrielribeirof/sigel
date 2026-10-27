import { Employee } from '../../../domain/employee/employee.js'
import { EmployeeMapper } from '../employee.mapper.js'
import { EmployeeName } from '../../../domain/employee/employee-name.js'
import { Registration } from '../../../domain/employee/registration.js'

describe('EmployeeMapper', () => {
	it('should map an employee to persistence, domain and DTO representations', () => {
		const sut = Employee.create({
			registration: Registration.create('REG-1'),
			name: EmployeeName.create('Ada Lovelace'),
			sector: 'administrative',
			admissionDate: new Date('2024-01-01'),
			terminationDate: null,
			userId: null,
		})
		const persisted = EmployeeMapper.toPersistence(sut)

		expect(EmployeeMapper.toDTO(sut)).toMatchObject({
			registration: 'REG-1',
			terminationDate: null,
		})
		expect(EmployeeMapper.toDomain(persisted).id.value).toBe(sut.id.value)
	})
})
