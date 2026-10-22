
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import DashboardCard from '../components/dashboardCard'
import { getProducts } from '../api/productApi'
import {
    getTotalOrders,
    getTotalSales,
    getTopSellingProducts,
    getSalesOverview,
} from '../api/orderApi'

// 模拟 API，不访问真实数据库
vi.mock('../api/productApi', () => ({
    getProducts: vi.fn(),
}))

vi.mock('../api/orderApi', () => ({
    getTotalOrders: vi.fn(),
    getTotalSales: vi.fn(),
    getTopSellingProducts: vi.fn(),
    getSalesOverview: vi.fn(),
}))

// Recharts 依赖容器尺寸，测试环境用简单组件代替
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children} </div>,
    LineChart: ({ children }: any) => (
        <div data-testid="sales-line-chart">{children}</div>
    ),
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
}))

const mockedGetProducts = vi.mocked(getProducts)
const mockedGetTotalOrders = vi.mocked(getTotalOrders)
const mockedGetTotalSales = vi.mocked(getTotalSales)
const mockedGetTopSellingProducts = vi.mocked(getTopSellingProducts)
const mockedGetSalesOverview = vi.mocked(getSalesOverview)

// 根据卡片标题找到对应的数值
function getCardValue(title: string) {
    const heading = screen.getByText(title)
    const card = heading.closest('.dashboard-card')

    if (!card) {
        throw new Error(`Cannot find dashboard card: ${title}`)
    }

    return within(card as HTMLElement).getByRole('heading', {
        level: 2,
    })
}

function getSalesOverviewSection() {
    const section = screen.getByRole('heading', {
        name: 'Sales Overview',
        level: 2,
    }).closest('section')

    if (!section) {
        throw new Error('Cannot find sales overview section')
    }

    return within(section)
}

describe('DashboardCard', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetProducts.mockResolvedValue([])
        mockedGetTotalOrders.mockResolvedValue(0)
        mockedGetTotalSales.mockResolvedValue(0)
        mockedGetTopSellingProducts.mockResolvedValue([])
        mockedGetSalesOverview.mockResolvedValue([])
    })

    it('displays the correct total number of products', async () => {
        mockedGetProducts.mockResolvedValue([
            { id: 1, productName: 'Milk', count: 20 },
            { id: 2, productName: 'Bread', count: 5 },
            { id: 3, productName: 'Eggs', count: 12 },
        ] as Awaited<ReturnType<typeof getProducts>>)

        render(<DashboardCard />)

        await waitFor(() => {
            expect(getCardValue('Total Products')).toHaveTextContent('3')
        })
    })

    it('counts products with stock below 10 and displays alerts', async () => {
        mockedGetProducts.mockResolvedValue([
            { id: 1, productName: 'Milk', count: 20 },
            { id: 2, productName: 'Bread', count: 5 },
            { id: 3, productName: 'Eggs', count: 0 },
            { id: 4, productName: 'Rice', count: 10 },
        ] as Awaited<ReturnType<typeof getProducts>>)

        render(<DashboardCard />)

        await waitFor(() => {
            expect(getCardValue('Low Stock Products')).toHaveTextContent('2')
        })

        expect(screen.getByText('Bread')).toBeInTheDocument()
        expect(screen.getByText('Eggs')).toBeInTheDocument()
        expect(screen.getByText('Out of Stock')).toBeInTheDocument()
        expect(screen.getByText('5 remaining')).toBeInTheDocument()

        // count = 10 不属于低库存
        expect(screen.queryByText('Rice')).not.toBeInTheDocument()
    })

    it('renders the sales overview chart when data is available', async () => {
        mockedGetSalesOverview.mockResolvedValue([
            { date: '2026-10-20', totalSales: 100 },
            { date: '2026-10-21', totalSales: 150 },
        ])

        render(<DashboardCard />)

        const salesOverview = getSalesOverviewSection()

        expect(salesOverview.getByText('Loading sales chart...')).toBeInTheDocument()
        expect(salesOverview.queryByTestId('sales-line-chart')).not.toBeInTheDocument()
        expect(salesOverview.queryByText('No sales data available.')).not.toBeInTheDocument()

        expect(
            await salesOverview.findByTestId('sales-line-chart')
        ).toBeInTheDocument()

        expect(
            salesOverview.queryByText('No sales data available.')
        ).not.toBeInTheDocument()
        expect(salesOverview.queryByText('Loading sales chart...')).not.toBeInTheDocument()
        expect(salesOverview.queryByText('Failed to load sales data.')).not.toBeInTheDocument()
    })

    it('shows the sales overview empty state when no sales are returned', async () => {
        render(<DashboardCard />)

        const salesOverview = getSalesOverviewSection()

        expect(await salesOverview.findByText('No sales data available.')).toBeInTheDocument()
        expect(salesOverview.queryByTestId('sales-line-chart')).not.toBeInTheDocument()
        expect(salesOverview.queryByText('Loading sales chart...')).not.toBeInTheDocument()
        expect(salesOverview.queryByText('Failed to load sales data.')).not.toBeInTheDocument()
    })

    it('shows a sales overview error when the sales overview API fails', async () => {
        mockedGetSalesOverview.mockRejectedValue(new Error('Sales overview API unavailable'))

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        try {
            render(<DashboardCard />)

            const salesOverview = getSalesOverviewSection()

            expect(await salesOverview.findByText('Failed to load sales data.')).toBeInTheDocument()
            expect(salesOverview.queryByTestId('sales-line-chart')).not.toBeInTheDocument()
            expect(salesOverview.queryByText('Loading sales chart...')).not.toBeInTheDocument()
            expect(salesOverview.queryByText('No sales data available.')).not.toBeInTheDocument()
        } finally {
            consoleSpy.mockRestore()
        }
    })

    it('shows an error when the products API fails', async () => {
        mockedGetProducts.mockRejectedValue(
            new Error('Products API unavailable')
        )

        // 预期的错误会被 Dashboard 自己记录到 console
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { })

        try {
            render(<DashboardCard />)

            await waitFor(() => {
                expect(getCardValue('Total Products')).toHaveTextContent('Error')
                expect(getCardValue('Low Stock Products')).toHaveTextContent('Error')
            })

            expect(
                screen.getByText('Failed to load inventory data.')
            ).toBeInTheDocument()
        } finally {
            consoleSpy.mockRestore()
        }
    })
})
