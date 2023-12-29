
import { Router, Request, Response, NextFunction } from "express";
import { IBookPayload } from './interfaces/types';
import { BooksController } from "./controllers/BooksController";
import { AuthService } from "./api/AuthService";
import { CategoryRouter } from "./CategoryRouter";
import { LoggerMiddleware } from "./controllers/LoggerMiddleware";
import { Middleware } from "./controllers/Controller";

export class BooksRouter {
    private _router: Router;
    constructor(booksController: BooksController) {
        this._router = Router();

        // получить список книг
        this._router.get('/books', async (
            req: Request<{}, {}, {}, { perPage: boolean, page: number, categories: string[], limit: number }>,
            res: Response,
            next: NextFunction,
        ) => {
            const books = await booksController.getBooks(req, res, next)
            res.send(books)
        })

        //загрузить книги массово
        this._router.post('/books', async (
            req: Request<{}, {}, IBookPayload[]>,
            res: Response,
            next
        ) => {
            const book = await booksController.postBooks(req, res, next)
            res.send(book)

        })

        // получить книгу по id сделано
        this._router.get('/book/:id', async (
            req: Request<{ id: string }>,
            res,
            next
        ) => {
            const book = await booksController.getBook(req, res, next)
            res.send(book)
        })

        // отредактировать книгу  сделано
        this._router.put('/book/:id', async (
            req: Request<{ id: string }, {}, IBookPayload>,
            res: Response,
            next: NextFunction
        ) => {
            const book = await booksController.putBook(req, res, next);
            res.send(book)
        })

        // удалить книгу
        this._router.delete('/book/:id', async (
            req: Request<{ id: string }>,
            res: Response,
            next: NextFunction
        ) => {
            const succes = await booksController.removeBook(req, res, next);
            res.send(succes)
        })
    }

    get router() {
        return this._router;
    }
}

// GET /api/v1/books — получение списка книг. Принимает следующие параметры строки:

// perPage — количество выводимых книг в запросе.
// page — постраничный вывод книг.
// category — категория выводимых книг (может принимать массив сразу с несколькими категориями).

// POST /api/v1/books — добавление книги. В теле запроса принимает данные для книги:

// Название книги;
// Год выпуска;
// Категории, к которым относится книга;
// Автор;
// Стоимость в определенной валюте;
// Рейтинг книги на основе пользовательских оценок.

// PUT /api/v1/books/<bookId> — редактирование книги. В теле запроса можно отправить произвольное количество полей, которые необходимо отредактировать.

// DELETE /api/v1/books/<bookId> — удаление книги по идентификатору.




