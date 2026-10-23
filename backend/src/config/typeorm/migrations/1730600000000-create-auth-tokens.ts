import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAuthTokens1730600000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      CREATE TABLE auth_tokens (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type varchar(20) NOT NULL CHECK (type IN ('access', 'refresh')),
        token_hash varchar(128) NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        created_at timestamptz NOT NULL
      )
    `)
		await queryRunner.query('CREATE INDEX auth_tokens_user_active_idx ON auth_tokens (user_id, revoked_at)')
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP INDEX auth_tokens_user_active_idx')
		await queryRunner.query('DROP TABLE auth_tokens')
	}
}
