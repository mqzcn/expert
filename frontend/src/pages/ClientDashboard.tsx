import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import Calendar from "../components/Calendar";

interface Booking {
  _id: string;
  language: {
    name: string;
    code: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  interpreter?: {
    name: string;
    email: string;
  };
  meetingLink?: string;
}

export default function ClientDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["userBookings"],
    queryFn: async () => {
      const response = await axios.get("/api/bookings/user");
      return response.data;
    },
  });

  const bookings: Booking[] = Array.isArray(data) ? data : [];

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await axios.patch(`/api/bookings/${bookingId}/status`, {
        status: "cancelled",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    },
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const calendarEvents =
    bookings?.map((booking) => {
      const bookingDate = new Date(booking.date);
      const [startHour] = booking.startTime.split(":");
      const [endHour] = booking.endTime.split(":");

      const start = new Date(bookingDate);
      start.setHours(parseInt(startHour), 0, 0);

      const end = new Date(bookingDate);
      end.setHours(parseInt(endHour), 0, 0);

      return {
        id: booking._id,
        title: `${booking.language.name} Translation`,
        start,
        end,
        status: booking.status,
        interpreter: booking.interpreter,
        language: booking.language,
        meetingLink: booking.meetingLink,
      };
    }) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div className="mb-8">
        <Calendar events={calendarEvents} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        <div className="space-y-4">
          {bookings?.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Language</p>
                  <p className="text-gray-900">{booking.language.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-900">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-gray-900">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <div className="col-span-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p
                      className={`text-gray-900 ${
                        booking.status === "pending"
                          ? "text-yellow-600"
                          : booking.status === "accepted"
                          ? "text-green-600"
                          : booking.status === "completed"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </p>
                  </div>
                  {(booking.status === "pending" ||
                    booking.status === "accepted") && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
                {booking.meetingLink && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">
                      Meeting Link
                    </p>
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
