
import { SupabaseClient, createClient, PostgrestError } from '@supabase/supabase-js'
import { CurencyRecord, CategoryRecord, AuthorRecord, BookRecord, Book_AuthorRecord, Category_BookRecord, RaitingRecord } from '../interfaces/types';
import {FieldRecord } from '../interfaces/types';
import { type } from 'os';

type T = CategoryRecord | CurencyRecord | AuthorRecord | BookRecord | Book_AuthorRecord | Category_BookRecord | RaitingRecord | string;

export class BookRepository {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = 'https://tkgedhklnmtotqxkvels.supabase.co';
        const supabaseKey = <string>process.env.SUPABASE_KEY;
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    public async getAllFromTable(tableName: string) {
        // Если мы не используем ORM
        //const booksList:Book[] = await this.supabase.query'SELECT * from "BOOKS"';

        const { data, error, status } = await this.supabase.from(tableName).select();
        if (status === 200) return data;
        else return error;

    }
    //  поиск в таблице по id
    public async getRecordById(tableName: string, id: string | number) {
        const { data, error, status } = await this.supabase.from(tableName).select()
        // .eq('id', id).returns<CurencyRecord>();

        if (status === 200)
            return data;
        else
            return error;
    }
     //  обновление записи по id, на вход список значений и полей как уже в базе
     public async updateRecord(tableName: string, id:  number, fields:FieldRecord[]) : Promise<{ success: boolean, result: FieldRecord[] | PostgrestError | null }>{
        
        let fieldsArray = fields.map((element:FieldRecord) => {
            id: Number(id), 
            element["field"]:element.value,            
          })       

        const  resultUpdate = await this.supabase.from(tableName)        
         .upsert([{id: 1, name:'Книга'}, {id: 1, language: 'Русский'}, {id: 1, price: 10.55}])

        if (resultUpdate.status === 204)            
            return { success: true, result: resultUpdate.data };
        else
        return { success: false, result: <PostgrestError>resultUpdate.error };
           
    }
    // вставка записи в таблицу, перед тем как вставить если есть name - проверяет на дубли и если есть вернет существующий
    public async postRecord(tableName: string, record: T): Promise<{ success: boolean, result: T | PostgrestError | null }> {
        const recordSelect: CategoryRecord | CurencyRecord | AuthorRecord | BookRecord = <CategoryRecord | CurencyRecord | AuthorRecord | BookRecord>record;

        //  если name  заполнено проверю наличие записи в базе и если есть  -  отдам сущестсвующую
        if (recordSelect.name != undefined) {
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