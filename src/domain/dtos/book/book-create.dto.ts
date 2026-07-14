import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BookCreateDto {

    // ID não precisa pq p banco de dados quem faz o ID com o 'increment' na entity

    @ApiProperty({example: 'A Cabana'})
    @IsString() // garante q é um texto
    @IsNotEmpty() //obrigatório ter um texto, não pode mandar vazio 
    name: string;

    @ApiProperty({example: 240})
    @IsNumber() 
    @Min(1) //garante que é obrigatório, tem q ser maior ou igual a 1
    qtdPaginas: number;

    @ApiProperty({example: 'Ficção'})
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({example: 'William P. Young'})
    @IsString()
    @IsNotEmpty() 
    autor: string;

    @ApiProperty({example: 123456789})
    @IsNumber()
    @Min(1)
    codigo: number;

    @ApiProperty({example: ' Editora Arqueiro', required: false}) //required false avisa ao swagger para não ficar * vermelho sendo obrigatório
    @IsString()
    @IsOptional() //opcional, usuario só preenche se quiser
    publicacao: string;

    @ApiProperty({example: 15.00})
    @IsNumber()
    @Min(1)
    valorAluguel: number;
}