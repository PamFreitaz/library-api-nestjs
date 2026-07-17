import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from "class-validator"

export class EmprestimoDiarioDto {


    @ApiProperty({example: '2026-07-17', description: 'Data do registro'})
    @IsString()
    @IsNotEmpty()
    data: string;

    @ApiProperty({example: 3, description: 'Quantidade de emprestimos do dia'})
    @IsNumber()
    @Min(0)
    quantidadeEmprestimos: number;

    @ApiProperty({example: ['Diário de um Vampiro', 'Peter Pan'], description: 'Títulos dos livros emprestados'})
    @IsArray()
    @IsString({ each: true }) //verifica se dentro do array só existe string, se não for string, dá erro
    @IsNotEmpty()
    livrosEmprestados: string[];

}