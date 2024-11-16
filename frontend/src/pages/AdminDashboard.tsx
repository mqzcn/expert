import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import Calendar from "../components/Calendar";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "interpreter" | "admin";
  languages?: { _id: string; name: string; code: string }[];
  hourlyRate?: number;
}

interface Booking {
  _id: string;
  client: User;
  interpreter?: User;
  language: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  meetingLink?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedInterpreter, setSelectedInterpreter] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["adminBookings"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/bookings");
      return response.data;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/users");
      return response.data;
    },
  });

  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await axios.get("/api/languages");
      return response.data;
    },
  });

  const clients = users?.filter((user) => user.role === "client") || [];
  const interpreters =
    users?.filter((user) => user.role === "interpreter") || [];

  const filteredBookings = bookings?.filter((booking) => {
    const matchesClient = selectedClient
      ? booking.client._id === selectedClient
      : true;
    const matchesInterpreter = selectedInterpreter
      ? booking.interpreter?._id === selectedInterpreter
      : true;
    const matchesStatus = selectedStatus
      ? booking.status === selectedStatus
      : true;
    const matchesLanguage = selectedLanguage
      ? booking.language._id === selectedLanguage
      : true;
    const matchesDateRange =
      dateRange.start && dateRange.end
        ? new Date(booking.date) >= new Date(dateRange.start) &&
          new Date(booking.date) <= new Date(dateRange.end)
        : true;

    return (
      matchesClient &&
      matchesInterpreter &&
      matchesStatus &&
      matchesLanguage &&
      matchesDateRange
    );
  });

  const calendarEvents = filteredBookings?.map((booking) => {
    const bookingDate = new Date(booking.date);
    const [startHour] = booking.startTime.split(":");
    const [endHour] = booking.endTime.split(":");

    const start = new Date(bookingDate);
    start.setHours(parseInt(startHour), 0, 0);

    const end = new Date(bookingDate);
    end.setHours(parseInt(endHour), 0, 0);

    return {
      id: booking._id,
      title: `${booking.language.name} - ${booking.client.name}${
        booking.interpreter ? ` (${booking.interpreter.name})` : ""
      }`,
      start,
      end,
      status: booking.status,
      client: booking.client,
      interpreter: booking.interpreter,
      language: booking.language,
    };
  });

  // Calculate statistics
  const statistics = {
    totalBookings: filteredBookings?.length || 0,
    completedBookings:
      filteredBookings?.filter((b) => b.status === "completed").length || 0,
    pendingBookings:
      filteredBookings?.filter((b) => b.status === "pending").length || 0,
    activeInterpreters: new Set(
      filteredBookings
        ?.filter((b) => b.interpreter)
        .map((b) => b.interpreter?._id)
    ).size,
  };

  if (loadingBookings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-2xl font-bold">{statistics.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Completed Sessions</h3>
          <p className="text-2xl font-bold text-green-600">
            {statistics.completedBookings}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Bookings</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {statistics.pendingBookings}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Interpreters</h3>
          <p className="text-2xl font-bold text-blue-600">
            {statistics.activeInterpreters}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interpreter
            </label>
            <select
              value={selectedInterpreter}
              onChange={(e) => setSelectedInterpreter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Interpreters</option>
              {interpreters.map((interpreter) => (
                <option key={interpreter._id} value={interpreter._id}>
                  {interpreter.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Languages</option>
              {languages?.map((language: any) => (
                <option key={language._id} value={language._id}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="mb-8">
        <Calendar events={calendarEvents || []} />
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Booking Details
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interpreter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings?.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.interpreter?.name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.language.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
