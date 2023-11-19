import { Router, Request, Response, NextFunction } from 'express';
import {Controller,Middleware} from "./Controller";
import {ValidateMiddleware} from "./AuthMiddleware";
import {AuthService} from "../api/AuthService";

export class AuthController extends Controller {
    private login() {
            
    };
    // private authService;
    
    constructor(authService:AuthService) {
        super();
    
        this.bindRoutes([
            {
                path: '/register',
                method: 'post',
                fn: this.register,
                middleware: [new ValidateMiddleware()],
            },
            {
                path: '/login',
                method: 'post',
                fn: this.login,
                middleware: [new ValidateMiddleware()],
            }
        ])
    
    }

    private register(req:Request, res:Response, next:NextFunction) {
        //  this.authService.registerUser(req.body);
    }
}  