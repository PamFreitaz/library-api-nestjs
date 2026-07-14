import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { BookService } from "../../services/book/book-service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BookCreateDto } from "../../domain/dtos/book/book-create.dto";
import { Book } from "../../domain/entities/book-entity";
import { BookUpdateDto } from "../../domain/dtos/book/book-update.dto";

@ApiTags('Books') //agrupa dentro do swagger todas as rotas de Books
@Controller('books')
export class BookController{

    constructor( 
        private readonly bookService: BookService
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    //ApiOperation define o titulo e a descrição no swagger
    @ApiOperation({
        summary: 'Cadastrar um livro novo',
        description: 'Insere um livro novo na biblioteca e calcula a faixa etária'})
    //Informa no swagger se der tudo certo com a estrutura da entidade
    @ApiResponse({
        status: 201,
        description: 'Livro cadastrado com sucesso',
        type: Book,
    })
    //O Body pega as informações enviadas no json na requisição, joga na variábel dadosDoLivro que está tipada para usar as informações do dto
    async create(@Body() dadosDoLivro: BookCreateDto): Promise<Book>{
        return this.bookService.create(dadosDoLivro);
    }


    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todos os livros',
        description: 'Lista todos os livros cadastrados com os códigos de catalogação'})
    @ApiResponse({
        status: 200,
        description: 'Lista retornada com sucesso'})

    async findAll(){
        return await this.bookService.findAll();
    }


    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Buscas livro por ID',
        description: 'Busca os detalhes de um livro específico cadastrado no banco de dados'
    })
    @ApiResponse({
        status: 200,
        description: 'Livro encontrado com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })
    //PaseIntPipe converte o Id que vem da URL em string e já devolve em número novamente
    async findById(@Param('id', ParseIntPipe) id: number): Promise<Book>{
        return await this.bookService.findById(id);
    }


    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Atualizar um livro',
        description: 'Atualiza parcialmente um livro cadastrado no banco de dados, mantendo a regra de negocio para faixa etaria'
    })
    @ApiResponse({
        status: 200,
        description: 'Livro atualizado com sucesso'
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos para atualização'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado para atualização'
    })
    async update(@Param('id', ParseIntPipe)id: number, @Body() updatedData: BookUpdateDto): Promise<Book>{
        return await this.bookService.update(id, updatedData);
    }


    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // Retorna o status 204 No Content que é o padrão para exclusões bem-sucedidas sem retorno
    @ApiOperation({
        summary: 'Deletar um livro',
        description: 'Remove permanentemente um livro do banco de dados'
    })
    @ApiResponse({
        status: 204,
        description: 'Livro deletado com sucesso'
    })
    @ApiResponse({
        status: 404,
        description: 'Livro não encontrado'
    })

    async delete(@Param('id', ParseIntPipe) id:number): Promise<void>{
        return await this.bookService.delete(id);
    }
}