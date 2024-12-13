import { Calendar as BigCalendar, type Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  status: string;
  meetingLink?: string;
}

interface CalendarEvent extends Event {
  title: string;
  start: Date;
  end: Date;
  resource?: Booking;
}

const localizer = {
  format: (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: enUS }),
  parse: (str: string, formatStr: string) =>
    parse(str, formatStr, new Date(), { locale: enUS }),
  startOfWeek: (date: Date) => startOfWeek(date, { locale: enUS }),
  getDay: (date: Date) => getDay(date),
  locales: {
    "en-US": enUS,
  },
};

export default function CalendarComponent() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isInterpreter = userRole === "interpreter";

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data } = await axios.get("/api/bookings");
      return data;
    },
  });

  const events: CalendarEvent[] = bookings.map((booking) => {
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    const start = new Date(booking.date);
    start.setHours(hours, minutes);

    const end = new Date(start);
    end.setHours(start.getHours() + booking.hours);

    return {
      title: `${booking.language.name} - ${
        isInterpreter
          ? booking.client.name
          : booking.interpreter?.name || "Unassigned"
      }`,
      start,
      end,
      resource: booking,
    };
  });

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource?._id) {
      navigate(`/bookings/${event.resource._id}`);
    }
  };

  return (
    <div className="h-[600px]">
      <BigCalendar
        localizer={localizer as any}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day"]}
      />
    </div>
  );
}
