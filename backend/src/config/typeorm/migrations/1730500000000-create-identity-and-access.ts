import { MigrationInterface, QueryRunner } from 'typeorm'
import { Permission, allPermissionsMask } from '../../../domain/role/permission.js'

export class CreateIdentityAndAccess1730500000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      CREATE TABLE roles (
        id uuid PRIMARY KEY,
        name varchar(120) NOT NULL UNIQUE,
        permissions_mask numeric(39, 0) NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      )
    `)
		await queryRunner.query(`
      CREATE TABLE permissions (
        key varchar(120) PRIMARY KEY,
        bit numeric(39, 0) NOT NULL UNIQUE
      )
    `)
		await queryRunner.query(`
      CREATE TABLE employees (
        id uuid PRIMARY KEY,
        registration varchar(80) NOT NULL UNIQUE,
        name varchar(200) NOT NULL,
        sector varchar(40) NOT NULL,
        admission_date date NOT NULL,
        termination_date date,
        user_id uuid UNIQUE,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      )
    `)
		await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY,
        email varchar(255) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        role_id uuid NOT NULL REFERENCES roles(id),
        employee_id uuid UNIQUE,
        active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      )
    `)
		await queryRunner.query(`
      ALTER TABLE employees
      ADD CONSTRAINT employees_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `)
		await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_employee_id_fk FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    `)

		for (const [key, bit] of Object.entries(Permission)) {
			await queryRunner.query('INSERT INTO permissions (key, bit) VALUES ($1, $2)', [key, bit.toString()])
		}

		const administratorId = '01900000-0000-7000-8000-000000000001'
		const now = new Date()
		await queryRunner.query(
			'INSERT INTO roles (id, name, permissions_mask, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)',
			[administratorId, 'Administrador', allPermissionsMask().toString(), now],
		)
		await queryRunner.query(
			`INSERT INTO users (
        id,
        email,
        password_hash,
        role_id,
        employee_id,
        active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NULL, true, $5, $5)`,
			[
				'01900000-0000-7000-8000-000000000002',
				'admin@eventpro.com.br',
				'$argon2id$v=19$m=19456,p=1,t=2$XKsnQhbQNFVg0Uly4nz8TQ$jiQD0EOnOTFmdjnVNruVhE22QXFDT1FwXQmiBtG68jo',
				administratorId,
				now,
			],
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE users DROP CONSTRAINT users_employee_id_fk')
		await queryRunner.query('ALTER TABLE employees DROP CONSTRAINT employees_user_id_fk')
		await queryRunner.query('DROP TABLE users')
		await queryRunner.query('DROP TABLE employees')
		await queryRunner.query('DROP TABLE permissions')
		await queryRunner.query('DROP TABLE roles')
	}
}
