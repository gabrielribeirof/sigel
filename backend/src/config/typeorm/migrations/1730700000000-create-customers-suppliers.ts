import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCustomersSuppliers1730700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE customers (
      id uuid PRIMARY KEY,
      type varchar(2) NOT NULL CHECK (type IN ('PF', 'PJ')),
      name varchar(200) NOT NULL,
      document varchar(14) NOT NULL UNIQUE,
      email varchar(255), phone varchar(20), address varchar(400),
      created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
      CONSTRAINT customers_document_type CHECK (
        (type = 'PF' AND length(document) = 11) OR (type = 'PJ' AND length(document) = 14)
      )
    )`)
    await queryRunner.query(`CREATE TABLE suppliers (
      id uuid PRIMARY KEY, name varchar(200) NOT NULL,
      document varchar(14) NOT NULL UNIQUE CHECK (length(document) = 14),
      email varchar(255), phone varchar(20), address varchar(400),
      created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
    )`)
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE suppliers')
    await queryRunner.query('DROP TABLE customers')
  }
}
