
// класс преобразует записи полученные из базы в обьекты программы
import {
    Book,
    Raiting,
    User,
    Category,
    Author,
    Curency,
    Field,
} from '../interfaces/types';

import {
    CurencyRecord,
    CategoryRecord,
    AuthorRecord,
    BookRecord,
    Book_AuthorRecord,
    Category_BookRecord,
    RaitingRecord,
    FieldRecord,
} from '../interfaces/types';

import {
    IBookPayload,
    IAuthorPayload,
    ICategoryPayload,
    IRaitingPayload
} from '../interfaces/types';
// import { v4 as uuidv4 } from 'uuid';
import { booksPlaceholder } from '../interfaces/placeholders';
import { BookRepository } from "./BookRepository"
import { PostgrestError } from '@supabase/supabase-js';
import { type } from 'os';
import { rename } from 'fs';
interface Answer { data: any[] | CurencyRecord | null, error: PostgrestError | null, status: number };




export class BooksService {
    bookRepository: BookRepository;

    private static getUnickID(): number {
        return Number(Date.now());
    }

    constructor() {
        this.bookRepository = new BookRepository();
    }
    
    ////////////// ПОЛУЧИТЬ МАССИВ КНИГ/////////////////////////
    // public async getBooks(categories:string[],limit:number|undefined=undefined,rangeFrom:number|undefined=undefined, rangeTo:number|undefined=undefined) {
    public async getBooks(perPage: boolean | undefined, page: number | undefined, categoriesString: string[] | undefined, limit: number | undefined) {
        const itemPage = 6;

        // собираю фильтр книг по категориям
        // получим id категорий
        const resultCategories = await this.bookRepository.getAllFromTable('category', { field: 'name', values: <string[]>categoriesString });

        if (!resultCategories.success) return { success: false, result: <Book[]>[] };
        let categoryRecords: CategoryRecord[] = <CategoryRecord[]>resultCategories.result;

        let categories: Category[] = <Category[]>[];
        let arrayIdCategory = [];
        for (let index = 0; index < categoryRecords.length; index++) {
            arrayIdCategory.push(categoryRecords[index].id);
            categories.push({ id: categoryRecords[index].id, name: categoryRecords[index].name });
        }
        // запросим  связь книга -  категория и получим id книг        
        const resultCategories_BooksRecords = await this.bookRepository.getAllFromTable('category_book', { field: 'id_category', values: arrayIdCategory });

        if (!resultCategories_BooksRecords.success) return { success: false, result: <Book[]>[] };
        let cat_book: Category_BookRecord[] = <Category_BookRecord[]>resultCategories_BooksRecords.result;

        let arrayIdBook = [];
        for (let index = 0; index < cat_book.length; index++) {
            arrayIdBook.push(cat_book[index].id_book);
        }
        // диапазон

        let rangeFrom = perPage ? (Number(page) - 1) * itemPage : undefined;
        let rangeTo = perPage ? (Number(page) * itemPage) - 1 : undefined;

        const resultBookRecords = await this.bookRepository.getAllFromTable('book', { field: 'id', values: arrayIdBook }, limit, rangeFrom, rangeTo);
        if (!resultBookRecords.success) return { success: false, result: <Book[]>[] };

        let bookRecords: BookRecord[] = <BookRecord[]>resultBookRecords.result;

        let books = <Book[]>[];
        for (let index = 0; index < bookRecords.length; index++) {
            const bookRecord = bookRecords[index];
            let book_id = bookRecords[index].id

            const resultAutorsRecordsId = await this.bookRepository.getAllFromTable('book_author', { field: 'id_book', values: [book_id] });
            if (!resultAutorsRecordsId.success) return { success: false, result: <Book[]>[] };
            let autorsRecordsId: Book_AuthorRecord[] = <Book_AuthorRecord[]>resultAutorsRecordsId.result;

            let arrayIdAutor = [];

            for (let index = 0; index < autorsRecordsId.length; index++) {
                arrayIdAutor.push(autorsRecordsId[index].id_book);
            }
            const resultAutorsRecords = await this.bookRepository.getAllFromTable('author', { field: 'id', values: arrayIdAutor });
            if (!resultAutorsRecords.success) return { success: false, result: <Book[]>[] };
            let autorsRecords: AuthorRecord[] = <AuthorRecord[]>resultBookRecords.result;

            let autors: Author[] = <Author[]>[];
            for (let index = 0; index < autorsRecords.length; index++) {
                autors.push({ id: autorsRecords[index].id, name: autorsRecords[index].name, birth: autorsRecords[index].birth, death: autorsRecords[index].death });
            }

            const resultCurencyRecords = await this.bookRepository.getAllFromTable('curency', { field: 'id', values: [bookRecord.curency] });
            if (!resultCurencyRecords.success) return { success: false, result: <Book[]>[] };

            let curencyrecord: CurencyRecord[] = <CurencyRecord[]>resultCurencyRecords.result;

            //  надо будет собрать каждую книгу здесь

            books.push({
                id: book_id,
                name: bookRecord.name,
                categories: categories,
                language: bookRecord.language,
                price: bookRecord.price,
                curency: { id: curencyrecord[0].id, name: curencyrecord[0].name },
                published: bookRecord.published,
                authors: autors,
            })
        }

        return { success: true, result: books };

    }
  
