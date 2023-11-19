import { Request, Response, NextFunction  } from 'express';
import {Controller} from "./Controller"
import {LoggerMiddleware} from "./LoggerMiddleware"
import {BooksService} from "../api/BooksService";
import { booksPlaceholder } from '../interfaces/placeholders';

export class BooksController extends Controller {
    private booksService:BooksService;
   
    constructor(booksService:BooksService) {
        super();
        this.booksService = booksService;
    //     this.app = express();
    //     this.port = Number(process.env.APP_PORT) || 3000;
    //     this.booksRouter = new BooksRouter(booksService,authService);
    //     this.userRouter = new UserRouter(booksService,authService);
    //     this.categoryRouter = new CategoryRouter(booksService,authService);
    //     this.raitingRouter = new RaitingRouter(booksService,authService);
    //     console.log(1);
    // }
     

        // анализируем что прилетело в контроллер и в зависимости от этого вызываем метод  обращения к БД
        this.bindRoutes([
            {
                path: '/books',
                method: 'get',
                fn: this.getBooks,
                middleware: [new LoggerMiddleware()], 
            },
            {
                path: '/books',
                method: 'post',
                fn: this.postBooks,
                middleware: [new LoggerMiddleware()], 
            },
            {
                path: '/books/:id',
                method: 'get',
                fn: this.getBook,
                middleware: [new LoggerMiddleware()], 
            },
            {
                path: '/books/:id',
                method: 'put',
                fn: this.putBooks,
                middleware: [new LoggerMiddleware()], 
            },
            {
                path: '/books/:id',
                method: 'delete',
                fn: this.deleteBooks,
                middleware: [new LoggerMiddleware()], 
            },
        ])
       console.log('Инициализация BooksController');
    }
    

    async getBooks(req: Request,
        res: Response,
        next: NextFunction
    ) {
        // req: Request<{}, {}, {}, { perPage: boolean, page: number, categories: string[], limit: number}>,
      
        let limit = (!req.query.limit) ? undefined : Number(req.query.limit);
        let page = (!req.query.page) ? undefined : Number(req.query.page);
        let perPage = (!req.query.perPage) ? undefined : Boolean(req.query.perPage);
        let categories = (!req.query.categories) ? undefined : String(req.query.categories).split(',');

        const books = await this.booksService.getBooks(perPage, page, categories, limit);
        return books;

    }
    getBook(req: Request, res: Response, next: NextFunction) {
        res.send(booksPlaceholder);

    }
    postBooks(req:Request, res:Response, next:NextFunction) {
        res.send(booksPlaceholder);
        
    }
    putBooks(req:Request, res:Response, next:NextFunction) {
        res.send(booksPlaceholder);
        
    }
    deleteBooks(req:Request, res:Response, next:NextFunction) {
        res.send(booksPlaceholder);
        
    }

}  

