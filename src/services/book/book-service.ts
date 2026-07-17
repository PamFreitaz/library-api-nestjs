import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IBookRepository } from "../../domain/interface/book/book.interface.repository";
import { BookCreateDto } from "../../domain/dtos/book/book-create.dto";
import { Book } from "../../domain/entities/book-entity";
import { BookUpdateDto } from "../../domain/dtos/book/book-update.dto";
import { BookEmmprestimoDto } from "../../domain/dtos/book/book-emprestimo.dto";
import { EmprestimoDiarioDto } from "../../domain/dtos/book/book-emprestimo-diario.dto";

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

    async findAll(): Promise<any[]> {

        //encontra todos os livros no banco
        const books = await this.bookRepository.findAll();

        //o tamanho da lista
        const total = books.length;

        //aplica a regra dos multiplos para gerar a etiqueta
        const codigosCatalogacao = this.gerarCatalogacao(total);

        // .map() percorre a lista de livros para etiquetar, book é o livro e index é a posição do livro
        return books.map((book, index) => {
            return {
                ...book, // Copia todas as colunas do banco automaticamente (id, title, autor...) modo spread
                codigoCatalogacao: codigosCatalogacao[index], //injeta a etiqueta calculada
            }
        });
    }

    async findById(id: number): Promise<Book> {
        const book = await this.bookRepository.findById(id);

        if (!book) {
            throw new Error(`Livro com ${id} não encontrado`);
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

    async update(id: number, updatedData: BookUpdateDto): Promise<Book> {
        this.logger.log(`Tentando atualizar o livro com o ID [${id}]`);

        const book = await this.bookRepository.findById(id);

        if (!book) {
            throw new Error(`Livro com id [${id}] não encontrado para atualização`)
        }
        //spread
        const updatedBook = {
            ...book,
            ...updatedData
        };
        //Coalescencia Nulla ?? melhor que o ternario, ela olha pra esquerda se não for, ele olha pra direito
        if (updatedData.qtdPaginas !== undefined || updatedData.category !== undefined) {
            const paginas = updatedData.qtdPaginas ?? book.qtdPaginas;
            const category = updatedData.category ?? book.category;

            updatedBook.faixaEtaria = this.classificarLivro(paginas, category)
        }

        const savedBook = await this.bookRepository.save(updatedBook);

        return savedBook;
    }



    async delete(id: number): Promise<void> {

        const book = await this.bookRepository.findById(id);

        //se o livro não existir gera um erro com mensagem
        if (!book) {
            throw new Error(`Livro com ${id} não encontrado para exclusão`)
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

    //EXERCICIO 3:

    //promise string para, no final ,retornar uma relatorio em string
    async resumoEntradaAcervo(intervaloInicial: Date, intervaloFinal: Date): Promise<string> {

        //buscando livros existentes no banco
        const livros = await this.bookRepository.findByCreatedAtBetween(intervaloInicial, intervaloFinal);

        //se não for encontrado nenhum livro na lista passsa a mensagem
        if (livros.length === 0) {
            return `Nenhum livro foi adicionado ao acervo no período selecionado`
        }
        // variavel para guardar todo o valor do dinheiro investido - ela é alimentada dentro do reduce
        let totalInvestido = 0;

        //reduce percorre o array de livros q veio do banco item por item para transformar toda a lista em um único resultado final
        const agrupadoPorTitulo = livros.reduce((acumulador, livroAtual) => {
            const titulo = livroAtual.title;

            //somando o valor do aluguel ao total investido acumulado
            totalInvestido += livroAtual.valorAluguel;

            //se não existir o titulo no acumulador, vai criar uma estrutura com os campos definidos no tipo (antes do return do if)
            if (!acumulador[titulo]) {
                acumulador[titulo] = { quantidade: 0, total: 0 }
            }
            //somando a quantidade de titulos encontrados iguais (exemplares)
            acumulador[titulo].quantidade += 1;
            //somando o valor total acumulado daquele livro específico com o valor do livro atual
            acumulador[titulo].total += livroAtual.valorAluguel;

            //retornando os valores salvos para a proxima volta
            return acumulador;

            //declarando que o 1º paramentro (o acumulador) do reduce é um objeto com esse formato específico
        }, {} as Record<string, { quantidade: number, total: number }>);

        //          ---transformando o objeto em array---e mapeando para passar a lista de frases prontas
        const resumo = Object.entries(agrupadoPorTitulo).map(([titulo, dados]) => {
            const plural = dados.quantidade > 1 ? 'exemplares' : 'exemplar';
            // Ajustado para garantir o R$ e formatar o valor com duas casas decimais com o .toFixed(2)
            return `${titulo} - x${dados.quantidade} ${plural} = R${dados.total.toFixed(2)}`;
        });

        return `Entrada no Acervo:\n` +
            //join para ficar um livro em baixo do outro
            `${resumo.join('\n')}\n` +
            `Total investido: R$${totalInvestido.toFixed(2)}\n` +
            `Livros adicionados: ${livros.length}`;
    }


    // EXERCÍCIO 4

    /*
    Livros < 30.00 não tem desconto
    Sócios tem 20% desconto
    Código: 'estudante' tem 15% desconto
    Ambos juntos aplica somente o maior valor não acumula
    */


    async calcularEmprestimo(dto: BookEmmprestimoDto): Promise<number> {

        const book = await this.bookRepository.findById(dto.bookId);

        //se não existir o livro dá erro
        if (!book) {
            throw new NotFoundException(`O livro com o Id ${dto.bookId} não foi encontrado`);
        }

        //valoFinal é igual ao valor do aluguel do livro
        let valorFinal = book.valorAluguel;

        //livros abaixo de 30.00 não tem desconto
        if (valorFinal >= 30) {
            //taxa de desconto começa com 0
            let taxaDesconto = 0;

            //se for socio ele tem 20% de desconto
            if (dto.isSocio) {
                taxaDesconto = 0.20;
            }
            //aqui não é obrigatório, mas tá validando o usuario digitar a palavra estudante em case ou não  
            if (dto.codigoDesconto?.toUpperCase() === 'ESTUDANTE') {
                //se ele for estudante vai ter 0.15 de desconto, mas se ele for socio a taxa de desconto dele já será de 0.20
                //então 0.15 > taxaDesconto é falso. Desse jeito é aplcicado o valor de 0.15 na taxa de desconto
                //e se ele não for socio, a taxa de desconto dele vem zerada, 0.15 > taxaDesconto é true
                if (0.15 > taxaDesconto) {
                    taxaDesconto = 0.15
                }
            }
            //valorFinal é o valor * 100% - a taxa de desconto
            valorFinal = valorFinal * (1 - taxaDesconto);
        }
        return valorFinal;
    }

    /* 
        Fazer um relatório de emprestimos por dia
        1 - dia com + emprestimo
        2 - dia com - emprestimo
        3 - Média diaria
        4 - Qtos dias ficaram acima da media
        5 - listar livris mais emprestados na semana
    */

    // uma promise de um objeto, um array
    async relatorioEmprestimos(dados: EmprestimoDiarioDto[]): Promise<object> {

        if (!dados || dados.length === 0) {
            this.logger.warn('Nenhum dado encontrado')
            return {
                diaComMaisEmprestimos: null,
                diaComMenosEmprestimos: null,
                mediaDiariaDeEmprestimos: 0,
                quantosDiasAcimaMedia: 0,
                maisEmprestadosSemana: []
            }; // vai retornar algo q ainda não sei oq é
        }

        //Dias com mais emprestimos
        //começando com o primeiro dia da lista como o dia de mais emprestimos no array, coloquei o 0 para simular que a posição 0 é o dia com mais emprestimos
        let diaComMaisEmprestimos = dados[0]
        //passando por todos os dias cadastrados um por um até o final do array
        for (const diaAtual of dados) {
            // se a qtd de emprestimo do diaAtual for maior que a qtd de emprestimos do dia salvo na variavel diaComMaisEmprestimos, então.. 
            if (diaAtual.quantidadeEmprestimos > diaComMaisEmprestimos.quantidadeEmprestimos) {
                //...então diaComMaisEmprestimos recebe o diaAtual o campeão do movimento
                diaComMaisEmprestimos = diaAtual;
            }
        }

        //Dias com menos emprestimos
        let diaComMenosEmprestimos = dados[0]

        for (const diaAtual of dados) {
            if (diaAtual.quantidadeEmprestimos < diaComMenosEmprestimos.quantidadeEmprestimos) {
                diaComMenosEmprestimos = diaAtual;
            }
        }

        //Fazendo a média
        // variavel pra acumular a soma de todos os dias
        let somaEmprestimos = 0;

        for (const diaAtual of dados) {
            //a cada volta pega o valor guardado na variavel e soma pela qtd de emprestimo do diaAtual 
            somaEmprestimos = somaEmprestimos + diaAtual.quantidadeEmprestimos;
        }


        //mediaDiaria é a soma dos emprestimos dividido pelo tamanho da lista (dados.length) que é o array onde tem todos os dias salvos na lista
        const mediaDiaria = somaEmprestimos / dados.length;

        //quantos dias ficaram acima da media
        //diasAcimaMedia começando com 0
        let diasAcimaMedia = 0;

        //percorrendo todos os dias dentro da lista dos dados
        for (const diaAtual of dados) {
            if (diaAtual.quantidadeEmprestimos > mediaDiaria) {
                diasAcimaMedia = diasAcimaMedia + 1;
            }
        }


        //Fazendo a contagem dos livros
        // uma variavel para ser o objeto que vai guardar o nome e qtd de emprestimos 
        let contagemLivros: Record<string, number> = {};

        // primeiro for olha para o dia
        for (const dia of dados) {
            //segundo for olha para o livro emprestado no dia
            for (const livro of dia.livrosEmprestados) {
                //se não tiver o livro emprestado ainda
                if (!contagemLivros[livro]) {
                    //ele cria a ficha dele zerada
                    contagemLivros[livro] = 0;
                }
                //e agora soma mais 1 na contagem
                contagemLivros[livro] = contagemLivros[livro] + 1;
            }
        }

        //descobrir qual foi o número máximo de vezes que qualquer livro foi emprestado.
        //variavel para guardar o recorde de emprestimos por livro
        let maiorContagem = 0;

        //objetc.entries vai fazer o objeto contagemLivros virar em um array pq o for não percorre em objeto, e aí agora a cada volta ele lê o titulo e a qunatidade
        for (const [titulo, quantidade] of Object.entries(contagemLivros)) {
            //se a quantidade for > q a maiorContagem, maiorContagem passa a ser esse numero
            if (quantidade > maiorContagem) {
                maiorContagem = quantidade;
            }
        }

        //Listar os livros mais emprestados na semana
        // uma variavel q vai guardar uma lista dos livros mais emprestados começando vazia
        let livrosMaisEmprestados: string[] = [];

        // Object.entries para transformar o objeto contagemLivros em lista e o for percorrer livro por livro
        for (const [titulo, quantidade] of Object.entries(contagemLivros)) {
            //se a quantidade for igual a maiorContagem
            if (quantidade === maiorContagem) {
                //então empurramos o nome do livro para dentro da nossa lista
                livrosMaisEmprestados.push(titulo);
            }
        }
        this.logger.log('Relatório gerado com sucesso!');

        return {
            diaComMaisEmprestimos: diaComMaisEmprestimos.data,
            diaComMenosEmprestimos: diaComMenosEmprestimos.data,
            mediaDiariaDeEmprestimos: Number(mediaDiaria.toFixed(2)),
            quantosDiasAcimaMedia: diasAcimaMedia,
            maisEmprestadosSemana: livrosMaisEmprestados
        };
    }
}