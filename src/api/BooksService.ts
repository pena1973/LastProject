
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
    RaitingRecord
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

import { randomUUID } from 'crypto';
import { UUID } from 'crypto';



export class BooksService {
    bookRepository: BookRepository;

    private static getUnickID(): number {
        return Number(Date.now());
    }

    constructor() {
        this.bookRepository = new BookRepository();
    }

    public getBooks() {
        const data = this.bookRepository.getAllFromTable('books');
        // преобразование записей в массив обьектов

        return booksPlaceholder;
    }

    public async editBook(bookId: string | number,fields:Field[]) {
        return { success: true, book: booksPlaceholder }
        // разбираем поля для редактироваия

        
        // name: string,
        // categories:Category[],
        // language: string,
        // price: number,
        // curency: Curency|undefined,
        // published: number,
        // authors:Author[],
        // // raiting:Raiting[],   
    }

    public removeBook(bookId: string | number) {
        return { success: true };
    }
    public getUser(userId: string | number) {
        return { success: true };
    }

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
                
            }else{
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
