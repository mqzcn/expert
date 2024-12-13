import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import MeetingLinkModal from "../components/MeetingLinkModal";
import Calendar from "../components/Calendar";
import { type Event as CalendarEvent } from "react-big-calendar/lib/index";

interface Language {
  _id: string;
  name: string;
  code: string;
}

interface InterpreterProfile {
  _id: string;
  name: string;
  email: string;
  languages: Language[];
}

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  hours: number;
  client: {
    name: string;
    email: string;
  };
  interpreter?: {
    name: string;
    email: string;
  };
  language: {
    name: string;
  };
  status: "pending" | "accepted" | "completed" | "cancelled";
  meetingLink?: string;
}

interface CalendarBookingEvent extends CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: Booking["status"];
  client: Booking["client"];
  language: Booking["language"];
  meetingLink?: string;
}

export default function InterpreterDashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  const { data: languages, isLoading: loadingLanguages } = useQuery<Language[]>(
    {
      queryKey: ["languages"],
      queryFn: async () => {
        const response = await axios.get("/api/languages");
        return response.data;
      },
    }
  );

  const { data: interpreterProfile, isLoading: loadingProfile } =
    useQuery<InterpreterProfile>({
      queryKey: ["interpreter-profile"],
      queryFn: async () => {
        const { data } = await axios.get("/api/interpreters/profile");
        return {
          ...data,
          languages: data.languages || [],
        };
      },
    });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<
    Booking[]
  >({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data } = await axios.get("/api/bookings");
      return data;
    },
  });

  const updateLanguagesMutation = useMutation({
    mutationFn: async (languageId: string) => {
      const currentLanguages =
        interpreterProfile?.languages.map((l) => l._id) || [];
      const updatedLanguages = [...currentLanguages, languageId];

      const response = await axios.patch("/api/interpreters/languages", {
        languages: updatedLanguages,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Language added successfully");
      setSelectedLanguage(""); // Reset selection
      queryClient.invalidateQueries({ queryKey: ["interpreterProfile"] });
    },
    onError: (error: any) => {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to add language");
    },
  });

  const removeLanguageMutation = useMutation({
    mutationFn: async (languageId: string) => {
      const updatedLanguages =
        interpreterProfile?.languages
          .filter((l) => l._id !== languageId)
          .map((l) => l._id) || [];

      const response = await axios.patch("/api/interpreters/languages", {
        languages: updatedLanguages,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Language removed successfully");
      queryClient.invalidateQueries({ queryKey: ["interpreterProfile"] });
    },
    onError: (error: any) => {
      toast.error("Failed to remove language");
    },
  });

  const acceptBookingMutation = useMutation({
    mutationFn: async ({
      bookingId,
      meetingLink,
    }: {
      bookingId: string;
      meetingLink: string;
    }) => {
      const response = await axios.patch(`/api/bookings/${bookingId}`, {
        status: "accepted",
        meetingLink,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to accept booking");
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }) => {
      const response = await axios.patch(`/api/bookings/${bookingId}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update booking status"
      );
    },
  });

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLanguage) {
      updateLanguagesMutation.mutate(selectedLanguage);
    }
  };

  const handleRemoveLanguage = (languageId: string) => {
    removeLanguageMutation.mutate(languageId);
  };

  const handleAcceptBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleMeetingLinkSubmit = (meetingLink: string) => {
    if (selectedBookingId) {
      acceptBookingMutation.mutate({
        bookingId: selectedBookingId,
        meetingLink,
      });
    }
    setSelectedBookingId(null);
  };

  const handleCompleteBooking = (bookingId: string) => {
    updateBookingStatusMutation.mutate({ bookingId, status: "completed" });
  };

  // Filter out already selected languages from the dropdown
  const availableLanguages =
    languages?.filter(
      (lang) => !interpreterProfile?.languages?.some((l) => l._id === lang._id)
    ) || [];

  const calendarEvents: CalendarBookingEvent[] = (bookings || []).map(
    (booking) => ({
      id: booking._id,
      title: `${booking.language.name} - ${booking.client.name}`,
      start: new Date(booking.date + "T" + booking.startTime),
      end: new Date(
        new Date(booking.date + "T" + booking.startTime).getTime() +
          booking.hours * 60 * 60 * 1000
      ),
      status: booking.status,
      client: booking.client,
      language: booking.language,
      meetingLink: booking.meetingLink,
    })
  );

  const handleEventClick = (event: any) => {
    if (event.status === "pending") {
      handleAcceptBooking(event.id);
    }
  };

  // Helper function to calculate end time
  const getEndTime = (booking: Booking) => {
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    const endHours = hours + booking.hours;
    return `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  if (loadingLanguages || loadingProfile || loadingBookings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Interpreter Dashboard</h1>

      {/* Calendar Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Schedule</h2>
        <Calendar
          events={calendarEvents}
          onEventClick={handleEventClick}
          isInterpreter={true}
        />
      </div>

      {/* Upcoming Bookings Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
        <div className="space-y-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-gray-900">{booking.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Language
                    </p>
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
                      {booking.startTime} - {getEndTime(booking)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Status
                        </p>
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
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleAcceptBooking(booking._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Accept Booking
                        </button>
                      )}
                      {booking.status === "accepted" && (
                        <button
                          onClick={() => handleCompleteBooking(booking._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
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
            ))
          ) : (
            <p className="text-gray-500">No upcoming bookings</p>
          )}
        </div>
      </div>

      {/* Language Management Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Language</h2>
        <form onSubmit={handleAddLanguage} className="space-y-4">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Select Language
            </label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a language</option>
              {availableLanguages.map((language) => (
                <option key={language._id} value={language._id}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selectedLanguage || updateLanguagesMutation.isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {updateLanguagesMutation.isPending ? "Adding..." : "Add Language"}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">My Languages</h2>
        <div className="space-y-2">
          {(interpreterProfile?.languages?.length ?? 0) > 0 ? (
            <div className="grid gap-4">
              {interpreterProfile?.languages?.map((lang) => (
                <div
                  key={lang._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span>{lang.name}</span>
                  <button
                    onClick={() => handleRemoveLanguage(lang._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No languages selected yet</p>
          )}
        </div>
      </div>

      <MeetingLinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBookingId(null);
        }}
        onSubmit={handleMeetingLinkSubmit}
      />
    </div>
  );
}
