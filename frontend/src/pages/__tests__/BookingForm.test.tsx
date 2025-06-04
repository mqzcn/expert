import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom'; // Or MemoryRouter
import BookingForm from '../BookingForm'; // Adjust path as necessary
import axios from '../../lib/axios'; // Will use the mock
import { loadStripe } from '@stripe/stripe-js';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock @stripe/stripe-js
const mockRedirectToCheckout = jest.fn();
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    redirectToCheckout: mockRedirectToCheckout,
  }),
}));


// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <Router>{children}</Router>
  </QueryClientProvider>
);


describe('BookingForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'client'); // Assume client role

    // Default mock for languages API
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url === '/api/languages/available') {
        return Promise.resolve({ data: [{ _id: 'lang1', name: 'Language 1' }] });
      }
      if (url.startsWith('/api/bookings/booked-slots')) {
        return Promise.resolve({ data: [] }); // No booked slots by default
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('successful booking submission and redirection to Stripe', async () => {
    // Mock axios.post for booking creation
    const mockSessionId = 'sess_test_12345';
    const mockBookingId = 'book_test_67890';
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: mockSessionId, bookingId: mockBookingId },
    });

    render(<BookingForm />, { wrapper: Wrapper });

    // Simulate form filling
    fireEvent.change(screen.getByLabelText(/Language/i), { target: { value: 'lang1' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-09-01' } });

    // Wait for dependent UI to appear (start/end times)
    await screen.findByLabelText(/Start Time/i);

    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Book Appointment/i }));

    // Assertions
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/bookings',
        expect.objectContaining({
          languageId: 'lang1',
          date: '2024-09-01',
          startTime: '10:00',
          endTime: '11:00',
        })
      );
    });

    await waitFor(() => {
      expect(loadStripe).toHaveBeenCalledWith('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
    });

    await waitFor(() => {
      expect(mockRedirectToCheckout).toHaveBeenCalledWith({ sessionId: mockSessionId });
    });

    // Check for redirection toast
    await waitFor(() => {
        expect(jest.requireMock('react-hot-toast').toast.success).toHaveBeenCalledWith(
            "Booking details captured! Redirecting to payment..."
        );
    });
  });

  // TODO: Add more test cases:
  // - Form validation errors (e.g., missing fields, invalid times)
  // - API error during booking creation (axios.post rejects)
  // - Stripe.js failing to load or redirectToCheckout error
  // - User is an interpreter (should show error and redirect)
  // - Date selection enabling time slots
  // - End time validation (after start time, within 3 hours)

  test('interpreter role should prevent booking and redirect', async () => {
    Storage.prototype.getItem = jest.fn(() => 'interpreter'); // Set role to interpreter

    render(<BookingForm />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(jest.requireMock('react-hot-toast').toast.error).toHaveBeenCalledWith(
        "Interpreters cannot book appointments"
      );
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/interpreter');
    });
  });

});
