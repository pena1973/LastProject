
import { Request, Response, NextFunction } from 'express';
import { Middleware } from "./Controller";
import { verify, Secret, JwtPayload } from 'jsonwebtoken';
export class LoggerMiddleware extends Middleware {
    constructor() {
        super();
    }

    public handle(req: Request, res: Response, next: NextFunction) {
     
        // const token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoibmJAbm5uLmNvbSIsImlhdCI6MTcwMDkzOTU4MSwiZXhwIjoxNzAxMDI1OTgxfQ.rXOY6EpvlJROfJJhRmMU0DEKycQXygou5rYe3XTZJqM'        
        const token = String(req.headers.authorization).replace('Bearer ', '');
       
        verify(token, <Secret>process.env.JWTSECRET, (err, payload) => {     
            if (err) {
                console.log('verify err', err);
                res.status(401).send({ success: false, err: err, payload: payload })
            } else {
                let pay: JwtPayload = <JwtPayload>payload;
                // бессрочный токен
                if (pay.exp === undefined) next();
                else if (new Date().getMilliseconds() <= pay.exp)
                    next();
                else
                // Здесь на страницу регистрации                
                    res.status(401).send({ error: true, message:"Истек срок годности токена"})
            }
        })
      
    }

}
