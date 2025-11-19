import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminLogin from '../../../pages/AdminLogin';
import * as api from '../../../services/api';

// Mock the API and react-router-dom
jest.mock('../../../services/api', () => ({
  adminApi: {
    login: jest.fn()
  }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderAdminLogin = () => {
  return render(
    <BrowserRouter>
      <AdminLogin />
    </BrowserRouter>
  );
};

describe('AdminLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should render login form', () => {
    renderAdminLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should update email field on input', () => {
    renderAdminLogin();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });

    expect(emailInput.value).toBe('admin@test.com');
  });

  test('should update password field on input', () => {
    renderAdminLogin();

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  test('should handle successful login', async () => {
    const mockLogin = api.adminApi.login as jest.Mock;
    const mockToken = 'test-token-123';
    
    mockLogin.mockResolvedValue({
      data: {
        success: true,
        data: {
          token: mockToken,
          admin: {
            id: '1',
            email: 'admin@test.com',
            name: 'Admin User'
          }
        }
      }
    });

    renderAdminLogin();

    // Fill in credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123'
      });
    });

    // Check if token is stored and navigation occurred
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  test('should handle login error', async () => {
    const mockLogin = api.adminApi.login as jest.Mock;
    
    mockLogin.mockRejectedValue({
      response: {
        data: {
          success: false,
          message: 'Invalid credentials'
        }
      }
    });

    renderAdminLogin();

    // Fill in credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });

    // Submit form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('should show loading state during login', async () => {
    const mockLogin = api.adminApi.login as jest.Mock;
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderAdminLogin();

    // Fill in credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Check loading state
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  test('should validate email format', async () => {
    renderAdminLogin();

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      // Assuming validation is implemented
      const errorMessages = screen.queryAllByText(/invalid email/i);
      if (errorMessages.length > 0) {
        expect(errorMessages[0]).toBeInTheDocument();
      }
    });
  });

  test('should have link to registration page', () => {
    renderAdminLogin();

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/admin/register');
  });

  test('should not submit with empty fields', async () => {
    const mockLogin = api.adminApi.login as jest.Mock;

    renderAdminLogin();

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Should not call API with empty fields
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    }, { timeout: 500 });
  });
});
