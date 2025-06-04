import request from 'supertest';
import express from 'express';
import bookingRoutes from '../bookings'; // Adjust path as necessary
import * as bookingController from '../../controllers/bookings'; // To mock controller functions
import * as authMiddleware from '../../middleware/auth'; // To mock middleware

// Mock Stripe SDK
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

// Mock Booking model
jest.mock('../../models/Booking.js', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  // Add other methods if needed by the controller during these tests
}));


const app = express();
app.use(express.json());

// Mock auth middleware
authMiddleware.protect = jest.fn((req, res, next) => {
  req.user = { _id: 'mockUserId', role: 'client' }; // Mock user
  next();
});
app.use('/api/bookings', bookingRoutes);


describe('Booking Routes - POST /api/bookings (with Checkout Session)', () => {
  let mockStripeInstance;
  let BookingModelMock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Re-import Stripe and Booking model to get fresh mocks for each test if needed
    // Or access them via the jest.mocked helpers
    const Stripe = jest.requireMock('stripe');
    mockStripeInstance = new Stripe();

    BookingModelMock = jest.requireMock('../../models/Booking.js');

  });

  test('should create a booking and a Stripe checkout session successfully', async () => {
    const mockBookingData = {
      languageId: 'lang_test_id',
      date: '2024-08-15',
      startTime: '10:00',
      endTime: '11:00',
    };

    const mockCreatedBooking = {
      ...mockBookingData,
      _id: 'booking_test_id',
      client: 'mockUserId',
      paymentStatus: 'pending',
      stripeSessionId: null,
      save: jest.fn().mockResolvedValue(true),
    };
    BookingModelMock.create.mockResolvedValue(mockCreatedBooking);

    const mockStripeSession = {
      id: 'sess_test_id',
      url: 'https://stripe.com/checkout/sess_test_id',
    };
    mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockStripeSession);

    // The actual controller `createBooking` is complex.
    // For this unit/integration test of the route, we are effectively testing
    // that the route calls the controller and the controller behaves as expected.
    // The controller itself would have more detailed unit tests.

    const response = await request(app)
      .post('/api/bookings')
      .send(mockBookingData)
      .set('Authorization', 'Bearer mocktoken'); // Assuming protect middleware is used

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('sessionId', mockStripeSession.id);
    expect(response.body).toHaveProperty('bookingId', mockCreatedBooking._id);

    expect(BookingModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockBookingData,
        client: 'mockUserId',
        paymentStatus: 'pending',
      })
    );
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: mockCreatedBooking._id.toString(),
        metadata: { bookingId: mockCreatedBooking._id.toString() },
        // Add more assertions for line_items, success_url, cancel_url if needed
      })
    );
    expect(mockCreatedBooking.save).toHaveBeenCalledTimes(1); // Called to save stripeSessionId
  });

  test('should handle Stripe API error during session creation', async () => {
    const mockBookingData = {
      languageId: 'lang_test_id',
      date: '2024-08-15',
      startTime: '10:00',
      endTime: '11:00',
    };

    const mockCreatedBooking = {
      ...mockBookingData,
      _id: 'booking_test_id_fail',
      client: 'mockUserId',
      paymentStatus: 'pending',
      stripeSessionId: null,
      save: jest.fn().mockResolvedValue(true), // Mock save for updating to 'failed'
    };
    BookingModelMock.create.mockResolvedValue(mockCreatedBooking); // Booking creation succeeds initially

    mockStripeInstance.checkout.sessions.create.mockRejectedValue(new Error('Stripe API Error'));

    const response = await request(app)
      .post('/api/bookings')
      .send(mockBookingData)
      .set('Authorization', 'Bearer mocktoken');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to create payment session');

    expect(BookingModelMock.create).toHaveBeenCalledTimes(1);
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledTimes(1);
    // Check if booking paymentStatus was updated to 'failed'
    expect(mockCreatedBooking.paymentStatus).toBe('failed');
    expect(mockCreatedBooking.save).toHaveBeenCalledTimes(1); // Called to save paymentStatus='failed'
  });

  // Add more tests:
  // - Invalid input data (validation errors)
  // - Database error during Booking.create
  // - etc.
});
