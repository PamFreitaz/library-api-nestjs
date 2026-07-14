import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBooksTable1783533857341 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'books',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'faixa_etaria',
                        type: 'varchar',
                        length: '15',
                        isNullable: false,
                    },
                    {
                        name: 'autor',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'publicacao',
                        type: 'varchar',
                        length: '10',
                        isNullable: false,
                    },
                    {
                        name: 'qtd_paginas',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'codigo',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'valor_aluguel',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'alugado',
                        type: 'bit',
                        isNullable: false,
                        default: '0', // todo livro novo começa NÃO alugado
                    },
                    {
                        name: 'disponivel',
                        type: 'bit',
                        isNullable: false,
                        default: '1', 
                    },
                    {
                        name: 'created_at',
                        type: 'datetimeoffset',
                        isNullable: false,
                        default: 'SYSDATETIMEOFFSET()',
                    },
                    {
                        name: 'updated_at',
                        type: 'datetimeoffset',
                        isNullable: false,
                        default: 'SYSDATETIMEOFFSET()',
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '50',
                        isNullable: false
                    }
                ],
            }));
            
    
     }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('books');
    }
}
