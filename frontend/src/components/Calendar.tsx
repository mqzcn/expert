import { Calendar as BigCalendar } from "react-big-calendar/lib/Calendar";
import type { Event } from "react-big-calendar/lib/index";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { dateFnsLocalizer } from "react-big-calendar/lib/localizers/date-fns";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  isInterpreter?: boolean;
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
  status: string;
  meetingLink?: string;
}

interface CalendarEvent extends Event {
  title: string;
  start: Date;
  end: Date;
  resource?: Booking;
}

// Create the localizer
const locales = {
  "en-US": enUS,
};

// Create the localizer object manually
const localizer = {
  format: (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: enUS }),
  parse: (str: string, format: string) =>
    parse(str, format, new Date(), { locale: enUS }),
  startOfWeek: (date: Date) => startOfWeek(date, { locale: enUS }),
  getDay: (date: Date) => getDay(date),
  locales: {
    "en-US": enUS,
  },
};

export default function CalendarComponent({
  events = [],
  onEventClick,
  isInterpreter = false,
}: CalendarProps) {
  const navigate = useNavigate();

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else if (event.resource?._id) {
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
