
export interface Product {
    id: number;
    productName: string;
    manufactureId: number;
    categoryId: number;
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

export interface AuthUser {
    id: string;
    email: string;
    roles: string[];
}

export interface RegisterRequest {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
}