import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import { ImportsPage } from './ImportsPage';
import { server } from '../test/setup';

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('ImportsPage', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v1/imports', () =>
        HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 }),
      ),
    );
  });

  it('renders the page and forms', async () => {
    renderWithQuery(<ImportsPage />);
    expect(await screen.findByText('Bulk Imports')).toBeInTheDocument();
    expect(screen.getByTestId('imports-module-select')).toBeInTheDocument();
    expect(screen.getByTestId('imports-file-input')).toBeInTheDocument();
    expect(screen.getByTestId('imports-download-template')).toBeDisabled();
    expect(screen.getByTestId('imports-upload-validate')).toBeDisabled();
  });

  it('shows error for file size > 10MB', async () => {
    renderWithQuery(<ImportsPage />);

    // Select module
    const select = screen.getByTestId('imports-module-select');
    fireEvent.change(select, { target: { value: 'spending-transactions' } });

    // Mock 11MB file
    const file = new File(['x'.repeat(11 * 1024 * 1024)], 'large.csv', { type: 'text/csv' });
    const fileInput = screen.getByTestId('imports-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click upload
    const uploadBtn = screen.getByTestId('imports-upload-validate');
    expect(uploadBtn).not.toBeDisabled();
    fireEvent.click(uploadBtn);

    expect(await screen.findByTestId('imports-upload-error')).toHaveTextContent(
      'File size exceeds the maximum limit of 10MB.',
    );
  });

  it('shows error for non-CSV file', async () => {
    renderWithQuery(<ImportsPage />);

    // Select module
    const select = screen.getByTestId('imports-module-select');
    fireEvent.change(select, { target: { value: 'spending-transactions' } });

    // Mock .txt file
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('imports-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click upload
    const uploadBtn = screen.getByTestId('imports-upload-validate');
    fireEvent.click(uploadBtn);

    expect(await screen.findByTestId('imports-upload-error')).toHaveTextContent(
      'Invalid file format. Please upload a CSV file.',
    );
  });

  it('successfully uploads valid file', async () => {
    let uploadedFile: File | null = null;
    let uploadedModule: string | null = null;

    server.use(
      http.post('*/v1/imports', async ({ request }) => {
        const formData = await request.formData();
        uploadedFile = formData.get('file') as File;
        uploadedModule = formData.get('module') as string;
        return HttpResponse.json({
          import_batch: {
            public_id: '99999999-9999-9999-9999-999999999999',
            status: 'validated',
            module: 'spending-transactions',
            total_rows: 5,
            valid_rows: 5,
            error_rows: 0,
            filename: 'test.csv',
          },
          errors: [],
        });
      }),
    );

    renderWithQuery(<ImportsPage />);

    // Select module
    const select = screen.getByTestId('imports-module-select');
    fireEvent.change(select, { target: { value: 'spending-transactions' } });

    // Mock file
    const file = new File(['col1,col2\nval1,val2'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByTestId('imports-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click upload
    const uploadBtn = screen.getByTestId('imports-upload-validate');
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(uploadedFile).not.toBeNull();
    });
    expect(uploadedModule).toBe('spending-transactions');
  });
});
