
import { Router, Request, Response } from "express";
import { ICategoryPayload } from './interfaces/types';
import { categoryPlaceholder } from './interfaces/placeholders';
import {BooksService} from "./api/BooksService";
import { AuthService } from "./api/AuthService";
export class CategoryRouter {
    private _router: Router;

    constructor(booksService:BooksService,authService:AuthService) {                
        this._router = Router();        
        
        // получить список категорий
        this._router.get('/categories', (
            req: Request<{ perPage: number, page:boolean}>,            
            res: Response
            ) => {
             res.send(categoryPlaceholder)            
        })
        // добавить категорию
        this._router.post('/categories', (            
             req: Request<{}, {}, {}, ICategoryPayload[]>,
            res: Response
            ) => {
             res.send(categoryPlaceholder)            
        })
        // получить категорию по id
        this._router.get('categories/:id', (
            req: Request<{ id: string }>,
            res
            ) => {
            res.send(categoryPlaceholder)
        })
         
        // редактировать категорию  тело  -  это структура полей и значений к редактированию
          this._router.put('/categories/:id', (            
            req: Request<{ id: string }, {}, [{field:string, value:any}] >,
           res: Response
           ) => {
            res.send(categoryPlaceholder)            
       })
        // удалить категорию
        this._router.delete('/categories/:id', (            
            req: Request<{}, {}, {} >,
           res: Response
           ) => {
            res.send(categoryPlaceholder)            
       })
    }

    get router() {
        return this._router;
    }
}

// Эндпоинты для категорий:
// GET /api/v1/categories — получение списка категорий, принимает параметры page и perPage.

// POST, PUT, DELETE для категорий. Аналогичны эндпоинтам для книг.