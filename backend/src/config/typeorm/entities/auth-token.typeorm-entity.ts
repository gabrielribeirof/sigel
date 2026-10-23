import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('auth_tokens')
export class AuthTokenTypeormEntity {
	@PrimaryColumn('uuid')
	public id!: string

	@Column({
		name: 'user_id',
		type: 'uuid',
	})
	public userId!: string

	@Column({
		type: 'varchar',
		length: 20,
	})
	public type!: 'access' | 'refresh'

	@Column({
		name: 'token_hash',
		type: 'varchar',
		length: 128,
		unique: true,
	})
	public tokenHash!: string

	@Column({
		name: 'expires_at',
		type: 'timestamptz',
	})
	public expiresAt!: Date

	@Column({
		name: 'revoked_at',
		type: 'timestamptz',
		nullable: true,
	})
	public revokedAt!: Date | null

	@Column({
		name: 'created_at',
		type: 'timestamptz',
	})
	public createdAt!: Date
}
