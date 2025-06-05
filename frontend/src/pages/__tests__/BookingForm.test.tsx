import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom'; // Or MemoryRouter
import BookingForm from '../BookingForm'; // Adjust path as necessary
import axios from '../../lib/axios'; // Will use the mock
import { loadStripe } from '@stripe/stripe-js';

// Mock react-hot-toast
const mockToastLoading = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastDismiss = jest.fn();

jest.mock('react-hot-toast', () => ({
  toast: {
    loading: mockToastLoading,
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
    dismiss: mockToastDismiss,
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

    // Check for toasts
    await waitFor(() => {
      expect(mockToastLoading).toHaveBeenCalledWith("Processing booking...");
    });
    await waitFor(() => {
      expect(mockToastDismiss).toHaveBeenCalledWith(mockToastLoading()); // Assuming loading returns an ID
    });
    await waitFor(() => {
      expect(mockToastInfo).toHaveBeenCalledWith("Redirecting to secure payment...");
    });

    // Check that form was reset (example: one field)
    // This relies on the input being identifiable, e.g., by its initial value if it's controlled
    // or by checking if the form's reset function was called on the useForm mock if we were to mock it.
    // For now, we'll assume the reset logic inside the component works if called.
    // We can also check if a field is cleared if it's easily selectable and was filled.
    // Example: expect(screen.getByLabelText(/Language/i)).toHaveValue(''); // If reset clears it
  });

  test('handles backend returning no sessionId', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { bookingId: 'book_no_session_id', sessionId: null },
    });

    render(<BookingForm />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/Language/i), { target: { value: 'lang1' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-09-01' } });
    await screen.findByLabelText(/Start Time/i);
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /Book Appointment/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to initiate payment session. Your booking is not yet confirmed. Please try again or contact support.",
        { duration: 6000 }
      );
    });
    expect(mockRedirectToCheckout).not.toHaveBeenCalled();
    // Check form is NOT reset (e.g., language field still has value)
    expect(screen.getByLabelText(/Language/i)).toHaveValue('lang1');
  });

  test('handles loadStripe returning null (Stripe.js fails to load)', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ // Backend call is successful
      data: { sessionId: 'sess_load_stripe_fail', bookingId: 'book_load_stripe_fail' },
    });
    (loadStripe as jest.Mock).mockResolvedValue(null); // Stripe.js fails to load

    render(<BookingForm />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/Language/i), { target: { value: 'lang1' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-09-01' } });
    await screen.findByLabelText(/Start Time/i);
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /Book Appointment/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to initialize payment gateway. Please try again or contact support.",
        // The message in code is "Failed to initialize payment gateway..."
        // "Failed to load payment gateway..." is for when await stripePromise itself throws.
        // This case is when stripePromise resolves to null.
        { duration: 6000 }
      );
    });
    expect(mockRedirectToCheckout).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Language/i)).toHaveValue('lang1'); // Form not reset
  });

  test('handles redirectToCheckout itself returning an error', async () => {
    const mockStripeClientError = "Stripe client-side error during redirect";
    (axios.post as jest.Mock).mockResolvedValue({
      data: { sessionId: 'sess_redirect_error', bookingId: 'book_redirect_error' },
    });
    // loadStripe resolves, but redirectToCheckout fails
    (loadStripe as jest.Mock).mockResolvedValue({
      redirectToCheckout: jest.fn().mockResolvedValue({ error: { message: mockStripeClientError } }),
    });

    render(<BookingForm />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/Language/i), { target: { value: 'lang1' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-09-01' } });
    await screen.findByLabelText(/Start Time/i);
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /Book Appointment/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        mockStripeClientError,
        { duration: 10000 }
      );
    });
     // Form IS reset in this path, according to current logic
    expect(screen.getByLabelText(/Language/i)).toHaveValue('');
  });

  test('handles backend axios.post failure', async () => {
    const backendErrorMessage = "Network Error or Server Down";
    (axios.post as jest.Mock).mockRejectedValue({
      response: { data: { message: backendErrorMessage } },
    });

    render(<BookingForm />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/Language/i), { target: { value: 'lang1' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-09-01' } });
    await screen.findByLabelText(/Start Time/i);
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /Book Appointment/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        backendErrorMessage
      );
    });
    expect(mockRedirectToCheckout).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Language/i)).toHaveValue('lang1'); // Form not reset
  });


  // TODO: Add more test cases:
  // - Form validation errors (e.g., missing fields, invalid times) - these are client-side before mutation
  // - User is an interpreter (should show error and redirect) - This one is already present
  // - Date selection enabling time slots (more of a UI interaction test)
  // - End time validation (after start time, within 3 hours) - This is client-side before mutation

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
