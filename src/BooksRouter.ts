
import { Router, Request, Response } from "express";
import { Book, Category, IBookPayload,Field } from './interfaces/types';
import { booksPlaceholder } from './interfaces/placeholders';
import { BooksService } from "./api/BooksService";

export class BooksRouter {
    private _router: Router;

    constructor(booksService: BooksService) {
        this._router = Router();

        // получить список книг
        this._router.get('/', async (
            req: Request<{ perPage: number, page: boolean, category: Category[] }>,
            res: Response
        ) => {
            const books = booksService.getBooks();
            console.log(books);
            res.send(booksPlaceholder)
        })
        //!! добавить книгу сделано
        this._router.post('/', async (
            req: Request<{}, {}, IBookPayload>,
            res: Response
        ) => {
            const book = await booksService.createBook(req.body);
            console.log(book);
            res.send(book)

        })
        // получить книгу по id
        this._router.get('/:id',async(
            req: Request<{ id: string }>,
            res
        ) => {
            console.log(3);
            res.send(booksPlaceholder)
        })

        // редактировать книгу
        this._router.put('/:id', async(
            req: Request<{ id: string }, {}, Field[]>,
            res: Response
        ) => {
            const book = await booksService.editBook(req.params.id, req.body);
            console.log(book);
            // res.send(book)
            res.send(booksPlaceholder)
        })
        // удалить книгу
        this._router.delete('/:id', async(
            req: Request<{}, {}, {}>,
            res: Response
        ) => {
            res.send(booksPlaceholder)
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