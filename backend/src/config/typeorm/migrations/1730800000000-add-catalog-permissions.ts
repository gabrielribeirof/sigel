import { MigrationInterface, QueryRunner } from 'typeorm'
import { Permission, allPermissionsMask } from '../../../domain/role/permission.js'

const ADMINISTRATOR_ROLE_ID = '01900000-0000-7000-8000-000000000001'

export class AddCatalogPermissions1730800000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const [key, bit] of Object.entries(Permission)) {
			await queryRunner.query(
				'DELETE FROM permissions WHERE (key = $1 AND bit <> $2) OR (bit = $2 AND key <> $1)',
				[key, bit.toString()],
			)
			await queryRunner.query(
				'INSERT INTO permissions (key, bit) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
				[key, bit.toString()],
			)
		}

		await queryRunner.query(
			'UPDATE roles SET permissions_mask = $1, updated_at = $2 WHERE id = $3',
			[allPermissionsMask().toString(), new Date(), ADMINISTRATOR_ROLE_ID],
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const previousMask = (
			Permission.ManageUsers.value
			| Permission.ManageEmployees.value
			| Permission.ManageRoles.value
		).toString()

		await queryRunner.query(
			'UPDATE roles SET permissions_mask = $1, updated_at = $2 WHERE id = $3',
			[previousMask, new Date(), ADMINISTRATOR_ROLE_ID],
		)

		await queryRunner.query(
			'DELETE FROM permissions WHERE key IN ($1, $2, $3)',
			['ManageCategories', 'ManageEquipments', 'ManagePromotions'],
		)
	}
}
