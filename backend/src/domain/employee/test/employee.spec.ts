import { Employee } from '../employee.js'
import { EmployeeName } from '../employee-name.js'
import { Registration } from '../registration.js'

const validEmployee = {
	registration: Registration.create('REG-1'),
	name: EmployeeName.create('Ada Lovelace'),
	sector: 'administrative' as const,
	admissionDate: new Date('2024-01-01'),
	terminationDate: null,
	userId: null,
}

describe('Employee', () => {
	it('should create an employee and expose its employment data', () => {
		const sut = Employee.create({
			...validEmployee,
			registration: Registration.create(' REG-1 '),
			name: EmployeeName.create(' Ada Lovelace '),
		})

		expect(sut.registration).toBe('REG-1')
		expect(sut.name).toBe('Ada Lovelace')
		expect(sut.sector).toBe('administrative')
		expect(sut.terminationDate).toBeNull()
		expect(sut.userId).toBeNull()
		expect(sut.id.value).toBe('01900000-0000-7000-8000-000000000000')
	})

	it('should reject a termination date before admission', () => {
		expect(() => Employee.create({
			...validEmployee,
			terminationDate: new Date('2023-12-31'),
		})).toThrow('Termination date cannot precede admission date')
	})

	it('should update employment data and reject invalid date ranges', () => {
		const sut = Employee.create(validEmployee)
		const admissionDate = new Date('2024-02-01')
		const terminationDate = new Date('2024-12-31')

		sut.update({
			name: EmployeeName.create('Grace Hopper'),
			registration: Registration.create('REG-2'),
			sector: 'service',
			admissionDate,
			terminationDate,
		})

		expect(sut.name).toBe('Grace Hopper')
		expect(sut.registration).toBe('REG-2')
		expect(sut.sector).toBe('service')
		expect(sut.admissionDate).toBe(admissionDate)
		expect(sut.terminationDate).toBe(terminationDate)
		expect(() => sut.update({ terminationDate: new Date('2023-12-31') }))
			.toThrow('Termination date cannot precede admission date')
	})
})
