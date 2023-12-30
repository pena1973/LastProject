
import { BooksController } from "../src/controllers/BooksController"
import { AuthController } from "../src/controllers/AuthController"
import cors from 'cors';
import express, { Express } from 'express';
import { BooksRouter } from "./BooksRouter"
import { UserRouter } from "./UserRouter"
import { LoggerMiddleware } from "./controllers/LoggerMiddleware";
export class App {
    private app: Express;
    private _loggerMiddleware: LoggerMiddleware;
    private booksRouter: BooksRouter;
    private userRouter: UserRouter;
    private readonly port: number;
    constructor(booksController: BooksController, authController: AuthController) {

        this.app = express();
        this.port = Number(process.env.APP_PORT) || 8080;
        this.booksRouter = new BooksRouter(booksController);
        this._loggerMiddleware = new LoggerMiddleware();
        this.userRouter = new UserRouter(authController);
    }

    private configureRoutes() {
        //options for cors midddleware
        // this.app.use(this._loggerMiddleware.handle);
        this.app.use('/api/v1', this.userRouter.router);
        this.app.use('/api/v1/books', this._loggerMiddleware.handle, this.booksRouter.router);

    }

    public async run() {
 
        this.app.use(cors());
        this.app.use(express.json());

        this.app.listen(this.port, () => {
            console.log('Приложение запущено!');
        })

        this.configureRoutes();
    }
}

// database supabase
// project  LastProject
// pass last_project_pass