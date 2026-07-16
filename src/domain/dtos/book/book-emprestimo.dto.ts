import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class BookEmmprestimoDto {

   
    @ApiProperty({example: 1})
    @IsNumber()
    @Min(1)
    bookId: number;

    @ApiProperty({example: true})
    @IsBoolean()
    @IsNotEmpty() //é obrigatório informar
    isSocio: boolean;


    @ApiProperty({example: 'ESTUDANTE' , required: false}) //avisa ao swagger para não ficar * vermelho dizendo ser obrigatório
    @IsString()
    @IsOptional() //opcional pq o usuario pode não ter um cumpo de desconto
    codigoDesconto: string;

}