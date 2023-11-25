import { BookRepository } from "./BookRepository"
import { IUserPayload, User, UserRecord } from '../interfaces/types';

export class AuthService {
    bookRepository: BookRepository;

    private static getUnickID(): number {
        return Number(Date.now());
    }
    constructor() {
        this.bookRepository = new BookRepository();
    }
    /////////////  ПОЛУЧИТЬ ЮЗЕРА по логину //////////////
    public async getUser(email: string): Promise<{ success: boolean, result: User }> {

        const resultUserRecord = await this.bookRepository.getUserRecordByEMail(email);
        if (!resultUserRecord.success)  return { success: false, result: <User>{} };
        let data: UserRecord = <UserRecord>resultUserRecord.result;
  
        let user = <User>{
            id: data.id,
            name: data.name,
            description: data.description,
            email: data.email,
            pass: data.pass,
        };
        return { success: true, result: user };
    }
    /////////////  СОЗДАТЬ ЮЗЕРА //////////////
    //    name,description, email, pass,
    public async createUser(userData: IUserPayload): Promise<{ success: boolean, result: User }> {

        let user: User = <User>{};
        let resultuser = await this.bookRepository.postRecord("user", {
            id: AuthService.getUnickID(),
            name: userData.name,
            description: userData.description,
            email: userData.email,
            pass: userData.pass,
        },
        ).then(
            (data) => {
                let userRecord: UserRecord = <UserRecord>data.result;
                if (!userRecord) return
                user.id = userRecord.id;
                user.name = userRecord.name;
                user.description = userRecord.description;
                user.email = userRecord.email;
                user.pass = userRecord.pass;

                return { success: true, result: user };
            },
            (error) => {
                console.log("error_add_user", error)
                return { success: false, result: user };
            });

        if (resultuser?.success) {
            return resultuser;
        }
        else return { success: false, result: <User>{} };
    }
    /////////////  РЕДАКТИТРОВАТЬ ЮЗЕРА //////////////
    public async editUser(userId: number, userData: IUserPayload): Promise<{ success: boolean, result: User }> {

        let user: User = <User>{};
        let resultuser = await this.bookRepository.updateRecord("user", {
            id: userId,
            name: userData.name,
            description: userData.description,
            email: userData.email,
            pass: userData.pass,
        },
        ).then(
            (data) => {
                let userRecord: UserRecord = <UserRecord>data.result;
                if (!userRecord) return
                user.id = userRecord.id;
                user.name = userRecord.name;
                user.description = userRecord.description;
                user.email = userRecord.email;
                user.pass = userRecord.pass;

                return { success: true, result: user };
            },
            (error) => {
                console.log("error_add_user", error)
                return { success: false, result: user };
            });

        if (resultuser?.success) return resultuser;
        else return { success: false, result: <User>{} };
    }



}