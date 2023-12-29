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

    

}

