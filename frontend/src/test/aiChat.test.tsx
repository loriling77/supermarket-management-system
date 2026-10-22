import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AiChat from '../components/AiChat';
import { sendAiMessage, type AiChatResponse } from '../api/aiApi';

vi.mock('../api/aiApi', () => ({ sendAiMessage: vi.fn() }));

beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
});

async function openResult(response: AiChatResponse) {
    vi.mocked(sendAiMessage).mockResolvedValue(response);
    const add = vi.fn(() => true);
    const addAll = vi.fn(() => true);
    render(<AiChat onAddToCart={add} onAddAllToCart={addAll} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open assistant' }));
    fireEvent.change(screen.getByPlaceholderText('Ask about products...'), { target: { value: 'Milk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Here is milk');
    return { add, addAll };
}

it('adds the chosen recommendation quantity and rejects quantities outside stock limits', async () => {
    const product = { id: 1, productName: 'Milk', price: 2.5, count: 5 };
    const { add } = await openResult({ reply: 'Here is milk', products: [product], shoppingList: null });
    const quantity = screen.getByRole('spinbutton', { name: 'Quantity for Milk' });
    fireEvent.change(quantity, { target: { value: '' } });
    expect(quantity).toHaveValue(null);
    fireEvent.change(quantity, { target: { value: '3' } });
    for (const value of ['0', '6', '1.5']) {
        fireEvent.change(quantity, { target: { value } });
    }
    expect(quantity).toHaveValue(3);
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/ }));
    expect(add).toHaveBeenCalledWith(product, 3);
});

it('keeps the current scroll position when editing a shopping list quantity', async () => {
    await openResult({
        reply: 'Here is milk', products: [], shoppingList: {
            budget: 20, totalPrice: 5,
            items: [{ productId: 1, productName: 'Milk', unitPrice: 2.5, quantity: 2, availableStock: 5, totalPrice: 5 }],
        },
    });
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantity for Milk' }), { target: { value: '4' } });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
});

it('recalculates shopping list totals and adds the edited quantities', async () => {
    const { addAll } = await openResult({
        reply: 'Here is milk', products: [], shoppingList: {
            budget: 20, totalPrice: 5,
            items: [{ productId: 1, productName: 'Milk', unitPrice: 2.5, quantity: 2, availableStock: 5, totalPrice: 5 }],
        },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantity for Milk' }), { target: { value: '4' } });
    const total = screen.getByText('Total').parentElement!;
    expect(within(total).getByText('£10.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Add All to Cart/ }));
    expect(addAll).toHaveBeenCalledWith({
        budget: 20, totalPrice: 10,
        items: [{ productId: 1, productName: 'Milk', unitPrice: 2.5, quantity: 4, availableStock: 5, totalPrice: 10 }],
    });
});
