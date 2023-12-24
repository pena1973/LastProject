
// класс преобразует записи полученные из базы в обьекты программы
import {
    Book,
    Raiting,
    User,
    Category,
    Author,
    Curency,
    // Field,
} from '../interfaces/types';

import {
    CurencyRecord,
    CategoryRecord,
    AuthorRecord,
    BookRecord,
    Book_AuthorRecord,
    Category_BookRecord,
    RaitingRecord,
    // FieldRecord,
} from '../interfaces/types';

import {
    IBookPayload,
    IAuthorPayload,
    // ICategoryPayload,
    IRaitingPayload
} from '../interfaces/types';

// DataBase records 
export interface UserRecord {
    id: number,
    name: string
    description: string,
    email: string,
    pass: string,
}
import { getIdArray, getIdArrayCategory, getIdArrayAutor } from '../utils'
// import { v4 as uuidv4 } from 'uuid';

import { BookRepository } from "./BookRepository"
// import { PostgrestError } from '@supabase/supabase-js';

// interface Answer { data: any[] | CurencyRecord | null, error: PostgrestError | null, status: number };

export class BooksService {
    bookRepository: BookRepository;

    private static getUnickID(): number {
        return Number(Date.now());
    }

    constructor() {
        this.bookRepository = new BookRepository();
    }

