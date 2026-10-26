import { EmployeeService } from '../employee.service.js'
import {
	InMemoryEmployeeRepository,
} from '../../infrastructure/repositories/in-memory/in-memory-employee.repository.js'

describe('EmployeeService', () => {
	it('should persist and update employees', async () => {
		const repository = new InMemoryEmployeeRepository()
		const sut = new EmployeeService(repository)
		const employee = await sut.create({
			registration: 'REG-1',
			name: 'Ada Lovelace',
			sector: 'administrative',
			admissionDate: new Date('2024-01-01'),
			terminationDate: null,
			userId: null,
		})

		await sut.update(employee.id, { name: 'Grace Hopper' })
		expect((await sut.findById(employee.id))?.name).toBe('Grace Hopper')
		await sut.delete(employee.id)
		expect(await sut.findById(employee.id)).toBeNull()
	})

	it('should not create duplicate registrations or update missing employees', async () => {
		const repository = new InMemoryEmployeeRepository()
		const sut = new EmployeeService(repository)
		const input = {
			registration: 'REG-1',
			name: 'Ada Lovelace',
			sector: 'administrative' as const,
			admissionDate: new Date('2024-01-01'),
			terminationDate: null,
			userId: null,
		}
		await sut.create(input)
		await expect(sut.create(input)).rejects.toThrow('Employee registration already exists')
		await expect(sut.update('01900000-0000-7000-8000-000000000099', { name: 'Nobody' }))
			.rejects.toThrow('Employee not found')
	})
})
