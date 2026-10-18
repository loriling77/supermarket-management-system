
export interface Product {
    id: number;
    productName: string;
    manufactureId: number;
    manufactureName?: string | null;
    categoryId: number;
    categoryName?: string | null;
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
    userId: number;
    totalAmount: number;
    status: boolean;
    createdAt: Date;
    OrderItems: [];






}

export interface AuthUser {
    id: string;
    email: string;
    roles: string[];
}

export interface RegisterRequest {
    userName: string;
    email: string;

    password: string;
}

export interface CartItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
}