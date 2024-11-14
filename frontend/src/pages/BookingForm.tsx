import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const bookingSchema = z.object({
  languageId: z.string().min(1, "Please select a language"),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a time slot"),
  endTime: z.string().min(1, "Please select a time slot"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");

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
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const { data: languages } = useQuery({
    queryKey: ["availableLanguages"],
    queryFn: async () => {
      const response = await axios.get("/api/languages/available");
      return response.data;
    },
  });

  const { data: timeSlots } = useQuery({
    queryKey: ["timeSlots", selectedDate],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/bookings/available-slots?date=${selectedDate}`
      );
      return data;
    },
    enabled: !!selectedDate,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await axios.post("/api/bookings", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking submitted successfully!");
      reset();
      setSelectedDate("");
    },
    onError: (error: any) => {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit booking. Please try again."
      );
    },
  });

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [startTime, endTime] = e.target.value.split("-");
    setValue("startTime", startTime.trim());
    setValue("endTime", endTime.trim());
  };

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
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
            min={new Date().toISOString().split("T")[0]} // Prevent past dates
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time Slot
            </label>
            <select
              onChange={handleTimeSlotChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a time slot</option>
              {timeSlots?.map((slot: any) => (
                <option
                  key={slot.id}
                  value={`${slot.startTime}-${slot.endTime}`}
                >
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </select>
            {(errors.startTime || errors.endTime) && (
              <p className="mt-1 text-sm text-red-600">
                Please select a time slot
              </p>
            )}
          </div>
        )}

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
