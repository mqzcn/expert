import { Calendar as BigCalendar } from "react-big-calendar/lib/Calendar";
import type { Event } from "react-big-calendar/lib/index";
import { dateFnsLocalizer } from "react-big-calendar/lib/localizers/date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day"]}
      />
    </div>
  );
}
