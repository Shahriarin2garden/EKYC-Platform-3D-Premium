import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import KycForm from '../../../pages/KycForm';
import * as api from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  kycApi: {
    submit: jest.fn()
  }
}));

const renderKycForm = () => {
  return render(
    <BrowserRouter>
      <KycForm />
    </BrowserRouter>
  );
};

describe('KycForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should render all form fields', () => {
    renderKycForm();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/national id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/occupation/i)).toBeInTheDocument();
  });

  test('should display form header', () => {
    renderKycForm();

    expect(screen.getByText(/KYC Application/i)).toBeInTheDocument();
  });

  test('should show submit button', () => {
    renderKycForm();

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('should update form fields on input', () => {
    renderKycForm();

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput.value).toBe('John Doe');
  });

  test('should validate email format', async () => {
    renderKycForm();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  test('should validate name length', async () => {
    renderKycForm();

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  test('should submit form with valid data', async () => {
    const mockSubmit = api.kycApi.submit as jest.Mock;
    mockSubmit.mockResolvedValue({
      data: {
        success: true,
        message: 'KYC application submitted successfully',
        data: { id: '123' }
      }
    });

    renderKycForm();

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/address/i), { 
      target: { value: '123 Main St' } 
    });
    fireEvent.change(screen.getByLabelText(/national id/i), { 
      target: { value: '1234567890' } 
    });
    fireEvent.change(screen.getByLabelText(/occupation/i), { 
      target: { value: 'Engineer' } 
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('should display loading state during submission', async () => {
    const mockSubmit = api.kycApi.submit as jest.Mock;
    mockSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderKycForm();

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  test('should handle submission error', async () => {
    const mockSubmit = api.kycApi.submit as jest.Mock;
    mockSubmit.mockRejectedValue({
      response: {
        data: {
          success: false,
          message: 'Submission failed'
        }
      }
    });

    renderKycForm();

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'john@example.com' } 
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  test('should save draft to localStorage', async () => {
    renderKycForm();

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    // Wait for debounced save
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('should load draft from localStorage on mount', () => {
    const draftData = JSON.stringify({
      name: 'Saved Name',
      email: 'saved@example.com'
    });

    (localStorage.getItem as jest.Mock).mockReturnValue(draftData);

    renderKycForm();

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Saved Name');
  });

  test('should show security badge', () => {
    renderKycForm();

    expect(screen.getByText(/secure/i)).toBeInTheDocument();
  });

  test('should clear form after successful submission', async () => {
    const mockSubmit = api.kycApi.submit as jest.Mock;
    mockSubmit.mockResolvedValue({
      data: {
        success: true,
        message: 'Success'
      }
    });

    renderKycForm();

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });
});
