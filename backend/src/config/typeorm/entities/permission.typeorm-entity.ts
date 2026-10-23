import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('permissions')
export class PermissionTypeormEntity {
	@PrimaryColumn()
	public key!: string

	@Column({
		type: 'numeric',
		precision: 39,
		scale: 0,
		unique: true,
	})
	public bit!: string
}
