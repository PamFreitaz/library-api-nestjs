import { PartialType } from "@nestjs/swagger";
import { BookCreateDto } from "./book-create.dto";


//PartialType gera automaticamente todos os campos opcionais, fazendo com que possa usar somente o PATCH no update
export class BookUpdateDto extends PartialType (BookCreateDto){


}