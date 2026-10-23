import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('roles')
export class RoleTypeormEntity {
	@PrimaryColumn('uuid')
	public id!: string

	@Column({ unique: true })
	public name!: string

	@Column({
		name: 'permissions_mask',
		type: 'numeric',
		precision: 39,
		scale: 0,
		default: 0,
	})
	public permissionsMask!: string

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
