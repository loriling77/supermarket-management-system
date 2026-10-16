
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

export interface Order {

    id: number;
    productName: string;
    unitPrice: number;
    count: number;
    createdTime: Date;
    createDate: Date;





}

