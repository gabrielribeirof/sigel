export type ErrorDetails = Record<string, string[]>

export class AppError extends Error {
	public constructor(
		public readonly type: string,
		message: string,
		public readonly errors?: ErrorDetails,
		public readonly statusCode: number = AppError.statusCodeFor(type),
	) {
		super(message)
		this.name = 'AppError'
	}

	private static statusCodeFor(type: string): number {
		if (type === 'INVALID_PARAMETERS') return 400
		if (type === 'INVALID_CREDENTIALS') return 401
		if (type === 'NOT_FOUND') return 404
		if (type === 'CONFLICT') return 409
		return 500
	}
}

export class InvalidParametersError extends AppError {
	public constructor(errors: ErrorDetails) {
		super('INVALID_PARAMETERS', 'Parâmetros inválidos', errors)
	}
}

export class InvalidCredentialsError extends AppError {
	public constructor() {
		super('INVALID_CREDENTIALS', 'Credenciais inválidas')
	}
}

export class NotFoundError extends AppError {
	public constructor(resource: string) {
		super('NOT_FOUND', `${resource} not found`)
	}
}

export class ConflictError extends AppError {
	public constructor(message: string) {
		super('CONFLICT', message)
	}
}
