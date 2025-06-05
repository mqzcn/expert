import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe.js with your publishable key
// Remember to replace this with your actual publishable key,
// ideally loaded from an environment variable e.g. VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

const bookingSchema = z.object({
  languageId: z.string().min(1, "Please select a language"),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface FormData {
  language: string;
  date: string;
  startTime: string;
  hours: number;
}

interface BackendBookingResponse {
  sessionId: string;
  bookingId: string;
}

interface Language {
  _id: string;
  name: string;
  code: string;
}

export default function BookingForm() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [formData, setFormData] = useState<FormData>({
    language: "",
    date: "",
    startTime: "",
    hours: 1,
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "interpreter") {
      toast.error("Interpreters cannot book appointments");
      navigate("/interpreter");
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedStartTime = watch("startTime");

  const { data: languages } = useQuery({
    queryKey: ["availableLanguages"],
    queryFn: async () => {
      const response = await axios.get("/api/languages/available");
      console.log("Languages API response:", response.data); // Debug log
      return Array.isArray(response.data) ? response.data : []; // Ensure it's an array
    },
  });

  const { data: bookedSlots } = useQuery({
    queryKey: ["bookedSlots", selectedDate],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/bookings/booked-slots?date=${selectedDate}`
      );
      return data;
    },
    enabled: !!selectedDate,
  });

  const generateTimeSlots = () => {
    const times: string[] = [];
    let hour = 9;

    while (hour < 17) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      times.push(timeString);
      hour++;
    }

    return times;
  };

  const [timeSlots, setTimeSlots] = useState<string[]>(generateTimeSlots());

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await axios.post<BackendBookingResponse>(
        "/api/bookings",
        data
      );
      return response.data;
    },
    onSuccess: async (data: BackendBookingResponse) => {
      const loadingToastId = toast.loading("Processing booking...");

      if (!data.sessionId) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Failed to initiate payment session. Your booking is not yet confirmed. Please try again or contact support.",
          { duration: 6000 }
        );
        // DO NOT RESET FORM HERE
        return;
      }

      let stripe;
      try {
        stripe = await stripePromise;
      } catch (stripeLoadError) {
        console.error("Stripe.js loading error:", stripeLoadError);
        toast.dismiss(loadingToastId);
        toast.error(
          "Failed to load payment gateway. Please check your connection or contact support.",
          { duration: 6000 }
        );
        // DO NOT RESET FORM HERE
        return;
      }

      if (!stripe) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Failed to initialize payment gateway. Please try again or contact support.",
          { duration: 6000 }
        );
        // DO NOT RESET FORM HERE
        return;
      }

      toast.dismiss(loadingToastId);
      toast("Redirecting to secure payment...");

      // Only reset form if we are attempting redirection
      reset();
      setSelectedDate("");

      const { error: stripeRedirectError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeRedirectError) {
        console.error("Stripe redirection error:", stripeRedirectError);
        // If redirection fails, the form has already been reset.
        // This toast informs the user about the failure.
        toast.error(
          stripeRedirectError.message ||
            "Could not redirect to payment. Your booking is pending payment. Please check previous messages or contact support if issues persist.",
          { duration: 10000 }
        );
        // At this point, the form is blank. User might need guidance.
        // e.g., show bookingId (data.bookingId) if available and important.
      }
      // No explicit success toast here as user is redirected (or error shown above).
    },
    onError: (error: any) => {
      // error is AxiosError<any>
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit booking. Payment was not initiated. Please try again."
      );
    },
  });

  const onSubmit = (data: BookingFormData) => {
    // Validate that end time is after start time
    const startHour = parseInt(data.startTime.split(":")[0]);
    const endHour = parseInt(data.endTime.split(":")[0]);

    if (endHour <= startHour) {
      toast.error("End time must be after start time");
      return;
    }

    // Validate that booking is not longer than 3 hours
    if (endHour - startHour > 3) {
      toast.error("Booking cannot be longer than 3 hours");
      return;
    }

    bookingMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (name === "language") {
      setSelectedLanguages([value]);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Book a Translation Service</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            {...register("languageId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a language</option>
            {languages?.map((lang: any) => (
              <option key={lang._id} value={lang._id}>
                {lang.name}
              </option>
            ))}
          </select>
          {errors.languageId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.languageId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            {...register("date")}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        {selectedDate && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <select
                {...register("startTime")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select start time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <select
                {...register("endTime")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!selectedStartTime}
              >
                <option value="">Select end time</option>
                {selectedStartTime &&
                  timeSlots
                    .filter((time) => {
                      const startHour = parseInt(
                        selectedStartTime.split(":")[0]
                      );
                      const currentHour = parseInt(time.split(":")[0]);
                      return (
                        currentHour > startHour && currentHour <= startHour + 3
                      );
                    })
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
              </select>
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Booking Guidelines
          </h3>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Bookings must be between 1 and 3 hours</li>
            <li>Available hours are from 9:00 AM to 5:00 PM</li>
            <li>End time must be after start time</li>
            <li>Bookings cannot overlap with existing appointments</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={bookingMutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {bookingMutation.isPending ? "Submitting..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}
