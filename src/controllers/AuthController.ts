
import { Controller} from "./Controller";
import { AuthService } from "../api/AuthService";
import { sign } from 'jsonwebtoken';

export class AuthController extends Controller {
    private authService: AuthService;

    private  async HashFoo(pass: string) {
        const { createHmac } = await import('node:crypto')
        const hash = createHmac('sha256', pass)
        .update('I love cupcakes')
        .digest('hex');
      
        return hash
    }
    constructor(authService: AuthService) {
        super();
        this.authService = authService;
        console.log('Инициализация AuthController');
    }

    async login(login: string, pass: string) {
        const user = await this.authService.getUser(login);
        // проверяем соответствие логин пароль  и если все ок выдаем токен
       if  (!user.success) return {message: "Юзер не существует!", token:undefined};
      
       let hash =  await this.HashFoo(pass);
        if (user.result.pass = hash) {
            const token = sign({
                data: login
            }, String(process.env.JWTSECRET), { expiresIn: '24h' });
            return {message: "Успешно!", token:token};
        }        
        return {message: "Неправильный пароль!", token:undefined};
    }

    async  register(login: string, pass: string,name:string,about:string) {        
        const existedUser = await this.authService.getUser(login);
        if (existedUser.success) return {message: " Уже есть такой пользователь!",token:undefined};        
        // региcтрируем юзера
        const user = await this.authService.createUser({ 
            name:name,
            description:about,
            email: login,
            pass:pass
        });
        if  (!user.success) return {message: "Юзер не создан!", token:undefined};

        const token = sign({
            data: login
        }, String(process.env.JWTSECRET), { expiresIn: '24h' });
        return {message: "Успешно!", token:token};
        
    }
}  