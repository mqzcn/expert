import { Calendar, Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface CalendarProps {
  events: BookingEvent[];
  onEventClick?: (event: BookingEvent) => void;
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

interface BookingEvent extends Event {
  title: string;
  start: Date;
  end: Date;
  resource?: Booking;
}

const locales = {
  "en-US": enUS,
};

// Create the localizer using dateFnsLocalizer
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Helper function to parse time string and add hours
function addHoursToTime(timeStr: string, hoursToAdd: number): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setTime(date.getTime() + hoursToAdd * 60 * 60 * 1000);
  return date;
}

// Helper function to format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function CalendarComponent({
  events = [],
  onEventClick,
  isInterpreter = false,
}: CalendarProps) {
  const navigate = useNavigate();

  const handleSelectEvent = (event: BookingEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else if (event.resource?._id) {
      navigate(`/bookings/${event.resource._id}`);
    }
  };

  // Format the events with proper end times
  const formattedEvents = events.map((event) => {
    if (event.resource) {
      const startDate = new Date(event.resource.date);
      const [startHours, startMinutes] = event.resource.startTime
        .split(":")
        .map(Number);
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setTime(
        endDate.getTime() + event.resource.hours * 60 * 60 * 1000
      );

      return {
        ...event,
        start: startDate,
        end: endDate,
        title: `${event.resource.client.name} - ${
          event.resource.language.name
        } (${formatTime(startDate)} - ${formatTime(endDate)})`,
      };
    }
    return event;
  });

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day"]}
      />
    </div>
  );
}
