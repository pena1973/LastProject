
import { SupabaseClient, createClient, PostgrestError } from '@supabase/supabase-js'
import { CurencyRecord, CategoryRecord, AuthorRecord, BookRecord, Book_AuthorRecord, Category_BookRecord, RaitingRecord, UserRecord } from '../interfaces/types';
import { FieldRecord } from '../interfaces/types';
import { type } from 'os';
import { match } from 'assert';

type T = CategoryRecord | CurencyRecord | AuthorRecord | BookRecord | Book_AuthorRecord | Category_BookRecord | RaitingRecord | UserRecord | string;

export class BookRepository {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = 'https://tkgedhklnmtotqxkvels.supabase.co';
        const supabaseKey = <string>process.env.SUPABASE_KEY;
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    public async getAllFromTable(
        tableName: string,
        filter: { field: string, values: string[] | number[] | Date[] | boolean[] } | undefined = undefined,
        limit: number | undefined = undefined,
        rangeFrom: number | undefined = undefined,
        rangeTo: number | undefined = undefined): Promise<{ success: boolean, result: T[] | PostgrestError }> {

        // Если мы не используем ORM
        //const booksList:Book[] = await this.supabase.query'SELECT * from "BOOKS"';


        let resultSelect;
        let condition = String((!filter) ? 0 : 1) + String((rangeFrom === undefined || rangeTo === undefined) ? 0 : 1) + String((!limit) ? 0 : 1);
        switch (condition) {
            case "000":
                resultSelect = await this.supabase.from(tableName).select().returns<T[]>();
                break
            case "001":
                resultSelect = await this.supabase.from(tableName).select().limit(<number>limit).returns<T[]>();
                break
            case "010":
                resultSelect = await this.supabase.from(tableName).select().range(<number>rangeFrom, <number>rangeTo).returns<T[]>();
                break
            case "011":
                resultSelect = await this.supabase.from(tableName).select().range(<number>rangeFrom, <number>rangeTo).limit(<number>limit).returns<T[]>();
                break
            case "100":
                resultSelect = await this.supabase.from(tableName).select().in(<string>filter?.field, <[]>filter?.values).returns<T[]>();
                break
            case "101":
                resultSelect = await this.supabase.from(tableName).select().in(<string>filter?.field, <[]>filter?.values).limit(<number>limit).returns<T[]>();
                break
            case "110":
                // .in('name', ['Albania', 'Algeria'])
                resultSelect = await this.supabase.from(tableName).select().in(<string>filter?.field, <[]>filter?.values).range(<number>rangeFrom, <number>rangeTo).returns<T[]>();
                break
            case "111":
                resultSelect = await this.supabase.from(tableName).select().in(<string>filter?.field, <[]>filter?.values).range(<number>rangeFrom, <number>rangeTo).limit(<number>limit).returns<T[]>();
                break
            default:
                resultSelect = await this.supabase.from(tableName).select().returns<T[]>();
        }


        if (resultSelect.status === 200) return { success: true, result: <T[]>resultSelect.data };
        else return { success: false, result: <PostgrestError>resultSelect.error };;

    }
    //  поиск в таблице по id
    public async getRecordById(tableName: string, id: number): Promise<{ success: boolean, result: T | PostgrestError | null }> {
        const  resultSelect = await this.supabase.from(tableName).select().eq('id', id).returns<T[]>();
        if (resultSelect.status === 200){ 
        
            if (!resultSelect.data)              return { success: false, result: <T>{}};        
            else if (resultSelect.data.length>0) return { success: true, result: resultSelect.data[0] };
            else                                return { success: false, result: <T>{}}
        }   
        else {
            console.log(resultSelect.error);
            return { success: false, result: <PostgrestError>resultSelect.error }
        };
    }
    //  поиск в юзера таблице по мейлу
    public async getUserRecordByEMail(email: string): Promise<{ success: boolean, result: UserRecord | PostgrestError }> {
        const  resultSelect  = await this.supabase.from("user").select().eq('email', email).returns<UserRecord[]>();
        if (resultSelect.status === 200) {
        if (!resultSelect.data)              return { success: false, result: <UserRecord>{}};        
        else if (resultSelect.data.length>0) return { success: true, result: <UserRecord>resultSelect.data[0] };
        else                                 return { success: false, result: <UserRecord>{}}
    }   
    else {
        console.log(resultSelect.error);
        return { success: false, result: <PostgrestError>resultSelect.error }
    };
    }

