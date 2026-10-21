
const API_URL = "/api/";

export type TopSellingProduct = {
    productId: number;
    productName: string;
    unitsSold: number;
};

export async function getTotalOrders(): Promise<number> {
    const response = await fetch(
        `${API_URL}Order/count`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to get total orders: ${response.status}`
        );
    }

    const data: { totalOrders: number } =
        await response.json();

    return data.totalOrders;
}

export async function getTotalSales(): Promise<number> {
    const response = await fetch(
        `${API_URL}Order/sales`,
        {
            method: "GET",
            credentials: "include"
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to get total sales:${response.status}`
        )
    }
    const data: { totalSales: number } = await response.json()
    return data.totalSales;
}

export async function getTopSellingProducts(): Promise<TopSellingProduct[]> {
    const response = await fetch(
        `${API_URL}Order/top-products`,
        {
            method: "GET",
            credentials: "include"
        }
    )
    if (!response.ok) {
        throw new Error(
            `Failed to get top selling products:${response.status}`
        )
    }
    const data: TopSellingProduct[] = await response.json();
    return data
}


export type DailySales = {
    date: string;
    totalSales: number;
};

export async function getSalesOverview(): Promise<DailySales[]> {
    const response = await fetch(
        `${API_URL}Order/sales-overview`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to get sales overview: ${response.status}`
        );
    }

    const data: DailySales[] = await response.json();

    return data;
}
