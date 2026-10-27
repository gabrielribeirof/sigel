export type Response = {
	statusCode: number
	body: unknown
	cookies?: Cookie[]
}

export type Cookie = {
	name: string
	value: string
	maxAge?: number
}

export enum StatusCode {
	Ok = 200,
	Created = 201,
	BadRequest = 400,
	Unauthorized = 401,
	NotFound = 404,
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type Request = {
	params: Record<string, string>
	query: Record<string, string>
	body: unknown
	cookies?: Record<string, string>
	userId?: string
}
export type RouteHandler = (request: Request) => Response | Promise<Response>
export type AuthenticationHandler = (request: Request) => Promise<string>

export interface HttpServer {
	register(method: HttpMethod, path: string, handler: RouteHandler, options?: { public?: boolean }): void
	setAuthentication?(handler: AuthenticationHandler): void
	listen(port?: number): void
}
