import { Request, Response, NextFunction  } from 'express';
import {Controller} from "./Controller"
import {LoggerMiddleware} from "./LoggerMiddleware"
import {BooksService} from "../api/BooksService";
import { booksPlaceholder } from '../interfaces/placeholders';
import { IBookPayload } from '../interfaces/types';

export class BooksController extends Controller {
    private booksService:BooksService;
    
    constructor(booksService:BooksService) {
       super();
       this.booksService = booksService;
       console.log('Инициализация BooksController');
    }
    
    async getBooks(
        req: Request<{}, {}, {}, { perPage: boolean, page: number, categories: string[], limit: number}>,
        res: Response,
        next:NextFunction,              
    ) {
           
        let limit = (!req.query.limit) ? undefined : Number(req.query.limit);
        let page = (!req.query.page) ? undefined : Number(req.query.page);
        let perPage = (!req.query.perPage) ? undefined : Boolean(req.query.perPage);
        let categories = (!req.query.categories) ? undefined : String(req.query.categories).split(',');

        const books = await this.booksService.getBooks(perPage, page, categories, limit);
        return books;
    }
    async getBook(
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction) {
        // дописать
        res.send(booksPlaceholder);
    }
    async postBooks(
        req: Request<{}, {}, IBookPayload>,
        res: Response,
        next: NextFunction
    ) {
        const book = await this.booksService.createBook(req.body);
        res.send(book)

    }
    async putBook(
        req: Request<{ id: string }, {}, IBookPayload>,
        res: Response,
        next: NextFunction) {

        const book = await this.booksService.editBook(Number(req.params.id), req.body);
        res.send(book)
    }

    async deleteBooks(
        req: Request<{ id: string }, {}, {}>, 
        res: Response, 
        next: NextFunction
        ) {
        const success = await this.booksService.removeBook(Number(req.params.id));
        res.send(success);
    }
}

