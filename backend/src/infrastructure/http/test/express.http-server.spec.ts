import request from 'supertest'
import { ExpressHttpServer } from '../express.http-server.js'
import { AppError } from '../../../shared/errors/app.error.js'

describe('ExpressHttpServer', () => {
	it('should expose registered routes through HTTP', async () => {
		const sut = new ExpressHttpServer()
		sut.register('GET', '/health', async () => ({
			statusCode: 200,
			body: { status: 'ok' },
		}))

		const response = await request(sut.expressApp).get('/health')

		expect(response.status).toBe(200)
		expect(response.body).toEqual({ status: 'ok' })
	})

	it('should translate validation and unexpected errors into HTTP responses', async () => {
		const sut = new ExpressHttpServer()
		sut.register('GET', '/invalid', async () => {
			throw new AppError('INVALID_PARAMETERS', 'Invalid parameters', { name: ['Campo obrigatório'] })
		})
		sut.register('GET', '/broken', async () => {
			throw new Error('unexpected')
		})

		const invalid = await request(sut.expressApp).get('/invalid')
		const broken = await request(sut.expressApp).get('/broken')

		expect(invalid.status).toBe(400)
		expect(invalid.body).toEqual({
			type: 'INVALID_PARAMETERS',
			message: 'Invalid parameters',
			errors: { name: ['Campo obrigatório'] },
		})
		expect(broken.status).toBe(500)
		expect(broken.body.type).toBe('INTERNAL_ERROR')
	})

	it('should use the status code defined by an application error', async () => {
		const sut = new ExpressHttpServer()
		sut.register('GET', '/missing', async () => {
			throw new AppError('NOT_FOUND', 'Recurso não encontrado')
		})

		const response = await request(sut.expressApp).get('/missing')

		expect(response.status).toBe(404)
		expect(response.body).toEqual({
			type: 'NOT_FOUND',
			message: 'Recurso não encontrado',
		})
	})
})
