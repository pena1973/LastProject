// перенвдит массив записей в массив их id
export function getIdArray(data: {id:number}[]): number[] {

    return data.map(record=>{return record.id})
    
}
// перенвдит массив записей в массив их id
export function getIdArrayAutor(data: {id_author:number}[]): number[] {

    return data.map(record=>{return record.id_author})
    
}
// перенвдит массив записей в массив их id
export function getIdArrayCategory(data: {id_category:number}[]): number[] {

    return data.map(record=>{return record.id_category})
    
}
// export const addNewCategories = (cat: string[], newbooks: Item[]) => {
//     let newcat: string[] = [...cat];
//     for (let i = 0; i < newbooks.length; i++) {
//         const item = newbooks[i];
//         item.categories.forEach(category => {

//             if (!newcat.find(elem => elem === category.name)) {
//                 newcat.push(category.name)
//             }
//         });
//     }
//     return newcat;
// }

// export function addtoCatalogNewItems(catalog: Item[], receivedItems: Item[]) {

//     let newCatalog = [...receivedItems];

//     catalog.forEach(item => {
//         let potentialItem = newCatalog.find((e) => { return (e.id === item.id) })
//         if (!potentialItem) newCatalog.push(item);
//     });

//     return newCatalog;
// }

// export function removefromCatalogItems(catalog: Item[], id: number) {

//     const newCat = catalog.filter(n => n.id !== id);

//     return newCat;
// }