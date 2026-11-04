import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('customers')
export class CustomerTypeormEntity {
  @PrimaryColumn('uuid') id!: string
  @Column({ type: 'varchar', length: 2 }) type!: 'PF' | 'PJ'
  @Column({ type: 'varchar', length: 200 }) name!: string
  @Column({ type: 'varchar', length: 14, unique: true }) document!: string
  @Column({ type: 'varchar', length: 255, nullable: true }) email!: string | null
  @Column({ type: 'varchar', length: 20, nullable: true }) phone!: string | null
  @Column({ type: 'varchar', length: 400, nullable: true }) address!: string | null
  @Column({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date
  @Column({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date
}
