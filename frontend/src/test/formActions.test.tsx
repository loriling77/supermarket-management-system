import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CategoryForm from '../components/categoryForm';
import ManufactureForm from '../components/manufactureForm';

afterEach(cleanup);

const category = { id: 1, categoryName: 'Dairy', detail: 'Fresh products' };
const manufacturer = { id: 1, manufactureName: 'Farm', productionLiscenseNumber: 'LIC-1', placeOfOrigin: 'UK' };

for (const kind of ['category', 'manufacturer'] as const) {
    const renderForm = (save = vi.fn().mockResolvedValue(undefined)) => kind === 'category'
        ? render(<CategoryForm selectCategory={category} onAddCategory={vi.fn()} onSaveCategory={save} />)
        : render(<ManufactureForm selectManufacture={manufacturer} onAddManufacture={vi.fn()} onSaveManufacture={save} />);
    const fields = kind === 'category'
        ? [['Category Name', 'Dairy'], ['Detail', 'Fresh products']]
        : [['Manufacturer', 'Farm'], ['Production License Number', 'LIC-1'], ['Place of Origin', 'UK']];

    it(`${kind}: highlights Save and mutes Add only while selected data has edits`, () => {
        renderForm();
        const save = screen.getByRole('button', { name: 'Save' });
        const add = screen.getByRole('button', { name: 'Add' });
        expect(save).not.toHaveClass('Save-btn--pending');
        for (const [label, original] of fields) {
            fireEvent.change(screen.getByLabelText(label), { target: { value: `${original} updated` } });
            expect(save).toHaveClass('Save-btn--pending');
            expect(add).toHaveClass('Add-btn--muted');
            fireEvent.change(screen.getByLabelText(label), { target: { value: original } });
            expect(save).not.toHaveClass('Save-btn--pending');
            expect(add).not.toHaveClass('Add-btn--muted');
        }
    });

    it(`${kind}: clears pending styles when saved data is supplied back to the form`, () => {
        const view = renderForm();
        const [label, original] = fields[0];
        fireEvent.change(screen.getByLabelText(label), { target: { value: `${original} updated` } });
        if (kind === 'category') {
            view.rerender(<CategoryForm selectCategory={{ ...category, categoryName: 'Dairy updated' }} onAddCategory={vi.fn()} onSaveCategory={vi.fn()} />);
        } else {
            view.rerender(<ManufactureForm selectManufacture={{ ...manufacturer, manufactureName: 'Farm updated' }} onAddManufacture={vi.fn()} onSaveManufacture={vi.fn()} />);
        }
        expect(screen.getByRole('button', { name: 'Save' })).not.toHaveClass('Save-btn--pending');
        expect(screen.getByRole('button', { name: 'Add' })).not.toHaveClass('Add-btn--muted');
    });
}