    ////////////// получить КНИГу по id/////////////////////////
    // public async getBooks(categories:string[],limit:number|undefined=undefined,rangeFrom:number|undefined=undefined, rangeTo:number|undefined=undefined) {
    public async getBookById(id: number) {

        const resultBookRecord = await this.bookRepository.getRecordById('book', id);
        if (!resultBookRecord.success) return { success: false, result: <Book>{} };

        let bookRecord: BookRecord = <BookRecord>resultBookRecord.result;

        let book_id = bookRecord.id

        //  вытащу авторов из другой таблицы
        const resultAutorsRecordsId = await this.bookRepository.getAllFromTable('book_author', { field: 'id_book', values: [book_id] });
        if (!resultAutorsRecordsId.success) return { success: false, result: <Book[]>[] };
        let autorsRecordsId = <Book_AuthorRecord[]>resultAutorsRecordsId.result;

        let arrayIdAutor = <number[]>autorsRecordsId.map(elem => { return elem.id_author })
        const resultAutorsRecords = await this.bookRepository.getAllFromTable('author', { field: 'id', values: arrayIdAutor });
        if (!resultAutorsRecords.success) return { success: false, result: <Book[]>[] };

        let autorsRecords = <AuthorRecord[]>resultAutorsRecords.result;

        let autors = autorsRecords as Author[];

        //  валюта
        const resultCurencyRecords = await this.bookRepository.getAllFromTable('curency', { field: 'id', values: [bookRecord.curency] });
        if (!resultCurencyRecords.success) return { success: false, result: <Book[]>[] };
        let curencyrecord: CurencyRecord[] = <CurencyRecord[]>resultCurencyRecords.result;

        //  вытащу категории из другой таблицы
        const resultCategoryRecords = await this.bookRepository.getAllFromTable('category_book', { field: 'id_book', values: [bookRecord.id] });
        if (!resultCategoryRecords.success) return { success: false, result: <Book[]>[] };
        let categoriesRecordsId = <Category_BookRecord[]>resultCategoryRecords.result;
        let arrayIdCategory = <number[]>categoriesRecordsId.map(elem => { return elem.id_category })

        const resultCategoriesRecords = await this.bookRepository.getAllFromTable('category', { field: 'id', values: arrayIdCategory });
        if (!resultCategoriesRecords.success) return { success: false, result: <Book[]>[] };

        let categoriesRecords = <CategoryRecord[]>resultCategoriesRecords.result;
        let categories = categoriesRecords as Category[];

        //  вытащу рейтинг из другой таблицы
        const resultRaiting = await this.bookRepository.getAllFromTable('raiting', { field: 'id_book', values: [bookRecord.id] });
        if (!resultRaiting.success) return { success: false, result: <Book>{} };
        let raitingRecords = resultRaiting.result as RaitingRecord[];

        let values = 0;
        let raiting = 0;
        for (let index = 0; index < raitingRecords.length; index++) {
            values = values + raitingRecords[index].value;
        }
        if (raitingRecords.length > 0) raiting = Math.round(values / raitingRecords.length);

        //  надо будет собрать каждую книгу здесь
        let book = <Book>{
            id: book_id,
            name: bookRecord.name,
            categories: categories,
            language: bookRecord.language,
            price: bookRecord.price,
            curency: { id: curencyrecord[0].id, name: curencyrecord[0].name },
            published: bookRecord.published,
            authors: autors,
            description: bookRecord.description,
            esteemes: raitingRecords.length,
            raiting: raiting,
        }

        return { success: true, result: book };
    }
    ////////////// ПОЛУЧИТЬ МАССИВ КНИГ/////////////////////////
    // public async getBooks(categories:string[],limit:number|undefined=undefined,rangeFrom:number|undefined=undefined, rangeTo:number|undefined=undefined) {
    public async getBooks(perPage: boolean | undefined, page: number | undefined, categoriesString: string[], limit: number | undefined) {
        const itemPage = 6;
        // диапазон
        let rangeFrom = perPage ? (Number(page) - 1) * itemPage : undefined;
        let rangeTo = perPage ? (Number(page) * itemPage) - 1 : undefined;

        let bookRecords: BookRecord[] = [];

        // собираю фильтр книг по категориям  если есть      
        if (categoriesString.length > 0) {
            // получим id категорий
            const resultCategories = await this.bookRepository.getAllFromTable('category', { field: 'name', values: <string[]>categoriesString });

            if (!resultCategories.success) return { success: false, result: <Book[]>[] };
            let categoryRecords: CategoryRecord[] = <CategoryRecord[]>resultCategories.result;
            // let categories: Category[] = categoryRecords.map(elem => {return { id: elem.id, name: elem.name }});        
            let arrayIdCategory = categoryRecords.map(elem => { return elem.id });

            // запросим  связь книга -  категория и получим id книг        
            const resultCategories_BooksRecords = await this.bookRepository.getAllFromTable('category_book', { field: 'id_category', values: arrayIdCategory });
            if (!resultCategories_BooksRecords.success) return { success: false, result: <Book[]>[] };
            let cat_book: Category_BookRecord[] = <Category_BookRecord[]>resultCategories_BooksRecords.result;
            let arrayIdBook = cat_book.map(elem => { return elem.id_book })
            // Книги
            const resultBookRecords = await this.bookRepository.getAllFromTable('book', { field: 'id', values: arrayIdBook }, limit, rangeFrom, rangeTo);
            if (!resultBookRecords.success) return { success: false, result: <Book[]>[] };

            bookRecords = <BookRecord[]>resultBookRecords.result;
        } else {

            // Книги
            const resultBookRecords = await this.bookRepository.getAllFromTable('book', undefined, limit, rangeFrom, rangeTo);
            if (!resultBookRecords.success) return { success: false, result: <Book[]>[] };

            bookRecords = <BookRecord[]>resultBookRecords.result;
        }

        // рейтинг по всем отобранным книгам
        const resultRaiting = await this.bookRepository.getAllFromTable('raiting', { field: 'id_book', values: getIdArray(bookRecords) });
        if (!resultRaiting.success) return { success: false, result: <Book>{} };
        let raitingRecords: RaitingRecord[] = <RaitingRecord[]>resultRaiting.result;

        // все связи категорий выброанных книг
        const resultBookCategory = await this.bookRepository.getAllFromTable('category_book', { field: 'id_book', values: getIdArray(bookRecords) });
        if (!resultBookCategory.success) return { success: false, result: <Book>{} };
        let bookCategoryRecords1: Category_BookRecord[] = <Category_BookRecord[]>resultBookCategory.result;

        // все связи авторов выброанных книг
        const resultBookAuthor = await this.bookRepository.getAllFromTable('book_author', { field: 'id_book', values: getIdArray(bookRecords) });
        if (!resultBookAuthor.success) return { success: false, result: <Book>{} };
        let bookAuthorRecords1: Book_AuthorRecord[] = <Book_AuthorRecord[]>resultBookAuthor.result;


        // обрабатываем каждую книгу
        let books = <Book[]>[];
        for (let index = 0; index < bookRecords.length; index++) {
            const bookRecord = bookRecords[index];
            let book_id = bookRecords[index].id
            //  собираю авторов книги
            let bookAuthorRecords: Book_AuthorRecord[] = bookAuthorRecords1.filter(elem => { return elem.id_book === book_id });
            let arrayIdAuthor = getIdArrayAutor(bookAuthorRecords);
            // запрашиваем в базе имена отдельных авторов по id            
            const resultAutorsRecords = await this.bookRepository.getAllFromTable('author', { field: 'id', values: arrayIdAuthor });
            if (!resultAutorsRecords.success) return { success: false, result: <Book[]>[] };
            let autorsRecords = <AuthorRecord[]>resultAutorsRecords.result;
            let bookAuthors: Author[] = autorsRecords.map(
                elem => {
                    return {
                        id: elem.id,
                        name: elem.name,
                        birth: elem.birth,
                        death: elem.death
                    }
                })

            //  собираю категории книги
            let bookCategoryRecords: Category_BookRecord[] = bookCategoryRecords1.filter(elem => { return elem.id_book === book_id });
            let arrayIdCategory = getIdArrayCategory(bookCategoryRecords);
            // запрашиваем в базе имена отдельных авторов по id            
            const resultCategoryRecords = await this.bookRepository.getAllFromTable('category', { field: 'id', values: arrayIdCategory });
            if (!resultCategoryRecords.success) return { success: false, result: <Book[]>[] };
            let categoriesRecords = <AuthorRecord[]>resultCategoryRecords.result;
            let bookCategories: Category[] = categoriesRecords.map(
                elem => {
                    return {
                        id: elem.id,
                        name: elem.name,
                    }
                })


            //  собираю валюту книги
            const resultCurencyRecords = await this.bookRepository.getAllFromTable('curency', { field: 'id', values: [bookRecord.curency] });
            if (!resultCurencyRecords.success) return { success: false, result: <Book[]>[] };
            let curencyrecord = <CurencyRecord[]>resultCurencyRecords.result;

            //  собираю рейтинг книги
            let values = 0;
            let raiting = 0;
            let raitingRecordsBook = raitingRecords.filter(elem => { elem.id_book = bookRecord.id })
            for (let index = 0; index < raitingRecordsBook.length; index++) {
                values = values + raitingRecordsBook[index].value;
            }
            if (raitingRecordsBook.length > 0) raiting = values / raitingRecordsBook.length;



            books.push({
                id: book_id,
                name: bookRecord.name,
                categories: bookCategories,
                language: bookRecord.language,
                price: bookRecord.price,
                curency: { id: curencyrecord[0].id, name: curencyrecord[0].name },
                published: bookRecord.published,
                authors: bookAuthors,
                description: bookRecord.description,
                esteemes: raitingRecordsBook.length,
                raiting: raiting,
            })
        }

        return { success: true, result: books };
    }
    // let ibook = {
    //     id: item.id,
    //     name: nameValue,
    //     categories: categoriesItem,
    //     language: langvuageValue,
    //     price: priceValue,
    //     curency: curencyValue,
    //     published: publishedValue,
    //     authors: autorsItem,
    //     description:descriptionValue,
    //     raiting: raitingValue,
    //     user: login,
    // }

