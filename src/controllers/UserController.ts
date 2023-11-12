import { Router, Request, Response, NextFunction } from 'express';
import {Controller} from "./Controller"

import { User } from '../interfaces/types';
import { userPlaceholder } from '../interfaces/placeholders';

export class UserController extends Controller {
    constructor() {
        super();

        this.bindRoutes([
            {
                path: '/users',
                method: 'get',
                fn: this.getUser,
            }
        ])
    }

    getUser(req:Request, res:Response, next:NextFunction) {
        res.send(userPlaceholder);
    }
}  