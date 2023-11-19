import { BookRepository } from "./BookRepository"
export class AuthService {
    bookRepository: BookRepository;

  

    constructor() {
        this.bookRepository = new BookRepository();
    }
    
}