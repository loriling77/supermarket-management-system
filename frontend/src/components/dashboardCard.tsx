
import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import {
    getTotalOrders,
    getTotalSales,
    getTopSellingProducts
} from "../api/orderApi";

import type { TopSellingProduct } from "../api/orderApi";
import type { Product } from "../types/types"
import { getSalesOverview } from "../api/orderApi";
import type { DailySales } from "../api/orderApi";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
type DashboardStatCardProps = {
    title: string;
    value: string;
    icon: string;
};

function DashboardStatCard({
    title,
    value,
    icon,
}: DashboardStatCardProps) {
    return (
        <div className="dashboard-card">
            <div className="dashboard-card-header">
                <span>{title}</span>
                <span className="dashboard-card-icon">{icon}</span>
            </div>

            <h2>{value}</h2>
        </div>
    );
}

export default function DashboardCard() {

    const [totalProducts, setTotalProducts] = useState<number | null>(null);
    const [productsError, setProductsError] = useState(false);
    const [totalOrders, setTotalOrders] = useState<number | null>(null)
    const [ordersError, setOrdersError] = useState(false);
    const [totalSales, setTotalSales] = useState<number | null>(null);
    const [salesError, setSalesError] = useState(false);
    const [lowStockProducts, setLowStockProducts] = useState<number | null>(null);
    const [lowStockList, setLowStockList] = useState<Product[]>([]);
    const [topProducts, setTopProducts] =
        useState<TopSellingProduct[]>([]);

    const [topProductsLoading, setTopProductsLoading] =
        useState(true);

    const [topProductsError, setTopProductsError] =
        useState(false);

    const [salesOverview, setSalesOverview] =
        useState<DailySales[]>([]);

    const [salesOverviewLoading, setSalesOverviewLoading] =
        useState(true);

    const [salesOverviewError, setSalesOverviewError] =
        useState(false);


    useEffect(() => {
        const loadTopProducts = async () => {
            try {
                const data = await getTopSellingProducts();
                setTopProducts(data);
            } catch (error) {
                console.error(
                    "Failed to load top selling products:",
                    error
                );
                setTopProductsError(true);
            } finally {
                setTopProductsLoading(false);
            }
        };

        void loadTopProducts();
    }, []);


    useEffect(() => {
        const loadTotalSales = async () => {
            console.log("Starting to load")
            try {
                const amount = await getTotalSales();
                setTotalSales(amount)
            } catch (error) {
                console.error(error)
                setSalesError(true)
            }
        }
        void loadTotalSales();
    })

    useEffect(() => {
        const loadTotalOrders = async () => {
            try {
                const count = await getTotalOrders()
                setTotalOrders(count)

            } catch (error) {
                console.error('Failed to load total orders:', error)
                setOrdersError(true)
            }

        }
        void loadTotalOrders()
    })
    useEffect(() => {
        const loadDashboardProducts = async () => {
            try {
                const data = await getProducts();
                setTotalProducts(data.length);
                const lowStockItems = data.filter((p) => p.count < 10)
                setLowStockProducts(lowStockItems.length)
                setLowStockList(lowStockItems)
            } catch (error) {
                console.error("Failed to load dashboard products:", error);
                setProductsError(true);
            }
        };

        void loadDashboardProducts();
    }, []);


    useEffect(() => {
        const loadSalesOverview = async () => {
            try {
                const data = await getSalesOverview();
                setSalesOverview(data);
            } catch (error) {
                console.error(
                    "Failed to load sales overview:",
                    error
                );
                setSalesOverviewError(true);
            } finally {
                setSalesOverviewLoading(false);
            }
        };

        void loadSalesOverview();
    }, []);


    return (

        <main className="home-main dashboard-main">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Supermarket sales and inventory overview</p>
            </header>

            <div className="dashboard-content">
                {/* Statistics */}
                <div className="dashboard-stats">
                    <DashboardStatCard
                        title="Total Sales"
                        value={
                            salesError ? "Error" : totalSales === null ? "Loading..." : `${totalSales.toFixed(2)}`
                        }
                        icon="£"
                    />

                    <DashboardStatCard
                        title="Total Orders"
                        value={ordersError ? "Error" : totalOrders === null ? "Loading..." : totalOrders.toString()}
                        icon="🛒"
                    />

                    <DashboardStatCard
                        title="Total Products"
                        value={
                            productsError
                                ? "Error"
                                : totalProducts === null
                                    ? "Loading..."
                                    : totalProducts.toString()
                        }
                        icon="📦"
                    />

                    <DashboardStatCard
                        title="Low Stock Products"
                        value={productsError ? "Error" : lowStockProducts === null ? "Loading" : lowStockProducts.toString()}
                        icon="⚠️"
                    />
                </div>

                {/* Sales Overview */}
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Sales Overview</h2>
                        <p>Sales performance over time</p>
                    </div>


                    {salesOverviewLoading ? (
                        <div className="dashboard-chart-placeholder">
                            Loading sales chart...
                        </div>
                    ) : salesOverviewError ? (
                        <div className="dashboard-chart-placeholder">
                            Failed to load sales data.
                        </div>
                    ) : salesOverview.length === 0 ? (
                        <div className="dashboard-chart-placeholder">
                            No sales data available.
                        </div>
                    ) : (
                        <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={salesOverview}
                                    margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date: string) =>
                                            date.slice(5)
                                        }
                                    />

                                    <YAxis
                                        tickFormatter={(value: number) =>
                                            `£${value}`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            `£${Number(value ?? 0).toFixed(2)}`
                                        }
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="totalSales"
                                        name="Total Sales"
                                        stroke="#16a34a"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                </section>

                {/* Bottom Panels */}
                <div className="dashboard-bottom-grid">
                    <section className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Top Selling Products</h2>
                            <p>Most popular products</p>
                        </div>


                        {topProductsLoading ? (
                            <div className="dashboard-empty">
                                Loading top products...
                            </div>
                        ) : topProductsError ? (
                            <div className="dashboard-empty">
                                Failed to load top products.
                            </div>
                        ) : topProducts.length === 0 ? (
                            <div className="dashboard-empty">
                                No sales data available.
                            </div>
                        ) : (
                            <div className="dashboard-top-products-list">
                                {topProducts.map((product, index) => (
                                    <div
                                        className="dashboard-top-product-item"
                                        key={product.productId}
                                    >
                                        <div className="dashboard-top-product-info">
                                            <span className="dashboard-product-rank">
                                                {index + 1}
                                            </span>

                                            <strong>{product.productName}</strong>
                                        </div>

                                        <span className="dashboard-product-sales">
                                            {product.unitsSold} sold
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </section>

                    <section className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Low Stock Alerts</h2>
                            <p>Products that need restocking</p>
                        </div>
                        {productsError ? (
                            <div className="dashboard-empty">
                                Failed to load inventory data.
                            </div>
                        ) : lowStockProducts === null ? (
                            <div className="dashboard-empty">
                                Loading inventory...
                            </div>
                        ) : lowStockList.length === 0 ? (
                            <div className="dashboard-empty">
                                All products have sufficient stock.
                            </div>
                        ) : (
                            <div className="dashboard-low-stock-list">
                                {lowStockList
                                    .slice()
                                    .sort((a, b) => a.count - b.count)
                                    .map((product) => (
                                        <div
                                            className="dashboard-low-stock-item"
                                            key={product.id}
                                        >
                                            <div>
                                                <strong>{product.productName}</strong>
                                                <p>
                                                    {product.count} remaining
                                                </p>
                                            </div>

                                            <span
                                                className={
                                                    product.count === 0
                                                        ? "dashboard-stock-out"
                                                        : "dashboard-stock-low"
                                                }
                                            >
                                                {product.count === 0
                                                    ? "Out of Stock"
                                                    : "Low Stock"}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}


                    </section>
                </div>
            </div>
        </main>
    );

}


