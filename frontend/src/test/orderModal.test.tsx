import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderModal from '../components/orderModal';
import { getOrdersByUser } from '../api/checkOutApi';

vi.mock('../api/checkOutApi', () => ({ getOrdersByUser: vi.fn() }));

it('shows the orders API failure instead of an empty order history', async () => {
    vi.mocked(getOrdersByUser).mockRejectedValue(new Error('Orders are temporarily unavailable.'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
        render(<OrderModal user={{ id: 'customer-1', userName: 'Alex', email: 'alex@example.test', phoneNumber: '', roles: ['User'] }} onClose={() => {}} />);
        expect(await screen.findByText('Orders are temporarily unavailable.')).toBeInTheDocument();
    } finally {
        consoleError.mockRestore();
    }
});
