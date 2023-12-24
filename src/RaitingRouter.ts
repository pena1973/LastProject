
import { Router, Request, Response } from "express";
import { IRaitingPayload, } from './interfaces/types';

// import { raitingPlaceholder } from './interfaces/placeholders';
import {BooksService} from "./api/BooksService";
import { AuthService } from "./api/AuthService";
export class RaitingRouter {
    private _router: Router;

    constructor(booksService:BooksService,authService:AuthService) {                
        this._router = Router();        
        
       // проверка авторизации

       // добавить рейтинг
        // this._router.post('/rating', (            
        //     req: Request<{}, {}, IRaitingPayload[]>,
        //     res: Response
        //     ) => {
        //      res.send(raitingPlaceholder)            
        // })

    }

    get router() {
        return this._router;
    }
}

// Эндпоинты для рейтинга книг:
// POST /api/v1/rating — добавление рейтинга. Рейтинг не может быть добавлен, если пользователь не авторизован.