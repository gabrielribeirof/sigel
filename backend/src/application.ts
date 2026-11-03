import { EnvConfig } from './config/env/env.config.js'
import { VineEnvValidator } from './config/env/vine.env-validator.js'
import { UserTypeormEntity } from './config/typeorm/entities/user.typeorm-entity.js'
import { EmployeeTypeormEntity } from './config/typeorm/entities/employee.typeorm-entity.js'
import { RoleTypeormEntity } from './config/typeorm/entities/role.typeorm-entity.js'
import {
	type HttpServer,
} from './infrastructure/http/http.types.js'
import { TypeORMUserRepository } from './infrastructure/repositories/typeorm/user.repository.js'
import { TypeORMEmployeeRepository } from './infrastructure/repositories/typeorm/employee.repository.js'
import { TypeORMRoleRepository } from './infrastructure/repositories/typeorm/role.repository.js'
import { Argon2PasswordHasher } from './infrastructure/providers/password-hasher/argon2.password-hasher.js'
import { UserService } from './services/user.service.js'
import { EmployeeService } from './services/employee.service.js'
import { RoleService } from './services/role.service.js'
import { UserController } from './controllers/users/users.controller.js'
import { EmployeeController } from './controllers/employees/employees.controller.js'
import { RoleController } from './controllers/roles/roles.controller.js'
import { HealthController } from './controllers/health.controller.js'
import { Identifier } from './domain/shared/identifier.js'
import { Email } from './domain/user/email.js'
import { UUIDv7IdentifierProvider } from './infrastructure/providers/identity/uuid-v7.identifier-provider.js'
import { ValidatorEmailValidator } from './infrastructure/providers/identity/validator.email-validator.js'
import { AuthTokenTypeormEntity } from './config/typeorm/entities/auth-token.typeorm-entity.js'
import { AuthTokenRepository } from './infrastructure/repositories/typeorm/auth-token.repository.js'
import { AuthService } from './services/auth.service.js'
import { AuthController } from './controllers/auth/auth.controller.js'
import { JoseTokenProvider } from './infrastructure/providers/token/jose-token.provider.js'
import { CryptoRefreshTokenProvider } from './infrastructure/providers/token/crypto-refresh-token.provider.js'

import { CategoryTypeormEntity } from './config/typeorm/entities/category.typeorm-entity.js'
import { EquipmentTypeormEntity } from './config/typeorm/entities/equipment.typeorm-entity.js'
import { PromotionTypeormEntity } from './config/typeorm/entities/promotion.typeorm-entity.js'

export class Application {
	public constructor(private readonly httpServer: HttpServer) {
		Identifier.configure(new UUIDv7IdentifierProvider())
		Email.configure(new ValidatorEmailValidator())
		void this.initialize()
	}

	private async initialize(): Promise<void> {
		await EnvConfig.init(new VineEnvValidator())

		const { TypeORMDataSource } = await import('./config/typeorm/data-source.js')
		await TypeORMDataSource.initialize()

		const users = new TypeORMUserRepository(TypeORMDataSource.getRepository(UserTypeormEntity))
		const employees = new TypeORMEmployeeRepository(TypeORMDataSource.getRepository(EmployeeTypeormEntity))
		const roles = new TypeORMRoleRepository(TypeORMDataSource.getRepository(RoleTypeormEntity))
		const tokens = new AuthTokenRepository(TypeORMDataSource.getRepository(AuthTokenTypeormEntity))

		const userService = new UserService(users, roles, new Argon2PasswordHasher(), tokens)
		const employeeService = new EmployeeService(employees)
		const roleService = new RoleService(roles)
		const authService = new AuthService(
			userService,
			tokens,
			new JoseTokenProvider(),
			new CryptoRefreshTokenProvider(),
		)
		this.httpServer.setAuthentication?.(request => authService.authenticate(request))

		new HealthController(this.httpServer)
		new AuthController(authService, this.httpServer)
		new UserController(userService, this.httpServer)
		new EmployeeController(employeeService, this.httpServer)
		new RoleController(roleService, this.httpServer)

		const { CatalogController } = await import('./controllers/catalog/catalog.controller.js')

		new CatalogController(
			this.httpServer,
			TypeORMDataSource.getRepository(CategoryTypeormEntity),
			TypeORMDataSource.getRepository(EquipmentTypeormEntity),
			TypeORMDataSource.getRepository(PromotionTypeormEntity),
		)

		this.httpServer.listen(EnvConfig.get('HTTP_PORT'))
	}
}
