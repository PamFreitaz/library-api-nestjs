import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity('books')
export class Book {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'varchar', length: '50', name: 'title', nullable: false})
    title: string;

    @Column({type: 'varchar', length: '15', name: 'faixa_etaria', nullable: false})
    faixaEtaria: string;

    @Column({type: 'varchar', length: '100', name: 'autor', nullable: false})
    autor: string;

    @Column({type: 'varchar', length: '10', name: 'publicacao', nullable: false})
    publicacao: string;

    @Column({type: 'int', name: 'qtd_paginas', nullable: false})
    qtdPaginas: number;

    @Column({type: 'int', name: 'codigo', nullable: false})
    codigo: number;

    @Column({type: 'int', name: 'valor_aluguel', nullable: false})
    valorAluguel: number;

    @Column({type: 'bit', name: 'alugado', nullable: false, default: false})
    alugado: boolean;

    @Column({type: 'bit', name: 'disponivel', nullable: false, default: true})
    disponivel: boolean;

    @CreateDateColumn({
        type: 'datetimeoffset', name: 'created_at', nullable: false,
        // arrow function indica ao TypeORM que é uma função nativa do SQL Server, não uma string literal.
        default: () => 'SYSDATETIMEOFFSET()',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'datetimeoffset', name: 'updated_at', nullable: false,
        // arrow function indica ao TypeORM que é uma função nativa do SQL Server, não uma string literal.
        default: () => 'SYSDATETIMEOFFSET()', 
    })
    updatedAt: Date;
    
    @Column({type: 'varchar', length: '50', name: 'category', nullable: false})
    category: string;


}
