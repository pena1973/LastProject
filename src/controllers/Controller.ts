import { Router, Request, Response, NextFunction } from 'express';

export abstract class Middleware implements IMiddleware {
    public handle(req: Request, res: Response, next: NextFunction) { }
}

interface IMiddleware {
    handle: (req: Request, res: Response, next: NextFunction) => void;
}
interface ControllerRoute {
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
    path: string;

    fn: (req: Request, res: Response, next: NextFunction) => void;
    middleware: IMiddleware[];
}


export class Controller {
    private _router: Router;

    constructor() {
        this._router = Router();
    }

    // protected bindRoutes(routes: ControllerRoute[]) {
    //     console.log(routes);
    //     routes.forEach((route) => {
    //         // Не забываем сохранить this
    //         const ctxHandler = route.fn.bind(this);
    //         console.log(route.path);

    //         // Добавляем массив с middleware, если они присутствуют
    //         // const routeHandlers:any|undefined = route.middleware ? [...route.middleware.map((m) => m.handle), ctxHandler]:undefined;            
    //         // this._router[route.method ?? 'get'](route.path, routeHandlers);

    //         // Добавляем массив с middleware, если они присутствуют
    //         const routeHandlers = route.middleware ? [...route.middleware.map(m => m.handle), ctxHandler] : [ctxHandler];
    //         this._router[route.method ?? 'get'](route.path, routeHandlers);
    //     })

    // }

}

