import { App } from './src/App';
import * as dotenv from 'dotenv';
import {BookRepository} from "./src/api/BookRepository"
import {BooksController} from "./src/controllers/BooksController"
import {AuthController} from "./src/controllers/AuthController"
import {UserController} from "./src/controllers/UserController"
import { createClient } from '@supabase/supabase-js'

import {BooksService} from "./src/api/BooksService"
import {AuthService} from "./src/api/AuthService"
// dotend получать доступ к env-переменным из файла .env
dotenv.config();

// async function bootstrap() {
//     // разовая инициализация
//     // каждый экземпляр  -  это одно соединение
//     const booksService = new BooksService();
//     const authService = new AuthService();
// //     const bookController = new BooksController();
// //     const userController = new UserController();

//     const app = new App(booksService,authService);    
//     await app.run();
// }  

async function bootstrap() {
    const bookController = new BooksController(new BooksService());
    const authController = new AuthController(new AuthService());
    // const categoryController = new CategoryController(new CategoryService(new CategoryRepository(new DBService())));

    const app = new App(bookController, authController);
    await app.run();
}  




bootstrap();