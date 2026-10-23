export type EnvSource = Record<string, unknown>

export type EnvValues = {
	HTTP_PORT: number
	DATABASE_HOST: string
	DATABASE_PORT: number
	DATABASE_USER: string
	DATABASE_PASSWORD: string
	DATABASE_NAME: string
	JWT_SECRET: string
}

export interface EnvValidator {
	validator(source: EnvSource): EnvValues | Promise<EnvValues>
}