    ////////////// РЕДАКТИРОВАНИЕ КНИГИ/////////////////////////
    public async editBook(bookId: number, bookData: IBookPayload): Promise<{ success: boolean, result: Book }> {
        // создаем валюту
        let resultCurency = await this.createCurency(bookData.curency);
        if (!resultCurency.success) return { success: false, result: <Book>{} };
        // обновляем  поля таблицы книг
        let resultbook = await this.bookRepository.updateRecord("book", {
            id: bookId,
            name: bookData.name,
            language: bookData.language,
            price: bookData.price,
            curency: resultCurency.result?.id,
            published: bookData.published,
            description: bookData.description,
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
                        published: bookRecord.published,
                        description: bookRecord.description
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
        let resultCategory = await this.editCategory(bookId, <string[]>bookData.categories);
        if (!resultCategory.success) return { success: false, result: <Book>{} };

        book.categories = resultCategory.result;

        // // обновим авторов  
        // // приведем  существующих
        // const existAutors = await this.bookRepository.getAllFromTable('author', { field: 'name', values: bookData.authors });
        // let autors: IAuthorPayload[] = <IAuthorPayload[]>existAutors.result;
        // // допишем недостающих
        // bookData.authors.forEach(el => {
        //     if (autors.find((element) => element.name === el) === undefined)
        //         autors.push({ id: BooksService.getUnickID(), name: el, birth: 0, death: 0 });
        // });

        // let resultAutor = await this.createAutor(<IAuthorPayload[]>autors);

        // if (!resultAutor.success) return { success: false, result: <Book>{} };
        // book.authors = resultAutor.result;

        let resultAutor = await this.editAutor(bookId, <string[]>bookData.authors);
        if (!resultCategory.success) return { success: false, result: <Book>{} };

        book.categories = resultCategory.result;



        // перезапись рейтинга
        let resultRaiting = await this.createRaiting({ id: BooksService.getUnickID(), user: bookData.user, book: book, raiting: bookData.raiting })
        if (!resultRaiting.success) return { success: false, result: <Book>{} };
        // получить общий рейтинг по книге после добавления своего
        const resultCommonRaiting = await this.bookRepository.getAllFromTable('raiting', { field: 'id_book', values: [bookData.id] });

        let raiting = 0;
        let esteemes = 0;

        if (resultCommonRaiting.success) {
            let values = 0;
            let raitingRecords: RaitingRecord[] = <RaitingRecord[]>resultCommonRaiting.result;
            for (let index = 0; index < raitingRecords.length; index++) {
                values = values + raitingRecords[index].value;
            }
            if (raitingRecords.length > 0) {
                raiting = values / raitingRecords.length;
                esteemes = raitingRecords.length;
            }
        }
        book.raiting = raiting;
        book.esteemes = esteemes;

        return { success: true, result: book };

    }
    // вспомогательные функции обновления
    public async editCategory(bookId: number, categories: string[]): Promise<{ success: boolean, result: Category[] }> {
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
    public async editAutor(bookId: number, authors: string[]): Promise<{ success: boolean, result: Author[] }> {

        let resultAuthors: Author[] = [];

        // создаем/обновляем недостающих авторов  только имя, если существует придет который есть
        for (let index = 0; index < authors.length; index++) {
            const authorName = authors[index];

            let resultAuthor = await this.bookRepository.postRecord("author", {
                id: BooksService.getUnickID(), name: authorName,
            });

            if (!resultAuthor?.success) return { success: false, result: <Author[]>{} };
            let authorRecord = <AuthorRecord>resultAuthor.result;
            resultAuthors.push({
                id: authorRecord.id,
                name: authorRecord.name,
                birth: authorRecord.birth,
                death: authorRecord.death,
            })
        }

        // удалим старые связи  все     
        let resultdelete1 = await this.bookRepository.deleteRecordsByBookId('book_author', bookId);
        if (!resultdelete1.success) return { success: false, result: <Author[]>[] }

        //  создаем связь авторов и книги  все
        for (let index = 0; index < resultAuthors.length; index++) {
            const author = resultAuthors[index];
            let resultBookAuthorPost = await this.bookRepository.postRecord("book_author", {
                id: BooksService.getUnickID(),
                id_book: bookId,
                id_author: author.id,
            },);

            if (!resultBookAuthorPost.success) return { success: false, result: <Author[]>[] }
        };
        return { success: true, result: resultAuthors };
    }

    

    ////////////// СОЗДАНИЕ КНИГИ не использовала вместо этого edit/////////////////////////

    // создание новой книги и связь ее со всеми сущностями
    // export interface IBookPayload { id,name,categories,language,price,curency,published,authors,raiting,user,}
    // проверяем каждую сущность  на дубль по ее имени, если есть просто берем имеющуюся, указываем рейтинг от имени текущего юзера    
    public async createBook(bookData: IBookPayload): Promise<{ success: boolean, result: Book }> {
        let bookPay = bookData;

        // собираю  книгу                
        let book: Book = <Book>{};
        let resultCategory = await this.createCategory(bookPay.categories);
        book.categories = resultCategory.result;
        // авторы
        // приведем  существующих
        const existAutors = await this.bookRepository.getAllFromTable('author', { field: 'name', values: bookData.authors });
        let autors: IAuthorPayload[] = <IAuthorPayload[]>existAutors.result;
        // допишем недостающих
        bookData.authors.forEach(el => {
            if (autors.find((element) => element.name === el) === undefined)
                autors.push({ id: BooksService.getUnickID(), name: el, birth: 0, death: 0 });
        });
        let resultAuthor = await this.createAutor(<IAuthorPayload[]>autors);
        if (!resultAuthor.success) return { success: false, result: <Book>{} };

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
                // if (resultRaiting.result !== undefined)
                //  book.raiting.push({id: resultRaiting.result.id, user: bookPay.user, book: book,  value: resultRaiting.result.value   });

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
                    // console.log("value_curency", data)
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
    public async createCategory(categoryData: string[]): Promise<{ success: boolean, result: Category[] }> {
        // добавить категории   проверить может есть такая         
        let categories: Category[] = [];
        for (let index = 0; index < categoryData.length; index++) {
            const category = categoryData[index];

            let result = await this.bookRepository.postRecord("category", { id: BooksService.getUnickID(), name: category },).then(
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
        let resultUser = await this.getUser(raitingData.user);
        if (!resultUser.success) return { success: false, result: undefined };
        if (resultUser.result === undefined) return { success: false, result: undefined };

        let user = resultUser.result;

        // добавить рейтинг            
        return this.bookRepository.postRecord("raiting", {
            id: BooksService.getUnickID(),
            id_user: user.id,
            value: raitingData.raiting,
            id_book: raitingData.book.id,
        },
        ).then(
            (data) => {
                let raitingkRecord: RaitingRecord = <RaitingRecord>data.result;
                console.log("value_raiting", data)
                return {
                    success: true,
                    result: { id: raitingkRecord.id, book: raitingData.book, user: user, value: raitingkRecord.value }
                };
            },
            (error) => {
                console.log("error_raiting", error)
                return { success: false, result: undefined };
            });

    }

    ////////////// УДАЛЕНИЕ КНИГИ ПО ИВ/////////////////////////
    public async RemoveBookById(id: number) {

        //  Удаляем связи
        const resultBookCategoriesRecord = await this.bookRepository.deleteRecordsByBookId('category_book', id)
        if (!resultBookCategoriesRecord.success) return { success: false, result: <Book>{} };
        const resultBookAuthorsRecord = await this.bookRepository.deleteRecordsByBookId('book_author', id)
        if (!resultBookAuthorsRecord.success) return { success: false, result: <Book>{} };
        const resultBookRaitingRecord = await this.bookRepository.deleteRecordsByBookId('raiting', id)
        if (!resultBookRaitingRecord.success) return { success: false, result: <Book>{} };
        const resultBookCartRecord = await this.bookRepository.deleteRecordsByBookId('cart', id)
        if (!resultBookCartRecord.success) return { success: false, result: <Book>{} };

        const resultBookRecord = await this.bookRepository.deleteRecordById('book', id)
        if (!resultBookRecord.success) return { success: false, result: <Book>{} };

        //   категории и авторов не убираю -  потом пригодятся                  
        return { success: true, result: <Book>{} };
    }

    /////////////  ПОЛУЧИТЬ ЮЗЕРА по логину //////////////
    public async getUser(email: string): Promise<{ success: boolean, result: User }> {

        const resultUserRecord = await this.bookRepository.getUserRecordByEMail(email);
        if (!resultUserRecord.success) return { success: false, result: <User>{} };
        let data: UserRecord = <UserRecord>resultUserRecord.result;

        let user = <User>{
            id: data.id,
            name: data.name,
            description: data.description,
            email: data.email,
            pass: data.pass,
        };
        return { success: true, result: user };
    }
}
