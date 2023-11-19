
import { Request, Response, NextFunction } from 'express';
import {Middleware} from "./Controller";

export class LoggerMiddleware extends Middleware {
    constructor() {
        super();  
    }

    public handle(req:Request, res:Response, next:NextFunction) {
        console.log("req.method", req.method);
        console.log("req.path", req.path);
        // res.send() - этим можно воспользоватся в случае ошибки
        next();
    }
}
