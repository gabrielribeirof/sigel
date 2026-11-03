import { Column, Entity, PrimaryColumn } from 'typeorm'
@Entity('categories')
export class CategoryTypeormEntity {
  @PrimaryColumn('uuid') id!: string
  @Column({name: 'name', type: 'varchar'}) name!: string
  @Column({name: 'description', type: 'text', nullable: true}) description!: string
}