    //  обновление записи по id, на вход список значений и полей как уже в базе, возвращает null  и статус успех неуспех
    public async updateRecord(tableName: string, record: T): Promise<{ success: boolean, result: T | PostgrestError | null }> {

        const resultUpdate = await this.supabase.from(tableName).upsert(record).select();

        if (resultUpdate.status === 201) {
            if ((resultUpdate.data != undefined) && (resultUpdate.data.length > 0))
                return { success: true, result: resultUpdate.data[0] };

        }
        else
            console.log(resultUpdate.error);
        return { success: false, result: <PostgrestError>resultUpdate.error };
    }
    //  Удаление всех записей книги
    public async deleteRecordsByBookId(tableName: string, id_book: number): Promise<{ success: boolean, result: PostgrestError | null }> {
        const resultDelete = await this.supabase.from(tableName).delete().eq('id_book', id_book);

        if (resultDelete.status === 204) {
            return { success: true, result: null };
        }
        else
            return { success: false, result: <PostgrestError>resultDelete.error };
    }
    //  Удаление записи по id
    public async deleteRecordById(tableName: string, id: number): Promise<{ success: boolean, result: PostgrestError | null }> {
        const resultDelete = await this.supabase.from(tableName).delete().eq('id', id);

        if (resultDelete.status === 204) {
            return { success: true, result: null };
        }
        else
            return { success: false, result: <PostgrestError>resultDelete.error };
    }

    // вставка записи в таблицу, перед тем как вставить если есть name - проверяет на дубли и если есть вернет существующий
    public async postRecord(tableName: string, record: T): Promise<{ success: boolean, result: T | PostgrestError | null }> {
        const recordSelect: CategoryRecord | CurencyRecord | AuthorRecord | BookRecord = <CategoryRecord | CurencyRecord | AuthorRecord | BookRecord>record;

        //  если name  заполнено проверю наличие записи в базе и если есть  -  отдам сущестсвующую кроме юзера
        if (recordSelect.name != undefined && tableName !='user') {
            const resultSelect = await this.supabase.from(tableName).select().eq('name', recordSelect.name).returns<T[]>();

            if (resultSelect.status === 200) {
                if ((resultSelect.data != undefined) && (resultSelect.data.length > 0))
                    return { success: true, result: resultSelect.data[0] };
            }
            else {
                console.log("Ошибка в менент проверики есть ли уже записи с таким name", resultSelect.error);
                return { success: false, result: <PostgrestError>resultSelect.error };
            }
        }

        //Далее проверю по парам ключей
        // Category_BookRecord
        const recordSelect1: Category_BookRecord = <Category_BookRecord>record;
        if (recordSelect1.id_book != undefined && recordSelect1.id_category != undefined) {
            const resultSelect1 = await this.supabase.from(tableName).select().eq('id_book', recordSelect1.id_book).eq('id_category', recordSelect1.id_category).returns<Category_BookRecord[]>();

            if (resultSelect1.status === 200) {
                if ((resultSelect1.data != undefined) && (resultSelect1.data.length > 0))
                    return { success: true, result: resultSelect1.data[0] };
            }
            else {
                console.log("Ошибка в менент проверики есть ли уже записи таблицы Category_Book", resultSelect1.error);
                return { success: false, result: <PostgrestError>resultSelect1.error };
            }
        }
        // Book_AuthorRecord
        const recordSelect2: Book_AuthorRecord = <Book_AuthorRecord>record;
        if (recordSelect2.id_book != undefined && recordSelect2.id_author != undefined) {
            const resultSelect2 = await this.supabase.from(tableName).select().eq('id_book', recordSelect2.id_book).eq('id_author', recordSelect2.id_author).returns<Book_AuthorRecord[]>();

            if (resultSelect2.status === 200) {
                if ((resultSelect2.data != undefined) && (resultSelect2.data.length > 0))
                    return { success: true, result: resultSelect2.data[0] };
            }
            else {
                console.log("Ошибка в менент проверики есть ли уже записи таблицы Book_Author", resultSelect2.error);
                return { success: false, result: <PostgrestError>resultSelect2.error };
            }
        }

        // RaitingRecord
        const recordSelect3: RaitingRecord = <RaitingRecord>record;
        if (recordSelect3.id_book != undefined && recordSelect3.id_user != undefined) {
            const resultSelect3 = await this.supabase.from(tableName).select().eq('id_book', recordSelect3.id_book).eq('id_user', recordSelect3.id_user).returns<Book_AuthorRecord[]>();

            if (resultSelect3.status === 200) {
                if ((resultSelect3.data != undefined) && (resultSelect3.data.length > 0))
                    return { success: true, result: resultSelect3.data[0] };
            }
            else {
                console.log("Ошибка в менент проверики есть ли уже записи таблицы Raiting", resultSelect3.error);
                return { success: false, result: <PostgrestError>resultSelect3.error };
            }
        }

        // если нет существующего то добавлю и верну добавленный    
        // добавляю и если id уже есть вылетит с ошибкой
        const { data, error, status } = await this.supabase.from(tableName).insert(record).select().returns<T[]>();
        if (status === 201) {
            if (data?.length) return { success: true, result: data[0] };
            return { success: true, result: <T>{} };
        }
        else {
            console.log("Ошибка в момент добавления записи", error);
            return { success: false, result: error };;
        }

    }

}  