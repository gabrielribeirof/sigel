import { EnvConfig } from '../env/env.config.js'
import { VineEnvValidator } from '../env/vine.env-validator.js'

await EnvConfig.init(new VineEnvValidator())

const { TypeORMDataSource } = await import('./data-source.js')

export default TypeORMDataSource
