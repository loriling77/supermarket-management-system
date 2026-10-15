
export interface Product {
    id: number;
    productName: string;
    manufactureName: string;
    category: string;
    price: number;
    count: number;
}

export interface Manufacture {
    id: number;
    manufactureName: string;
    productionLiscenseNumber: string;
    placeOfOrigin: string

}

export interface User {
    id: number;
    userName: string;
    email: string;
    telephone: string;
    password: string

}

export interface Category {
    id: number;
    categoryName: string;
    detail: string;


}





