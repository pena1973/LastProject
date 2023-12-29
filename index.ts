import { App } from './src/App';
import * as dotenv from 'dotenv';

import {BooksController} from "./src/controllers/BooksController"
import {AuthController} from "./src/controllers/AuthController"

import {BooksService} from "./src/api/BooksService"
import {AuthService} from "./src/api/AuthService"
// dotend получать доступ к env-переменным из файла .env
dotenv.config();

async function bootstrap() {
    const bookController = new BooksController(new BooksService());
    const authController = new AuthController(new AuthService());
    // const categoryController = new CategoryController(new CategoryService(new CategoryRepository(new DBService())));

    const app = new App(bookController, authController);
    
    await app.run();
}  


bootstrap();