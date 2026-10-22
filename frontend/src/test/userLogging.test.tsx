import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/login';
import Home from '../pages/home';
import User from '../pages/user';
import { getCurrentUser, login } from '../api/authApi';
import { getUsers } from '../api/userApi';

vi.mock('../api/authApi', () => ({ login: vi.fn(), getCurrentUser: vi.fn() }));
vi.mock('../api/productApi', () => ({ getProducts: vi.fn().mockResolvedValue([]) }));
vi.mock('../api/categoryApi', () => ({ getCategories: vi.fn().mockResolvedValue([]) }));
vi.mock('../api/manufactureApi', () => ({ getManufactures: vi.fn().mockResolvedValue([]) }));
vi.mock('../api/userApi', () => ({ getUsers: vi.fn() }));
vi.mock('../api/checkOutApi', () => ({ getOrdersByUser: vi.fn().mockResolvedValue([]) }));

const account = { id: 'private-customer-id', userName: 'Test Customer', email: 'private@example.test', phoneNumber: null, roles: ['User'] };
const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
    consoleLog.mockClear();
    vi.mocked(getCurrentUser).mockResolvedValue(account);
    vi.mocked(getUsers).mockResolvedValue([account]);
    vi.mocked(login).mockResolvedValue(account);
});

afterEach(() => vi.clearAllMocks());
afterAll(() => consoleLog.mockRestore());

function expectNoPersonalDataLogged() {
    const output = JSON.stringify(consoleLog.mock.calls);
    expect(output).not.toContain(account.id);
    expect(output).not.toContain(account.email);
}

it('signs in without printing the returned user record', async () => {
    render(<MemoryRouter initialEntries={['/login']}><Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/userOrder" element={<h1>Shopping page</h1>} />
    </Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: account.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Test-only!7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('heading', { name: 'Shopping page' })).toBeInTheDocument();
    expectNoPersonalDataLogged();
});

it('loads the product page without printing the current user record', async () => {
    await act(async () => { render(<MemoryRouter initialEntries={['/home']}><Home /></MemoryRouter>); });
    expect(screen.getByRole('heading', { name: 'Product inventory' })).toBeInTheDocument();
    expectNoPersonalDataLogged();
});

it('opens customer orders without printing the selected user record', async () => {
    render(<MemoryRouter initialEntries={['/user']}><User /></MemoryRouter>);
    await screen.findByText(account.userName);
    fireEvent.click(screen.getByRole('button', { name: 'View Orders' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expectNoPersonalDataLogged();
});
