import { App } from './src/App';
import * as dotenv from 'dotenv';
import {BookRepository} from "./src/api/BookRepository"
import {BooksController} from "./src/controllers/BooksController"
import {UserController} from "./src/controllers/UserController"
import { createClient } from '@supabase/supabase-js'

import {BooksService} from "./src/api/BooksService"

// dotend получать доступ к env-переменным из файла .env
dotenv.config();

async function bootstrap() {
    // разовая инициализация
    // каждый экземпляр  -  это одно соединение
    const booksService = new BooksService();
//     const bookController = new BooksController();
//     const userController = new UserController();

    const app = new App(booksService);    
    await app.run();
}  


bootstrap();