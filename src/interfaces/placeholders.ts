
import { Book,User,Category,Raiting} from "./types";

export const booksPlaceholder: Book = {
    id:1,
    name:"book1",
    categories:[],
    language: "RU",
    price: 111,
    curency: {id:11,name:"USD"},
    published: 2000,
    authors:[],
    // raiting:[]
};

export const userPlaceholder: User = {"id":1,"name":"user"};
export const categoryPlaceholder: Category = {"id":1,"name":"user"};
// export const bookPlaceholder: Book = {"id":1,"name":"book1"};
export const raitingPlaceholder: Raiting = {"id":1,"user": {"id":1,name:"nata"},"book": <Book>{}, value: 5};

export const token = "34154w765e68fpy9g";