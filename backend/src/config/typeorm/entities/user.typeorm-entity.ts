import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('users')
export class UserTypeormEntity {
	@PrimaryColumn('uuid')
	public id!: string

	@Column({ unique: true })
	public email!: string

	@Column({ name: 'password_hash' })
	public passwordHash!: string

	@Column({
		name: 'role_id',
		type: 'uuid',
	})
	public roleId!: string

	@Column({
		name: 'employee_id',
		type: 'uuid',
		nullable: true,
		unique: true,
	})
	public employeeId!: string | null

	@Column({ default: true })
	public active!: boolean

	@Column({
		name: 'created_at',
		type: 'timestamptz',
	})
	public createdAt!: Date

	@Column({
		name: 'updated_at',
		type: 'timestamptz',
	})
	public updatedAt!: Date
}
