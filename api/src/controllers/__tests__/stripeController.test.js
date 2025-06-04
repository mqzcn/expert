import { handleStripeWebhook } from '../stripeController';
import Booking from '../../models/Booking';
import User from '../../models/User';
import { sendBookingNotification } from '../../utils/email';
import Stripe from 'stripe';

// Mock dependencies
jest.mock('stripe');
jest.mock('../../models/Booking');
jest.mock('../../models/User');
jest.mock('../../utils/email');

describe('Stripe Controller - handleStripeWebhook', () => {
  let mockReq;
  let mockRes;
  let mockStripe;

  const mockEndpointSecret = 'whsec_test_secret';
  process.env.STRIPE_WEBHOOK_SECRET = mockEndpointSecret; // Set for the test environment

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {
        'stripe-signature': 'test_signature',
      },
      body: Buffer.from(JSON.stringify({ type: 'test_event' }), 'utf8'), // Raw body as Buffer
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup mock Stripe instance and its methods
    mockStripe = new Stripe(); // Get the mocked instance
    Stripe.mockImplementation(() => mockStripe); // Ensure new Stripe() returns the CJS mock if it's different

    // Default mock for constructEvent, can be overridden in tests
    mockStripe.webhooks = {
        constructEvent: jest.fn(),
    };
  });

  test('should handle checkout.session.completed successfully', async () => {
    const mockBookingId = 'booking_123';
    const mockSession = {
      id: 'cs_test_123',
      metadata: { bookingId: mockBookingId },
      client_reference_id: mockBookingId,
      // other session properties if needed
    };
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockBooking = {
      _id: mockBookingId,
      paymentStatus: 'pending',
      language: { _id: 'lang_123', name: 'Test Language' }, // For populated booking
      client: { _id: 'client_123', name: 'Test Client' }, // For populated booking
      save: jest.fn().mockResolvedValue(true),
    };
    Booking.findById.mockResolvedValue(mockBooking); // Initial findById

    // Mock for populated booking used in notification
    const populatedMockBooking = { ...mockBooking };
    Booking.findById.mockImplementationOnce(() => ({ // For initial find
        ...mockBooking,
        populate: jest.fn().mockImplementation(function() { // .populate().populate()
            if (this.populated('client')) return Promise.resolve(populatedMockBooking); // after client is populated
            return this; // return this for chaining
        }),
    }));


    User.find.mockResolvedValue([{ _id: 'interpreter_123' }]); // Mock interpreters

    await handleStripeWebhook(mockReq, mockRes);

    expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
      mockReq.body,
      mockReq.headers['stripe-signature'],
      mockEndpointSecret
    );
    expect(Booking.findById).toHaveBeenCalledWith(mockBookingId);
    expect(mockBooking.paymentStatus).toBe('paid');
    expect(mockBooking.save).toHaveBeenCalledTimes(1);
    expect(sendBookingNotification).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  test('should return 400 if signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Signature verification failed');
    });

    await handleStripeWebhook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Webhook Error: Signature verification failed'));
  });

  test('should handle booking not found for checkout.session.completed', async () => {
    const mockBookingId = 'booking_not_found_123';
     const mockSession = {
      id: 'cs_test_456',
      metadata: { bookingId: mockBookingId },
      client_reference_id: mockBookingId,
    };
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
    Booking.findById.mockResolvedValue(null); // Booking not found

    await handleStripeWebhook(mockReq, mockRes);

    expect(Booking.findById).toHaveBeenCalledWith(mockBookingId);
    expect(mockRes.status).toHaveBeenCalledWith(200); // Still 200 to Stripe
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ received: true })); // Acknowledge receipt
    // console.error would have been called, can be spied on if needed
  });

  test('should skip update if booking paymentStatus is not pending', async () => {
    const mockBookingId = 'booking_already_paid_123';
    const mockSession = {
      id: 'cs_test_789',
      metadata: { bookingId: mockBookingId },
      client_reference_id: mockBookingId,
    };
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: mockSession,
      },
    };
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockBooking = {
      _id: mockBookingId,
      paymentStatus: 'paid', // Already paid
      save: jest.fn(),
    };
    Booking.findById.mockResolvedValue(mockBooking);

    await handleStripeWebhook(mockReq, mockRes);

    expect(Booking.findById).toHaveBeenCalledWith(mockBookingId);
    expect(mockBooking.save).not.toHaveBeenCalled();
    expect(sendBookingNotification).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  // Add more tests:
  // - Different event types (e.g., payment_intent.payment_failed)
  // - Errors during booking.save()
  // - No interpreters found for notification
});
