import { Router, Request, Response, NextFunction } from 'express';
import {Controller,Middleware} from "./Controller";
import { verify,Secret } from 'jsonwebtoken';

export class ValidateMiddleware extends Middleware {
    // Валидация может быть более комплексной
    public handle(req:Request, res:Response, next:NextFunction) {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(422).send({ error: 'No username or password' })
        }
    }
}

export class AuthMiddleware extends Middleware {
    public handle(req:Request, res:Response, next:NextFunction) {
        const token = String(req.headers.Authorization);
        verify(token, <Secret> process.env.JWTSECRET, (err, payload) => {
            if (err) {
                res.status(401).send({ error: true })
            } else {
                // Не забудьте дополнить types.d.ts для Express
                // req.jwtPayload = payload;
                next();
            }
        })
    }
}  