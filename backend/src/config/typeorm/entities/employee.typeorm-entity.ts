import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { EmployeeSector } from '../../../domain/employee/employee.js'

@Entity('employees')
export class EmployeeTypeormEntity {
	@PrimaryColumn('uuid')
	public id!: string

	@Column({ unique: true })
	public registration!: string

	@Column()
	public name!: string

	@Column({ type: 'varchar' })
	public sector!: EmployeeSector

	@Column({
		name: 'admission_date',
		type: 'date',
	})
	public admissionDate!: string

	@Column({
		name: 'termination_date',
		type: 'date',
		nullable: true,
	})
	public terminationDate!: string | null

	@Column({
		name: 'user_id',
		type: 'uuid',
		nullable: true,
		unique: true,
	})
	public userId!: string | null

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
