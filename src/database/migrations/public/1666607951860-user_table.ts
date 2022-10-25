import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class userTable1666607951860 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
              name: "users",
              columns: [
                  {
                      name: "id",
                      type: "int",
                      isPrimary: true,
                  },
                  {
                      name: "email",
                      type: "varchar",
                      length: '50',
                      isNullable: true,
                  },
                  {
                      name: "user_name",
                      type: "varchar",
                      length: '100',
                      isNullable: true,
                  },
                  {
                      name: "type",
                      type: "smallint",
                      isNullable: false,
                  },
                  {
                      name: "password",
                      type: "varchar",
                      isNullable: true,
                  },
                  {
                      name: "is_active",
                      type: "boolean",
                      default: false,
                  },
                  {
                      name: "email_verified",
                      type: "boolean",
                      default: false,
                  },
                  {
                      name: "created_at",
                      type: "timestamp with time zone",
                      default: "now()",
                  },
                  {
                      name: "updated_at",
                      type: "timestamp with time zone",
                      default: "now()",
                  },
                  {
                      name: "deleted_at",
                      type: "timestamp with time zone",
                      isNullable: true,
                  },
              ],
          }),
          true,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users", true);
    }

}
