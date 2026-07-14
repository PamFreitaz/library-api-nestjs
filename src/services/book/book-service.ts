import { Inject, Injectable, Logger } from "@nestjs/common";
import { IBookRepository } from "../../domain/interface/book/book.interface.repository";
import { BookCreateDto } from "../../domain/dtos/book/book-create.dto";
import { Book } from "../../domain/entities/book-entity";
import { Index } from "typeorm";
import { error } from "console";
import { BookUpdateDto } from "../../domain/dtos/book/book-update.dto";

@Injectable()
export class BookService {
    private readonly logger = new Logger(BookService.name); // Logger é da biblioteca que imprime no console exatamente onde está o erro dizendo hore e data tbm

    private readonly LIV_CONST = 'LIV-';
    private readonly REF_CONST = 'REF-';
    private readonly DEST_CONST = 'DEST-';
    private readonly ACERVO_CONST = 'ACERVO-'

    constructor(
        @Inject("ProviderBookRepository")
        private readonly bookRepository: IBookRepository,) { }

    //dadosDoLivro virá do dto
    async create(dadosDoLivro: BookCreateDto): Promise<Book> {
        this.logger.log(`Iniciando o cadastro do livro: [${dadosDoLivro.name}]`) //vai passar no terminal se der um erro

        //calcula a faixa etaria da regra de negocio do metodo classificarLivro
        const faixaEtariaClassificada = this.classificarLivro(dadosDoLivro.qtdPaginas, dadosDoLivro.category);

        //instanciando uma nova entidade Book pq o banco de dados não aceita dto
        const novoLivro = new Book();

        //calculando os dados do dto para a entidade (banco de dados)
        novoLivro.title = dadosDoLivro.name;
        novoLivro.autor = dadosDoLivro.autor;
        novoLivro.category = dadosDoLivro.category;
        novoLivro.qtdPaginas = dadosDoLivro.qtdPaginas;
        novoLivro.publicacao = dadosDoLivro.publicacao;
        novoLivro.codigo = dadosDoLivro.codigo;
        novoLivro.valorAluguel = dadosDoLivro.valorAluguel;
        novoLivro.faixaEtaria = faixaEtariaClassificada; //entra o valor calculado no metodo classificarLivro

        //tente executar esse bloco...
        try {
            const livroSalvo = await this.bookRepository.save(novoLivro);
            this.logger.log(`Livro [${livroSalvo.title}] gravado com suceso`);
            return livroSalvo;

            // e se der erro não salvar no banco (const livroSalvo) ele mostra esse erro
        } catch (error: any) {
            this.logger.error(`Falha ao cadastrar o livro [${novoLivro.title}]. Motivo: ${error.message}`, error.stack);
            throw error;
        }
    };

    async findAll(): Promise<any[]>{

        //encontra todos os livros no banco
        const books = await this.bookRepository.findAll();

        //o tamanho da lista
        const total = books.length;

        //aplica a regra dos multiplos para gerar a etiqueta
        const codigosCatalogacao = this.gerarCatalogacao(total);

        // .map() percorre a lista de livros para etiquetar, book é o livro e index é a posição do livro
        return books.map((book, index) => {
            return{
                ...book, // Copia todas as colunas do banco automaticamente (id, title, autor...) modo spread
                codigoCatalogacao: codigosCatalogacao[index], //injeta a etiqueta calculada
            }
        });
    }

    async findById(id: number): Promise<Book>{
        const book = await this.bookRepository.findById(id);

        if(!book){
            throw new Error (`Livro com ${id} não encontrado`);
        }
        return book;
    }


    /* 
    - vai ser um async de update passando o id, buscando o dadosAtualizados q vai ser os dados do bookUpdateDto
    - depois tem que buscar o livro por id
    -  se o book não existir passa um erro
    - se existir cria uma const para juntar as informações usando o spread para pegar todas as colunas de book e depois
       spread pra sobrescrever as colunas enviadas pelo usuario no patch com os dados atualizados.
    - Tem que usar a regra de negocio de qtd de paginas para faixa etaria - Operador de Coalescência Nula (??) e
       chamar o metodo de classificarLivro para fazer a classificação certa
    - criar uma const de livro salvo e salvar no banco
    - retornar o livro salvo
    */

    async update(id: number, updatedData: BookUpdateDto): Promise<Book>{
        this.logger.log(`Tentando atualizar o livro com o ID [${id}]`);

        const book = await this.bookRepository.findById(id);

        if(!book){
            throw new Error(`Livro com id [${id}] não encontrado para atualização`)
        }
        //spread
        const updatedBook = {
            ...book,
            ...updatedData
        };
        //Coalescencia Nulla ?? melhor que o ternario, ela olha pra esquerda se não for, ele olha pra direito
        if(updatedData.qtdPaginas !== undefined || updatedData.category !== undefined){
            const paginas = updatedData.qtdPaginas ?? book.qtdPaginas;
            const category = updatedData.category ?? book.category;
            
            updatedBook.faixaEtaria = this.classificarLivro(paginas, category)
        }

        const savedBook = await this.bookRepository.save(updatedBook);

        return savedBook;
    }



    async delete(id: number): Promise<void>{

        const book = await this.bookRepository.findById(id);

        //se o livro não existir gera um erro com mensagem
        if(!book){
            throw new Error (`Livro com ${id} não encontrado para exclusão`)
        }
        //se existir manda o repository deletar
        await this.bookRepository.delete(id);
        this.logger.log(`Livro com ${id} deletado com sucesso`)
    }


    private classificarLivro(qtdPaginas: number, categoria: string): string {

        this.logger.log(`Classificando livro da categoria [${categoria}] com [${qtdPaginas}] páginas`);

        if (categoria === 'Técnico') {
            return 'Profissional';
        }
        if (qtdPaginas < 100) {
            return 'Infantil';
        }
        if (qtdPaginas <= 250) {
            return 'Juvenil';
        }
        return 'Adulto';
    };


    /* EXERCICIO 2
        - Fazer um array onde:
         'REF-3' - A POSIÇÃO DO LIVRO NO ARRAY SEJA MULTIPLO DE 3
         'DEST-5' - SEJA MULTIPLO DE 5 
         'ACERVO-15' - MULTIPLO DE 3 E DE 5
         'LIV-1' - DEMAIS POSIÇÕES 

        - Criar uma const de códigos vazia para começar o laço for
        - Usar um for para recorrer a lista toda e encontrar a posição */

    private gerarCatalogacao(totalLivros: number): string[] {

        const codigos: string[] = [];

        for (let i = 1; i <= totalLivros; i++) {

            if (i % 3 === 0 && i % 5 === 0) {
                codigos.push(`${this.ACERVO_CONST}${i}`); // .push() adiciona o novo código gerado no final da lista
            }
            else if (i % 3 === 0) {
                codigos.push(`${this.REF_CONST}${i}`);
            }
            else if (i % 5 === 0) {
                codigos.push(`${this.DEST_CONST}${i}`);
            }
            else {
                codigos.push(`${this.LIV_CONST}${i}`)
            }
        } return codigos;
    }



}