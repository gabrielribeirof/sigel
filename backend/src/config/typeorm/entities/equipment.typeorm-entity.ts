import { Column, Entity, PrimaryColumn } from 'typeorm'
@Entity('equipments')
export class EquipmentTypeormEntity {
	@PrimaryColumn('uuid') id!: string

	@Column({
		name: 'code',
		type: 'varchar',
	}) code!: string

	@Column({
		name: 'name',
		type: 'varchar',
	}) name!: string

	@Column({
		name: 'category_id',
		type: 'uuid',
	}) categoryId!: string

	@Column({
		name: 'daily_rate',
		type: 'numeric',
	}) dailyRate!: number

	@Column({
		name: 'status',
		type: 'varchar',
	}) status!: string

	@Column({
		name: 'storage_instructions',
		type: 'text',
		nullable: true,
	}) storageInstructions!: string
}
