import { Router, Request, Response } from "express";
    import { Book,User } from './interfaces/types';
    import { token,booksPlaceholder,userPlaceholder } from './interfaces/placeholders';
    import {BooksService} from "./api/BooksService"

    export class UserRouter {
        private _router: Router;
    
        constructor(booksService:BooksService) {
            this._router = Router();
    
        // логин
        this._router.post('/login', (            
            req: Request<{login: string},{},{pass:string}>,            
            res: Response
            ) => {
             res.send(token)            
        })

        // регистрация
        this._router.post('/register', (            
            req: Request<{login: string},{},{pass:string}>,            
            res: Response
            ) => {
             res.send(token)            
        })
        // Корзина
            this._router.get('/user/cart', (req, res) => {
            // Этот эндпоинт должен принимать заголовок Authorization со значением Bearer <token>
            // проверить заголовки
                res.send(booksPlaceholder)
            })
            
        // получить юзера по id
            this._router.get('user/:id', (
                req: Request<{id: string}>,      
                res) => {
                res.send(userPlaceholder)
            })
       
       
        // редактировать юзера
          this._router.put('/user/:id', (            
            req: Request<{ id: string }, {}, [{field:string, value:any}] >,
           res: Response
           ) => {
            res.send(userPlaceholder)            
       })
        // удалить книгу
        this._router.delete('/user/:id', (            
            req: Request<{}, {}, {} >,
           res: Response
           ) => {
            res.send(userPlaceholder)            
       })
        }
        get router() {
            return this._router;
        }
    }
    

// Эндпоинты для пользователей:
// POST /api/v1/user/login — авторизация по электронной почте или логину. 
// После авторизации эндпоинт возвращает JWT-токен или два токена — refresh-токен и access-токен. 
// В первом случае достаточно сохранить его в localStorage или куки. 
// Во втором случае рекомендуем использовать refresh-токен как HTTP only cookie. 
// А access-токен не должен сохраняться локально.

// POST /api/v1/user/register — регистрация. 
// Принимает такие же параметры в теле запроса, 
// как /api/v1/user/login и возвращает JWT-токены после регистрации. 
// Регистрация должна создать нового пользователя в базе данных.

// GET /api/v1/user/books — список книг, которые сохранил пользователь. 
// Это может быть список избранных книг или корзина для покупок. 
// Во втором случае можно создать эндпоинт /api/v1/user/cart. 
// Этот эндпоинт должен принимать заголовок Authorization со значением Bearer <token>. 
// Если JWT-токена нет в заголовке, то эндпоинт должен вернуть ошибку.

// PUT /api/v1/user/<userId> — редактирование данных о пользователе. Пользователь может редактировать своё имя или описание о себе.
// DELETE /api/v1/user/<userId> — удаление пользователя.