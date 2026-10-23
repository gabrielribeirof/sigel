import type { EnvSource, EnvValidator, EnvValues } from './env.types.js'

export class EnvConfig {
	private static instance: EnvConfig | undefined

	private constructor(
		private readonly values: EnvValues,
	) {

	}

	public static async init(
		envValidator: EnvValidator,
		source: EnvSource = process.env,
	): Promise<void> {
		const values = await envValidator.validator(source)
		EnvConfig.instance = new EnvConfig(values)
	}

	public static get<K extends keyof EnvValues>(key: K): EnvValues[K] {
		if (!EnvConfig.instance?.values) {
			throw new Error('Environment config not initialized')
		}

		return EnvConfig.instance.values[key]
	}
}
