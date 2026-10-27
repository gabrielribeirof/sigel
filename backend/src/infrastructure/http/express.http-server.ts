import express, {
	type Express,
	type Request,
	type Response as ExpressResponse,
} from 'express'
import type {
	HttpMethod,
	HttpServer,
	RouteHandler,
	AuthenticationHandler,
} from './http.types.js'
import { AppError } from '../../shared/errors/app.error.js'

export class ExpressHttpServer implements HttpServer {
	private readonly app: Express

	private authentication?: AuthenticationHandler

	public constructor() {
		this.app = express()
		this.app.use((request, response, next) => {
			response.header('Access-Control-Allow-Origin', request.headers.origin ?? '*')
			response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
			response.header('Access-Control-Allow-Headers', 'Content-Type')
			response.header('Access-Control-Allow-Credentials', 'true')
			if (request.method === 'OPTIONS') {
				response.sendStatus(204)
				return
			}
			next()
		})
		this.app.use(express.json())
	}

	public get expressApp(): Express {
		return this.app
	}

	public setAuthentication(handler: AuthenticationHandler): void {
		this.authentication = handler
	}

	public register(
		method: HttpMethod,
		path: string,
		handler: RouteHandler,
		options: { public?: boolean } = {},
	): void {
		const route = async (request: Request, response: ExpressResponse) => {
			try {
				const cookieHeader = request.headers.cookie ?? ''
				const cookies = Object.fromEntries(cookieHeader.split(';').filter(Boolean).map((cookie) => {
					const [name, ...value] = cookie.trim().split('=')
					return [name, decodeURIComponent(value.join('='))]
				}))
				const input = {
					params: request.params as Record<string, string>,
					query: request.query as Record<string, string>,
					body: request.body,
					cookies,
				}
				const userId = options.public || !this.authentication ? undefined : await this.authentication(input)
				const result = await handler({
					...input,
					userId,
				})
				for (const cookie of result.cookies ?? []) {
					response.cookie(cookie.name, cookie.value, {
						httpOnly: true,
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						maxAge: cookie.maxAge,
						path: '/',
					})
				}
				response.status(result.statusCode).json(result.body)
			}
			catch (error) {
				const appError = error instanceof AppError
					? error
					: new AppError('INTERNAL_ERROR', 'Erro interno do servidor')
				response.status(appError.statusCode).json({
					type: appError.type,
					message: appError.message,
					...(appError.errors ? { errors: appError.errors } : {}),
				})
			}
		}

		switch (method) {
			case 'GET':
				this.app.get(path, route)
				break
			case 'POST':
				this.app.post(path, route)
				break
			case 'PUT':
				this.app.put(path, route)
				break
			case 'PATCH':
				this.app.patch(path, route)
				break
			case 'DELETE':
				this.app.delete(path, route)
				break
		}
	}

	public listen(port: number = 3000): void {
		this.app.listen(port, '0.0.0.0', () => {
			console.log(`Backend listening on port ${port}`)
		})
	}
}
