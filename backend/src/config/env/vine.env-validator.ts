import vine from '@vinejs/vine'
import type { EnvSource, EnvValidator, EnvValues } from './env.types.js'

export class VineEnvValidator implements EnvValidator {
	private readonly schema = vine.object({
		HTTP_PORT: vine.number(),
		DATABASE_HOST: vine.string(),
		DATABASE_PORT: vine.number(),
		DATABASE_USER: vine.string(),
		DATABASE_PASSWORD: vine.string(),
		DATABASE_NAME: vine.string(),
		JWT_SECRET: vine.string().minLength(32),
	})

	public validator(source: EnvSource): Promise<EnvValues> {
		return vine.validate({
			schema: this.schema,
			data: source,
		})
	}
}
