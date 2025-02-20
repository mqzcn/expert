import React from "react";
import { Calendar as BigCalendar, Event } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DateLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

interface CalendarProps {
  events: BookingEvent[];
  onEventClick?: (event: BookingEvent) => void;
}

interface BookingEvent extends Event {
  title: string;
  start: Date;
  end: Date;
  resource?: {
    _id: string;
    date: string;
    startTime: string;
    hours: number;
    client: {
      name: string;
    };
    language: {
      name: string;
    };
  };
}

// Set up the DateLocalizer
const localizer = new DateLocalizer({
  format: (date, formatString) => format(date, formatString, { locale: enUS }),
  parse: (dateString, formatString) =>
    parse(dateString, formatString, new Date(), { locale: enUS }),
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay: (date) => getDay(date),
  firstOfWeek: () => 0, // Sunday = 0, Monday = 1
  locales: {
    "en-US": enUS,
  },
});

// Calendar component definition
const Calendar: React.FC<CalendarProps> = ({ events = [], onEventClick }) => {
  // Format the events with proper start and end times
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
        } (${startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${endDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })})`,
      };
    }
    return event;
  });

  const handleSelectEvent = (event: BookingEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="h-[600px]">
      <BigCalendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day"]}
        style={{ height: "100%" }} // Optional: Set height for better display
      />
    </div>
  );
};

export default Calendar;
