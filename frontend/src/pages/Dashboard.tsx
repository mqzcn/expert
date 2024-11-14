import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

export default function Dashboard() {
  const userRole = localStorage.getItem('userRole');

  const { data: bookings } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/bookings/user');
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">My Bookings</h2>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {bookings?.map((booking: any) => (
              <li key={booking._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600">
                      {booking.language.name} Translation
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className="capitalize">{booking.status}</span>
                    </p>
                    {booking.meetingLink && (
                      <p className="text-sm text-gray-500">
                        Meeting Link:{' '}
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          Join Meeting
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    {booking.interpreter && (
                      <p className="text-sm text-gray-500">
                        Interpreter: {booking.interpreter.name}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {(!bookings || bookings.length === 0) && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No bookings found
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}