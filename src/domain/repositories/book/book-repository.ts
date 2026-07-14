import { Injectable } from "@nestjs/common";
import { IBookRepository } from "../../interface/book/book.interface.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Book } from "../../entities/book-entity";
import { Repository } from "typeorm";

@Injectable()
export class BookRepository implements IBookRepository {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

    ){}
    
    async save(book: Book): Promise<Book> {
        return await this.bookRepository.save(book);
    }

    async findById(id: number): Promise<Book | null> {
        return await this.bookRepository.findOneBy({id}); //no ORM para buscar por ID, usa findOneBy com o Id em chaves {id} pois é um objeto e o mesmo que escrever ({ id: id })
    }

   async findAll(): Promise<Book[]> {
        return await this.bookRepository.find(); // ORM usa find para listar todos
    }

    async delete(id: number): Promise<void> {
        await this.bookRepository.delete(id);
    }
    
}