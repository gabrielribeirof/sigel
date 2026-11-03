import { Column, Entity, PrimaryColumn } from 'typeorm'
@Entity('promotions')
export class PromotionTypeormEntity {
  @PrimaryColumn('uuid') id!: string
  @Column({name: 'name', type: 'varchar'}) name!: string
  @Column({name: 'start_date', type: 'date'}) startDate!: string
  @Column({name: 'end_date', type: 'date'}) endDate!: string
  @Column({name: 'discount_percent', type: 'numeric'}) discountPercent!: number
  @Column({name: 'rental_target', type: 'int'}) rentalTarget!: number
  @Column({name: 'rental_count', type: 'int', default: 0}) rentalCount!: number
}
