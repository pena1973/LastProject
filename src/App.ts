import { createClient } from '@supabase/supabase-js'

import {BooksService} from "./api/BooksService";

 import express, { Express } from 'express';
    import { json } from 'body-parser';
    import {BooksRouter} from "./BooksRouter"
    import {UserRouter} from "./UserRouter"
    import {CategoryRouter} from "./CategoryRouter"
    import {RaitingRouter} from "./RaitingRouter"
 
    export class App {
        private app: Express;
        private booksRouter: BooksRouter;
        private userRouter: UserRouter;
        private categoryRouter: CategoryRouter;
        private raitingRouter: RaitingRouter;
        private readonly port: number;       
    
        constructor(booksService:BooksService) {
            this.app = express();
            this.port = Number(process.env.APP_PORT) || 3000;
            this.booksRouter = new BooksRouter(booksService);
            this.userRouter = new UserRouter(booksService);
            this.categoryRouter = new CategoryRouter(booksService);
            this.raitingRouter = new RaitingRouter(booksService);
            console.log(1);
        }
    
        private configureRoutes() {
            this.app.use('/api/v1', this.userRouter.router);
            this.app.use('/api/v1/books', this.booksRouter.router);
            this.app.use('/api/v1/categories', this.categoryRouter.router);
            this.app.use('/api/v1/raiting', this.raitingRouter.router);

        }

        public async run() {            
            this.app.use(json());
            this.app.listen(this.port, () => {
                console.log('Приложение запущено!');
            })
            this.configureRoutes();
        }
    }
    
    // database supabase
    // project  LastProject
    // pass last_project_pass