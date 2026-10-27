import { StatusCode, type HttpServer, type Response } from '../infrastructure/http/http.types.js'

export class HealthController {
	public constructor(httpServer: HttpServer) {
		httpServer.register('GET', '/health', () => this.check(), { public: true })
	}

	private async check(): Promise<Response> {
		return {
			statusCode: StatusCode.Ok,
			body: { status: 'ok' },
		}
	}
}
