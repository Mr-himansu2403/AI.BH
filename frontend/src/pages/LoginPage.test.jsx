import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

import { toast } from 'react-hot-toast';

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  };

  it('displays demo credentials', () => {
    renderComponent();
    expect(screen.getByText(/demo@aibh.com/i)).toBeInTheDocument();
    expect(screen.getByText(/demo1234/i)).toBeInTheDocument();
  });

  it('prevents submission with empty fields and shows toast error', async () => {
    renderComponent();
    
    // The inputs have 'required' attribute, but let's test custom validation if we can bypass it
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // In actual browser, HTML5 validation catches it. In JSDOM, it might call submit anyway.
    // If submit is called with empty fields:
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill in all fields');
    });
  });

  it('stays on page and shows error after failed login', async () => {
    mockLogin.mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
