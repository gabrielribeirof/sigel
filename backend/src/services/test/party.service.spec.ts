import type { Repository } from 'typeorm'
import { PartyService } from '../party.service.js'
import { CustomerTypeormEntity } from '../../config/typeorm/entities/customer.typeorm-entity.js'
import { SupplierTypeormEntity } from '../../config/typeorm/entities/supplier.typeorm-entity.js'
import { Identifier } from '../../domain/shared/identifier.js'
import { UUIDv7IdentifierProvider } from '../../infrastructure/providers/identity/uuid-v7.identifier-provider.js'
import { ConflictError, InvalidParametersError, NotFoundError } from '../../shared/errors/app.error.js'

function createInMemoryRepository<T extends {
	id: string
	name: string
	document: string
}>(): Repository<T> {
	const items = new Map<string, T>()
	return {
		create: () => ({}) as T,
		find: async () => [...items.values()].sort((a, b) => a.name.localeCompare(b.name)),
		findOneBy: async (where: Partial<T>) => {
			if (where.id !== undefined) return items.get(where.id) ?? null
			if (where.document !== undefined) {
				return [...items.values()].find(item => item.document === where.document) ?? null
			}
			return null
		},
		save: async (entity: T) => {
			const copy = { ...entity }
			items.set(copy.id, copy)
			return copy
		},
		delete: async (id: string) => {
			const existed = items.delete(id)
			return { affected: existed ? 1 : 0 }
		},
	} as unknown as Repository<T>
}

describe('PartyService', () => {
	beforeAll(() => {
		Identifier.configure(new UUIDv7IdentifierProvider())
	})

	it('should create, list, find, update and delete PF and PJ customers', async () => {
		const service = new PartyService<CustomerTypeormEntity>(createInMemoryRepository(), 'customer')

		const pf = await service.create({
			type: 'PF',
			name: '  Maria Silva  ',
			document: '529.982.247-25',
			email: '  Maria@Example.COM ',
			phone: ' (18) 99999-0000 ',
			address: ' Rua Central, 100 ',
		})

		expect(pf.type).toBe('PF')
		expect(pf.name).toBe('Maria Silva')
		expect(pf.document).toBe('52998224725')
		expect(pf.email).toBe('maria@example.com')
		expect(pf.phone).toBe('(18) 99999-0000')
		expect(pf.address).toBe('Rua Central, 100')

		const pj = await service.create({
			type: 'PJ',
			name: 'Buffet Estrela Ltda',
			document: '11.222.333/0001-81',
		})

		expect(pj.type).toBe('PJ')
		expect(pj.document).toBe('11222333000181')
		expect(pj.email).toBeNull()
		expect(pj.phone).toBeNull()
		expect(pj.address).toBeNull()

		const all = await service.findAll()
		expect(all.map(item => item.name)).toEqual(['Buffet Estrela Ltda', 'Maria Silva'])

		const found = await service.findById(pf.id)
		expect(found.document).toBe('52998224725')

		const updated = await service.update(pf.id, {
			name: 'Maria Souza',
			email: '',
		})
		expect(updated.name).toBe('Maria Souza')
		expect(updated.document).toBe('52998224725')
		expect(updated.email).toBeNull()
		expect(updated.phone).toBe('(18) 99999-0000')

		await service.delete(pf.id)
		await expect(service.findById(pf.id)).rejects.toThrow(NotFoundError)
	})

	it('should create and manage suppliers with valid CNPJ', async () => {
		const service = new PartyService<SupplierTypeormEntity>(createInMemoryRepository(), 'supplier')

		const supplier = await service.create({
			name: 'Som & Luz Distribuidora',
			document: '11.444.777/0001-61',
			email: 'contato@someluz.com.br',
		})

		expect(supplier.document).toBe('11444777000161')
		expect('type' in supplier).toBe(false)

		const updated = await service.update(supplier.id, { document: '11.222.333/0001-81' })
		expect(updated.document).toBe('11222333000181')

		await service.delete(supplier.id)
		await expect(service.findById(supplier.id)).rejects.toThrow(NotFoundError)
	})

	it('should reject invalid CPF/CNPJ, duplicates and invalid optional fields', async () => {
		const customers = new PartyService<CustomerTypeormEntity>(createInMemoryRepository(), 'customer')
		const suppliers = new PartyService<SupplierTypeormEntity>(createInMemoryRepository(), 'supplier')

		await expect(customers.create({
			type: 'PF',
			name: 'Inválido',
			document: '111.111.111-11',
		})).rejects.toThrow(InvalidParametersError)

		await expect(customers.create({
			type: 'PF',
			name: 'Inválido',
			document: '52998224720',
		})).rejects.toThrow(InvalidParametersError)

		await expect(suppliers.create({
			name: 'Inválido',
			document: '11222333000180',
		})).rejects.toThrow(InvalidParametersError)

		await expect(customers.create({
			type: 'PF',
			name: 'Email Inválido',
			document: '52998224725',
			email: 'nao-e-email',
		})).rejects.toThrow(InvalidParametersError)

		const first = await customers.create({
			type: 'PF',
			name: 'Cliente Um',
			document: '52998224725',
		})
		const second = await customers.create({
			type: 'PF',
			name: 'Cliente Dois',
			document: '11144477735',
		})

		await expect(customers.create({
			type: 'PF',
			name: 'Duplicado',
			document: '529.982.247-25',
		})).rejects.toThrow(ConflictError)

		await expect(customers.update(second.id, { document: first.document })).rejects.toThrow(ConflictError)

		await expect(customers.update(first.id, { type: 'PJ' })).rejects.toThrow(InvalidParametersError)
	})
})