    ////////////// РЕДАКТИРОВАНИЕ КНИГИ/////////////////////////

    public async editBook(bookId: number, bookData: IBookPayload): Promise<{ success: boolean, result: Book }> {
        let bookPay = bookData;
        // создаем валюту
        let resultCurency = await this.createCurency(bookData.curency);
        if (!resultCurency.success) return { success: false, result: <Book>{} };
        // обновляем  поля таблицы книг
        let resultbook = await this.bookRepository.updateRecord("book", {
            id: bookId,
            name: bookPay.name,
            language: bookPay.language,
            price: bookPay.price,
            curency: resultCurency.result?.id,
            published: bookPay.published,
        },
        ).then(
            (data) => {
                let bookRecord: BookRecord = <BookRecord>data.result;
                return {
                    success: true, result: {
                        id: bookRecord.id,
                        language: bookRecord.language,
                        name: bookRecord.name,
                        price: bookRecord.price,
                        published: bookRecord.published
                    }
                };
            },
            (error) => {
                console.log("error_add_book", error)
                return { success: false, result: <Book>{} };
            });
        if (!resultbook.success) return { success: false, result: <Book>{} };
        let book: Book = <Book>resultbook.result;
        book.curency = resultCurency.result;
        // Создадим  недостающие и заново пропишем категории
        let resultCategory = await this.editCategory(bookId, <ICategoryPayload[]>bookData.categories);
        if (!resultCategory.success) return { success: false, result: <Book>{} };
        book.categories = resultCategory.result;
        // обновим авторов  
        let resultAutor = await this.editAutor(bookId, <IAuthorPayload[]>bookData.authors);
        if (!resultAutor.success) return { success: false, result: <Book>{} };
        book.authors = resultAutor.result;
        // перезапись рейтинга
        let resultRaiting = await this.createRaiting({ id: BooksService.getUnickID(), user: bookPay.user, book: book, raiting: bookPay.raiting })
        if (!resultRaiting.success) return { success: false, result: <Book>{} };
        return { success: true, result: book };

    }
    // вспомогательные функции обновления
    public async editCategory(bookId: number, categories: ICategoryPayload[]): Promise<{ success: boolean, result: Category[] }> {
        // создаем недостающие категории/ если уже есть  вернется существующая
        let resultCategory = await this.createCategory(categories);
        if (!resultCategory.success) return { success: false, result: <Category[]>[] }

        // удалим старые связи      
        let resultdelete = await this.bookRepository.deleteRecordsByBookId('category_book', bookId);
        if (!resultdelete.success) return { success: false, result: <Category[]>[] }

        // пропишем новые
        for (let index = 0; index < resultCategory.result.length; index++) {
            const category = resultCategory.result[index];

            await this.bookRepository.postRecord("category_book", {
                id: BooksService.getUnickID(),
                id_book: bookId,
                id_category: category.id,
            },
            ).then(
                (data) => {
                    let category_bookRecord: Category_BookRecord = <Category_BookRecord>data.result;
                    console.log("value_category_book", category_bookRecord)
                },
                (error) => {
                    console.log("error_category_book", error)
                    return error;
                });
        };
        return { success: true, result: resultCategory.result };
    }
    public async editAutor(bookId: number, authors: IAuthorPayload[]): Promise<{ success: boolean, result: Author[] }> {

        let resultAuthors: Author[] = [];

        // создаем/обновляем недостающих авторов я
        for (let index = 0; index < authors.length; index++) {
            const authorPay = authors[index];


            let resultAuthor = await this.bookRepository.updateRecord("author", {
                id: authorPay.id,
                name: authorPay.name,
                birth: authorPay.birth,
                death: authorPay.death,
            },
            ).then(
                (data) => {
                    let authorRecord: AuthorRecord = <AuthorRecord>data.result;
                    if (!authorRecord) return
                    let author: Author = <Author>{};
                    author.id = authorRecord.id;
                    author.name = authorRecord.name;
                    author.birth = authorRecord.birth;
                    author.death = authorRecord.death;
                    return { success: true, result: author };
                },
                (error) => {
                    console.log("error_add_book", error)
                    return { success: false, result: <Author>{} };
                });
            if (resultAuthor?.success) resultAuthors.push({ id: resultAuthor.result.id, name: resultAuthor.result.name, birth: resultAuthor.result.birth, death: resultAuthor.result.death });
        }

        // удалим старые связи      
        let resultdelete1 = await this.bookRepository.deleteRecordsByBookId('book_author', bookId);
        if (!resultdelete1.success) return { success: false, result: <Author[]>[] }

        //  создаем связь авторов и книги
        for (let index = 0; index < resultAuthors.length; index++) {
            const author = resultAuthors[index];

            await this.bookRepository.postRecord("book_author", {
                id: BooksService.getUnickID(),
                id_book: bookId,
                id_author: author.id,
            },
            ).then(
                (data) => {
                    let book_authorRecord: Book_AuthorRecord = <Book_AuthorRecord>data.result;
                    // console.log("value_book_author", book_authorRecord);
                },
                (error) => {
                    // console.log("value_book_author", error)
                });
        };

        return { success: true, result: resultAuthors };
    }
    public removeBook(bookId: string | number) {
        return { success: true };
    }
    public getUser(userId: string | number) {
        return { success: true };
    }

