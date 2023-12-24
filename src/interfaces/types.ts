
// поле редактирования в запросе на дедактирование
export interface Field{
   field: string, 
   value: [Field[]]|Field[]|string|number|Date|undefined; 
}
export interface Book {
    id:number,
    name: string,
    categories:Category[],
    language: string,
    price: number,
    curency: Curency|undefined,
    published: number,
    authors:Author[],
    raiting:number,   
    description:string,
    esteemes:number,
    
  }
  export interface  User {   
    id:number,
    name:string
    description: string,
    email: string,
    pass: string, 
  }

  export interface  Category {
    id: number,
    name: string,    
  }
  export interface  Author {
    id: number,
    name: string, 
    birth: number,
    death: number,   
  }
  export interface Raiting {
    id: number,
    user: User,      
    book: Book,      
    value: number   
  }
  export interface Curency{
    id: number,
    name: string,    
  }

  // Название книги;
// Год выпуска;
// Категории, к которым относится книга;
// Автор;
// Стоимость в определенной валюте;
// Рейтинг книги на основе пользовательских оценок.
  
  
  export interface IBookPayload {
    id:number,
    name: string,
    categories:string[],
    language: string,
    price: number,
    curency: string,
    published: number,
    authors:string[],
    raiting:number,
    user:string,  
    description:string,  
  }
  
  export interface ICategoryPayload {  
    id: number;
    name: string;              
  }
  
  export interface IRaitingPayload {
    id:number,
    user: string,      
    book: Book,      
    raiting: number,
  }
  export interface IAuthorPayload {  
    id: number;
    name: string; 
    birth: number,
    death: number,                
  }
// поле редактирования в запросе на дедактирование
export interface IUserPayload{  
  name:string,
  description:string,
  email: string,
  pass:string,
}
  
  // DataBase records 
  export interface UserRecord {
    id:number,
    name:string
    description: string,
    email: string,
    pass: string,
}
  export interface CurencyRecord {
      id:number,
      name:string
  }
  export interface CategoryRecord {
    id:number,
    name:string
}
export interface AuthorRecord {
  id:number,
  name:string, 
  birth: number,
  death: number,
}
   
export interface BookRecord {
  id:number,
  created_at:Date,
  name:string, 
  language:string,
  price: number,
  published: number,  
  curency: number,
  description:string,
}

export interface Book_AuthorRecord {
  id:number,
  id_book:number,
  id_author:number, 
 
}
export interface Category_BookRecord {
  id:number,
  id_book:number,
  id_category:number,  
}
 
export interface RaitingRecord{
id: number
id_book: number,
id_user: number,
value:number,
}

export interface FieldRecord{
  field: string, 
  value: string|number|Date|null; 
}