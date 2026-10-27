import { AuthService } from '../../services/auth.service.js'
import type { HttpServer, Request, Response } from '../../infrastructure/http/http.types.js'
import { validate } from '../../shared/validation/validate.js'
import { userLoginSchema } from '../users/schemas/user.schemas.js'

export class AuthController {
	public constructor(private readonly service: AuthService, httpServer: HttpServer) {
		httpServer.register('POST', '/auth/login', request => this.login(request), { public: true })
		httpServer.register('GET', '/auth/me', request => this.me(request))
		httpServer.register('POST', '/auth/refresh', request => this.refresh(request), { public: true })
		httpServer.register('POST', '/auth/logout', request => this.logout(request), { public: true })
	}

	public async login(request: Request): Promise<Response> {
		const body = await validate(userLoginSchema, request.body)
		return this.service.login(body.email, body.password)
	}

	public refresh(request: Request): Promise<Response> {
		return this.service.refresh(request)
	}

	public me(request: Request): Promise<Response> {
		return this.service.me(request)
	}

	public logout(request: Request): Promise<Response> {
		return this.service.logout(request)
	}
}
