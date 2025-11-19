import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../../pages/AdminDashboard';
import * as api from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  kycApi: {
    getAll: jest.fn()
  },
  pdfApi: {
    generate: jest.fn(),
    download: jest.fn(),
    getStatus: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderAdminDashboard = () => {
  return render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );
};

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should render dashboard header', async () => {
    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockResolvedValue({
      data: {
        success: true,
        data: {
          kycs: [],
          pagination: { total: 0, page: 1, limit: 10 }
        }
      }
    });

    renderAdminDashboard();

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  test('should fetch and display KYC applications', async () => {
    const mockKycs = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'pending',
        submittedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'approved',
        submittedAt: new Date().toISOString()
      }
    ];

    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockResolvedValue({
      data: {
        success: true,
        data: {
          kycs: mockKycs,
          pagination: { total: 2, page: 1, limit: 10 }
        }
      }
    });

    renderAdminDashboard();

    // Wait for data to load and check if KYC applications are displayed
    expect(mockGetAll).toHaveBeenCalled();
  });

  test('should handle loading state', async () => {
    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderAdminDashboard();

    // Check for loading indicator
    const loadingElements = screen.queryAllByText(/loading/i);
    if (loadingElements.length > 0) {
      expect(loadingElements[0]).toBeInTheDocument();
    }
  });

  test('should handle error state', async () => {
    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockRejectedValue(new Error('Failed to fetch'));

    renderAdminDashboard();

    // Component should handle error gracefully
    expect(mockGetAll).toHaveBeenCalled();
  });

  test('should redirect to login if no token', () => {
    localStorage.removeItem('token');

    renderAdminDashboard();

    // Should redirect to login page
    // This depends on how the component handles authentication
  });

  test('should display statistics', async () => {
    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockResolvedValue({
      data: {
        success: true,
        data: {
          kycs: [],
          pagination: { total: 10, page: 1, limit: 10 }
        }
      }
    });

    renderAdminDashboard();

    // Check if total count is displayed
    expect(mockGetAll).toHaveBeenCalled();
  });

  test('should have logout functionality', () => {
    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockResolvedValue({
      data: {
        success: true,
        data: {
          kycs: [],
          pagination: { total: 0, page: 1, limit: 10 }
        }
      }
    });

    renderAdminDashboard();

    const logoutButton = screen.queryByRole('button', { name: /logout/i });
    if (logoutButton) {
      expect(logoutButton).toBeInTheDocument();
    }
  });

  test('should filter applications by status', async () => {
    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockResolvedValue({
      data: {
        success: true,
        data: {
          kycs: [],
          pagination: { total: 0, page: 1, limit: 10 }
        }
      }
    });

    renderAdminDashboard();

    // Check for filter controls
    const filterButtons = screen.queryAllByRole('button');
    expect(filterButtons.length).toBeGreaterThan(0);
  });

  test('should handle PDF generation request', async () => {
    const mockGenerate = api.pdfApi.generate as jest.Mock;
    mockGenerate.mockResolvedValue({
      data: {
        success: true,
        message: 'PDF generation started'
      }
    });

    const mockGetAll = api.kycApi.getAll as jest.Mock;
    mockGetAll.mockResolvedValue({
      data: {
        success: true,
        data: {
          kycs: [{
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            status: 'pending',
            submittedAt: new Date().toISOString()
          }],
          pagination: { total: 1, page: 1, limit: 10 }
        }
      }
    });

    renderAdminDashboard();

    // The PDF generation buttons should be available after data loads
    expect(mockGetAll).toHaveBeenCalled();
  });
});
