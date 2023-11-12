import { Router, Request, Response, NextFunction } from 'express';
import {Controller} from "./Controller"

import { Book } from '../interfaces/types';
import { booksPlaceholder } from '../interfaces/placeholders';

export class BooksController extends Controller {
    constructor() {
        super();

        // анализируем что прилетело в контроллер и в зависимости от этого вызываем метод  обращения к БД
        this.bindRoutes([
            {
                path: '/books',
                method: 'get',
                fn: this.getBooks,
            },
            {
                path: '/books',
                method: 'post',
                fn: this.postBooks,
            },
            {
                path: '/books/:id',
                method: 'get',
                fn: this.getBook,
            },
            {
                path: '/books/:id',
                method: 'put',
                fn: this.putBooks,
            },
            {
                path: '/books/:id',
                method: 'delete',
                fn: this.deleteBooks,
            },
        ])
    }

    getBooks(req:Request, res:Response, next:NextFunction) {
        res.send(booksPlaceholder);

    }
    getBook(req:Request, res:Response, next:NextFunction) {
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

