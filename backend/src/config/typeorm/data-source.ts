import { DataSource } from 'typeorm'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UserTypeormEntity } from './entities/user.typeorm-entity.js'
import { EmployeeTypeormEntity } from './entities/employee.typeorm-entity.js'
import { RoleTypeormEntity } from './entities/role.typeorm-entity.js'
import { PermissionTypeormEntity } from './entities/permission.typeorm-entity.js'
import { AuthTokenTypeormEntity } from './entities/auth-token.typeorm-entity.js'
import { CustomerTypeormEntity } from './entities/customer.typeorm-entity.js'
import { SupplierTypeormEntity } from './entities/supplier.typeorm-entity.js'
import { EnvConfig } from '../env/env.config.js'

const directory = dirname(fileURLToPath(import.meta.url))

export const TypeORMDataSource = new DataSource({
	type: 'postgres',
	host: EnvConfig.get('DATABASE_HOST'),
	port: Number(EnvConfig.get('DATABASE_PORT')),
	username: EnvConfig.get('DATABASE_USER'),
	password: EnvConfig.get('DATABASE_PASSWORD'),
	database: EnvConfig.get('DATABASE_NAME'),
	synchronize: false,
	logging: true,
	entities: [
		UserTypeormEntity,
		EmployeeTypeormEntity,
		RoleTypeormEntity,
		PermissionTypeormEntity,
		AuthTokenTypeormEntity,
		CustomerTypeormEntity,
		SupplierTypeormEntity,
	],
	migrations: [join(directory, 'migrations/*.{js,ts}')],
})