    ////////////// СОЗДАНИЕ КНИГИ/////////////////////////

    // создание новой книги и связь ее со всеми сущностями
    // export interface IBookPayload { id,name,categories,language,price,curency,published,authors,raiting,user,}
    // проверяем каждую сущность  на дубль по ее имени, если есть просто берем имеющуюся, указываем рейтинг от имени текущего юзера    
    public async createBook(bookData: IBookPayload): Promise<{ success: boolean, result: Book }> {
        let bookPay = bookData;

        // собираю  книгу                
        let book: Book = <Book>{};
        let resultCategory = await this.createCategory(bookPay.categories);
        book.categories = resultCategory.result;
        let resultAuthor = await this.createAutor(bookPay.authors)
        book.authors = resultAuthor.result;
        let resultCurency = await this.createCurency(bookPay.curency)
        book.curency = resultCurency.result;


        if (resultCurency.success && resultAuthor.success && resultCategory.success) {

            //  добавить книгу и ее связи        
            // id created_at name  language price curency published            
            let resultbook = await this.bookRepository.postRecord("book", {
                id: BooksService.getUnickID(),
                name: bookPay.name,
                language: bookPay.language,
                price: bookPay.price,
                curency: resultCurency.result?.id,
                published: bookPay.published,
            },
            ).then(
                (data) => {
                    let bookRecord: BookRecord = <BookRecord>data.result;
                    if (!bookRecord) return
                    book.id = bookRecord.id;
                    book.language = bookRecord.language;
                    book.name = bookRecord.name;
                    book.price = bookRecord.price;
                    book.published = bookRecord.published;

                    return { success: true, result: book };
                },
                (error) => {
                    console.log("error_add_book", error)
                    return { success: false, result: book };
                });

            // если книга успешно добавлена заполняем связи
            if (resultbook?.success) {

                // связь категории и книги
                for (let index = 0; index < resultCategory.result.length; index++) {
                    const category = resultCategory.result[index];

                    await this.bookRepository.postRecord("category_book", {
                        id: BooksService.getUnickID(),
                        id_book: book.id,
                        id_category: category.id,
                    },
                    ).then(
                        (data) => {
                            let category_bookRecord: Category_BookRecord = <Category_BookRecord>data.result;
                            console.log("value_category_book", category_bookRecord)
                        },
                        (error) => {
                            console.log("error_category_book", error)
                            return error;
                        });
                };

                // связь авторов и книги
                for (let index = 0; index < resultAuthor.result.length; index++) {
                    const author = resultAuthor.result[index];

                    await this.bookRepository.postRecord("book_author", {
                        id: BooksService.getUnickID(),
                        id_book: book.id,
                        id_author: author.id,
                    },
                    ).then(
                        (data) => {
                            let book_authorRecord: Book_AuthorRecord = <Book_AuthorRecord>data.result;
                            console.log("value_book_author", book_authorRecord);
                        },
                        (error) => {
                            console.log("value_book_author", error)
                        });
                };

                // рейтинг                
                let resultRaiting = await this.createRaiting({ id: BooksService.getUnickID(), user: bookPay.user, book: book, raiting: bookPay.raiting })
                // if (resultRaiting.result?.id !== undefined)
                // book.raiting.push({id: resultRaiting.result.id, user: bookPay.user, book: book,  value: resultRaiting.result.value   });

                return { success: true, result: book };

            } else {
                return { success: false, result: <Book>{} };
            }
        }
        return { success: false, result: <Book>{} };
    }
    // колбеки и обработка результатов каскадного добавления
    // создать валюту
    public async createCurency(curencyData: string): Promise<{ success: boolean, result: Curency }> {
        //    let curency: Curency ;
        return await this.bookRepository.postRecord("curency", { id: BooksService.getUnickID(), name: curencyData },).then(
            (data) => {
                if (data.success) {
                    let curencyRecord: CurencyRecord = <CurencyRecord>data.result;
                    console.log("value_curency", data)
                    return { success: true, result: { id: curencyRecord.id, name: curencyRecord.name } };
                } else {
                    return { success: false, result: <Curency>{} };
                }
            },
            (error) => {
                console.log("error_curency", error)
                return { success: false, result: <Curency>{} };
            });
    }
    // создать категорию
    public async createCategory(categoryData: ICategoryPayload[]): Promise<{ success: boolean, result: Category[] }> {
        // добавить категории   проверить может есть такая         
        let categories: Category[] = [];
        for (let index = 0; index < categoryData.length; index++) {
            const category = categoryData[index];

            let result = await this.bookRepository.postRecord("category", { id: BooksService.getUnickID(), name: category.name },).then(
                (data) => {
                    let categoryRecord: CategoryRecord = <CategoryRecord>data.result;

                    console.log("value_category", data)
                    return { success: true, result: <Category>{ id: categoryRecord.id, name: categoryRecord.name, } };
                },
                (error) => {
                    console.log("error_category", error)
                    return { success: false, result: <Category>{} };
                });
            if (result?.success) categories.push({ id: result.result.id, name: result.result.name, });
        };
        return { success: true, result: categories };
    }
    // создать Авторов
    public async createAutor(authorData: IAuthorPayload[]): Promise<{ success: boolean, result: Author[] }> {
        let authors: Author[] = [];

        for (let index = 0; index < authorData.length; index++) {
            const author = authorData[index];
            let result = await this.bookRepository.postRecord("author", { id: BooksService.getUnickID(), name: author.name, birth: author.birth, death: author.death },)
                .then((data) => {
                    if (data.success) {
                        let authorRecord: AuthorRecord = <AuthorRecord>data.result;
                        console.log("value_author", data)
                        return { success: true, result: <Author>{ id: authorRecord.id, name: authorRecord.name, birth: authorRecord.birth, death: authorRecord.death, } };
                    }
                },
                    (error) => {
                        console.log("error_author", error)
                        return { success: false, result: <Author>{} };
                    });
            if (result?.success) authors.push({ id: result.result.id, name: result.result.name, birth: result.result.birth, death: result.result.death });
        };
        return { success: true, result: authors };
    }
    // создать рейтинг
    public async createRaiting(raitingData: IRaitingPayload): Promise<{ success: boolean, result: Raiting | undefined }> {
        // добавить рейтинг            
        return this.bookRepository.postRecord("raiting", {
            id: BooksService.getUnickID(),
            id_user: raitingData.user.id,
            value: raitingData.raiting,
            id_book: raitingData.book.id,
        },
        ).then(
            (data) => {
                let raitingkRecord: RaitingRecord = <RaitingRecord>data.result;
                console.log("value_raiting", data)
                return {
                    success: true,
                    result: { id: raitingkRecord.id, book: raitingData.book, user: raitingData.user, value: raitingkRecord.value }
                };
            },
            (error) => {
                console.log("error_raiting", error)
                return { success: true, result: undefined };
            });

    }
}
