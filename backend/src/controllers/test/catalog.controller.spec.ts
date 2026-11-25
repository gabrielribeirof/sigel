import type { Repository } from 'typeorm'
import { EnvConfig } from '../../config/env/env.config.js'
import { VineEnvValidator } from '../../config/env/vine.env-validator.js'
import type { HttpMethod, HttpServer, RouteHandler } from '../../infrastructure/http/http.types.js'
import type { Authorizer } from '../../domain/auth/authorizer.js'
import { Permission } from '../../domain/role/permission.js'
import type { PermissionBit } from '../../domain/role/permission-bit.js'
import { ForbiddenError } from '../../shared/errors/app.error.js'
import type { CategoryTypeormEntity } from '../../config/typeorm/entities/category.typeorm-entity.js'
import type { EquipmentTypeormEntity } from '../../config/typeorm/entities/equipment.typeorm-entity.js'
import type { PromotionTypeormEntity } from '../../config/typeorm/entities/promotion.typeorm-entity.js'

await EnvConfig.init(new VineEnvValidator(), {
	HTTP_PORT: '4000',
	DATABASE_HOST: 'database',
	DATABASE_PORT: '5432',
	DATABASE_USER: 'myuser',
	DATABASE_PASSWORD: 'mypassword',
	DATABASE_NAME: 'mydatabase',
	JWT_SECRET: 'a-secret-with-at-least-thirty-two-characters',
})

const { CatalogController } = await import('../catalog/catalog.controller.js')

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

const emptyRepo = <T extends object>(): Repository<T> => ({ find: async () => [] }) as unknown as Repository<T>

describe('CatalogController', () => {
	it('should register public GET routes and protected write routes', () => {
		const httpServer = new InMemoryHttpServer()
		new CatalogController(
			httpServer,
			emptyRepo<CategoryTypeormEntity>(),
			emptyRepo<EquipmentTypeormEntity>(),
			emptyRepo<PromotionTypeormEntity>(),
			new RecordingAuthorizer(),
		)

		for (const resource of ['categories', 'equipments', 'promotions']) {
			expect(httpServer.routes.get(`GET /${resource}`)?.public).toBe(true)
			expect(httpServer.routes.get(`POST /${resource}`)?.public).toBeFalsy()
			expect(httpServer.routes.get(`PUT /${resource}/:id`)?.public).toBeFalsy()
			expect(httpServer.routes.get(`DELETE /${resource}/:id`)?.public).toBeFalsy()
		}
	})

	it('should allow public listing without calling authorizer', async () => {
		const httpServer = new InMemoryHttpServer()
		const authorizer = new RecordingAuthorizer(true)
		const sut = new CatalogController(
			httpServer,
			emptyRepo<CategoryTypeormEntity>(),
			emptyRepo<EquipmentTypeormEntity>(),
			emptyRepo<PromotionTypeormEntity>(),
			authorizer,
		)

		const response = await sut.list('categories')

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual([])
		expect(authorizer.calls).toHaveLength(0)
	})

	it.each([
		['categories', Permission.ManageCategories],
		['equipments', Permission.ManageEquipments],
		['promotions', Permission.ManagePromotions],
	] as const)('should authorize %s mutations with the matching permission', async (resource, permission) => {
		const httpServer = new InMemoryHttpServer()
		const authorizer = new RecordingAuthorizer(true)
		const sut = new CatalogController(
			httpServer,
			emptyRepo<CategoryTypeormEntity>(),
			emptyRepo<EquipmentTypeormEntity>(),
			emptyRepo<PromotionTypeormEntity>(),
			authorizer,
		)

		await expect(sut.save(resource, {
			params: {},
			query: {},
			body: {},
			userId: 'user-1',
		})).rejects.toThrow(ForbiddenError)

		await expect(sut.remove(resource, {
			params: { id: 'item-1' },
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
		])
	})
})
