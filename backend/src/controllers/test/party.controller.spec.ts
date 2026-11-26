import type { Repository } from 'typeorm'
import { PartyController } from '../parties/party.controller.js'
import { PartyService } from '../../services/party.service.js'
import { CustomerTypeormEntity } from '../../config/typeorm/entities/customer.typeorm-entity.js'
import { SupplierTypeormEntity } from '../../config/typeorm/entities/supplier.typeorm-entity.js'
import type { HttpMethod, HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'
import type { Authorizer } from '../../domain/auth/authorizer.js'
import { Permission } from '../../domain/role/permission.js'
import type { PermissionBit } from '../../domain/role/permission-bit.js'
import { Identifier } from '../../domain/shared/identifier.js'
import { UUIDv7IdentifierProvider } from '../../infrastructure/providers/identity/uuid-v7.identifier-provider.js'
import { ForbiddenError } from '../../shared/errors/app.error.js'

class InMemoryHttpServer implements HttpServer {
	public readonly routes = new Map<string, {
		handler: RouteHandler
		public?: boolean
	}>()

	public register(
		method: HttpMethod,
		path: string,
		handler: RouteHandler,
		options: { public?: boolean } = {},
	): void {
		this.routes.set(`${method} ${path}`, {
			handler,
			public: options.public,
		})
	}

	public listen(): void {}
}

class RecordingAuthorizer implements Authorizer {
	public readonly calls: Array<{
		userId: string | undefined
		requirement: unknown
	}> = []

	public constructor(private readonly shouldDeny: boolean = false) {}

	public async authorize(userId: string | undefined, requirement: PermissionBit): Promise<void> {
		this.calls.push({
			userId,
			requirement,
		})
		if (this.shouldDeny) {
			throw new ForbiddenError()
		}
	}
}

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

describe('PartyController', () => {
	beforeAll(() => {
		Identifier.configure(new UUIDv7IdentifierProvider())
	})

	it('should register authenticated routes for customers and suppliers', () => {
		const httpServer = new InMemoryHttpServer()
		new PartyController(
			new PartyService<CustomerTypeormEntity>(createInMemoryRepository(), 'customer'),
			new PartyService<SupplierTypeormEntity>(createInMemoryRepository(), 'supplier'),
			new RecordingAuthorizer(),
			httpServer,
		)

		for (const resource of ['customers', 'suppliers']) {
			expect(httpServer.routes.has(`GET /${resource}`)).toBe(true)
			expect(httpServer.routes.has(`GET /${resource}/:id`)).toBe(true)
			expect(httpServer.routes.has(`POST /${resource}`)).toBe(true)
			expect(httpServer.routes.has(`PUT /${resource}/:id`)).toBe(true)
			expect(httpServer.routes.has(`DELETE /${resource}/:id`)).toBe(true)
			expect(httpServer.routes.get(`GET /${resource}`)?.public).toBeFalsy()
			expect(httpServer.routes.get(`GET /${resource}/:id`)?.public).toBeFalsy()
		}
	})

	it('should allow CRUD operations when authorized', async () => {
		const httpServer = new InMemoryHttpServer()
		const authorizer = new RecordingAuthorizer()
		const sut = new PartyController(
			new PartyService<CustomerTypeormEntity>(createInMemoryRepository(), 'customer'),
			new PartyService<SupplierTypeormEntity>(createInMemoryRepository(), 'supplier'),
			authorizer,
			httpServer,
		)

		const createdCustomer = await sut.create('customers', {
			params: {},
			query: {},
			body: {
				type: 'PF',
				name: 'João Cliente',
				document: '529.982.247-25',
				email: 'joao@example.com',
			},
			userId: 'user-1',
		})
		expect(createdCustomer.statusCode).toBe(201)
		const customerBody = createdCustomer.body as CustomerTypeormEntity
		expect(customerBody.document).toBe('52998224725')

		const fetched = await sut.get('customers', {
			params: { id: customerBody.id },
			query: {},
			body: {},
			userId: 'user-1',
		})
		expect(fetched.statusCode).toBe(200)
		expect((fetched.body as CustomerTypeormEntity).name).toBe('João Cliente')

		const updated = await sut.update('customers', {
			params: { id: customerBody.id },
			query: {},
			body: { name: 'João Atualizado' },
			userId: 'user-1',
		})
		expect(updated.statusCode).toBe(200)
		expect((updated.body as CustomerTypeormEntity).name).toBe('João Atualizado')

		const createdSupplier = await sut.create('suppliers', {
			params: {},
			query: {},
			body: {
				name: 'Fornecedor Alpha',
				document: '11.222.333/0001-81',
			},
			userId: 'user-1',
		})
		expect(createdSupplier.statusCode).toBe(201)
		const supplierBody = createdSupplier.body as SupplierTypeormEntity

		const listSuppliers = await sut.list('suppliers')
		expect(listSuppliers.statusCode).toBe(200)
		expect(listSuppliers.body).toHaveLength(1)

		const deletedSupplier = await sut.remove('suppliers', {
			params: { id: supplierBody.id },
			query: {},
			body: {},
			userId: 'user-1',
		})
		expect(deletedSupplier.statusCode).toBe(200)
		expect(deletedSupplier.body).toBeNull()
	})

	it.each([
		['customers', Permission.ManageCustomers],
		['suppliers', Permission.ManageSuppliers],
	] as const)('should authorize %s mutations with the matching permission', async (resource, permission) => {
		const httpServer = new InMemoryHttpServer()
		const authorizer = new RecordingAuthorizer(true)
		const sut = new PartyController(
			new PartyService<CustomerTypeormEntity>(createInMemoryRepository(), 'customer'),
			new PartyService<SupplierTypeormEntity>(createInMemoryRepository(), 'supplier'),
			authorizer,
			httpServer,
		)

		const listed = await sut.list(resource)
		expect(listed.statusCode).toBe(200)
		expect(authorizer.calls).toHaveLength(0)

		await expect(sut.create(resource, {
			params: {},
			query: {},
			body: {},
			userId: 'user-1',
		})).rejects.toThrow(ForbiddenError)

		await expect(sut.update(resource, {
			params: { id: '01900000-0000-7000-8000-000000000099' },
			query: {},
			body: {},
			userId: 'user-1',
		})).rejects.toThrow(ForbiddenError)

		await expect(sut.remove(resource, {
			params: { id: '01900000-0000-7000-8000-000000000099' },
			query: {},
			body: {},
			userId: 'user-1',
		})).rejects.toThrow(ForbiddenError)

		expect(authorizer.calls).toEqual([
			{
				userId: 'user-1',
				requirement: permission,
			},
			{
				userId: 'user-1',
				requirement: permission,
			},
			{
				userId: 'user-1',
				requirement: permission,
			},
		])
	})
})
