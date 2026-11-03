import { MigrationInterface, QueryRunner } from 'typeorm'
export class CreateCatalog1730700000000 implements MigrationInterface {
 async up(q: QueryRunner): Promise<void> {
  await q.query(`CREATE TABLE categories (id uuid PRIMARY KEY, name varchar NOT NULL UNIQUE, description text)`)
  await q.query(`CREATE TABLE equipments (id uuid PRIMARY KEY, code varchar NOT NULL UNIQUE, name varchar NOT NULL, category_id uuid NOT NULL REFERENCES categories(id), daily_rate numeric(12,2) NOT NULL CHECK(daily_rate >= 0), status varchar NOT NULL DEFAULT 'disponivel' CHECK(status IN ('disponivel','locado','manutencao','baixado')), storage_instructions text)`)
  await q.query(`CREATE TABLE promotions (id uuid PRIMARY KEY, name varchar NOT NULL, start_date date NOT NULL, end_date date NOT NULL, discount_percent numeric(5,2) NOT NULL CHECK(discount_percent >= 0 AND discount_percent <= 100), rental_target integer NOT NULL CHECK(rental_target > 0), rental_count integer NOT NULL DEFAULT 0, CHECK(end_date >= start_date))`)
  await q.query(`CREATE TABLE promotion_equipments (promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE, equipment_id uuid NOT NULL REFERENCES equipments(id) ON DELETE RESTRICT, PRIMARY KEY(promotion_id,equipment_id))`)
 }
 async down(q: QueryRunner): Promise<void> {
  await q.query('DROP TABLE promotion_equipments'); await q.query('DROP TABLE promotions'); await q.query('DROP TABLE equipments'); await q.query('DROP TABLE categories')
 }
}
