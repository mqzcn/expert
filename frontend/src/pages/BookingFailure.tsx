import { Link } from "react-router-dom";

export default function BookingFailure() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Booking Failed
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Unfortunately, we were unable to process your payment at this time.
        </p>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Please try again or contact our support team if the issue persists.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/book" // Or the relevant page to retry payment
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Try Again
          </Link>
          <Link
            to="/help" // Or your contact/support page
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Contact Support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
