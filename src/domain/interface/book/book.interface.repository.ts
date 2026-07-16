import { Book } from "../../entities/book-entity"
import { BookRepository } from "../../repositories/book/book-repository";

export type IBookRepository = {
    save(book: Book): Promise<Book>; //Promise é uma promessa de que quando a operação terminar no SQL ela vai retornar um Book atualizado
    findById(id: number): Promise<Book | null>; // Retorna se o ID for encontrado ou se for nulo
    findAll(): Promise<Book[]>; // retorna uma lista cheia de Books
    delete(id: number): Promise<void>; // void pq não tem retorno, somente apaga e encerra a operação
    findByCreatedAtBetween(intervaloInicial: Date, intervaloFinal: Date): Promise<Book[]>
};  



 /* Configuração do Provider para Injeção de Dependência (Padrão NestJS)
    Esse objeto mapeia um "Token" (uma string identificadora) para a classe real do banco.
    Isso permite que a lógica de negócio (Service) dependa apenas de um contrato,
    isolando o código de mudanças futuras de frameworks ou bancos de dados.
 */
export const BookProviderRepository = {
    provide: 'ProviderBookRepository', //provide é o Token/cracha: o nome da vaga/função que o sistema vai buscar
    useClass: BookRepository, // a classe/funcionário: Quem realmente vai executar os métodos da Interface.
}

