import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NavBar from '../components/navBar';

afterEach(() => vi.unstubAllGlobals());

function renderAdmin() {
    render(<MemoryRouter initialEntries={['/home']}><Routes>
        <Route path="/home" element={<><h1>Admin area</h1><NavBar /></>} />
        <Route path="/login" element={<h1>Sign in</h1>} />
    </Routes></MemoryRouter>);
}

it('ends the server session before navigating away from the admin area', async () => {
    let finish!: (response: Response) => void;
    const fetch = vi.fn(() => new Promise<Response>(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', fetch);
    renderAdmin();
    fireEvent.click(screen.getByText('Logout'));
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST', credentials: 'include' });
    expect(screen.getByRole('heading', { name: 'Admin area' })).toBeInTheDocument();
    finish(new Response(null, { status: 200 }));
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
});

it('shows a failed logout instead of pretending the session ended', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unable to end session.', { status: 500 })));
    renderAdmin();
    fireEvent.click(screen.getByText('Logout'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to end session.');
    expect(screen.getByRole('heading', { name: 'Admin area' })).toBeInTheDocument();
});

it('allows an already expired session to return to sign in', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    renderAdmin();
    fireEvent.click(screen.getByText('Logout'));
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
});
