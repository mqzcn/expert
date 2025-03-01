import React from "react";
import { Calendar as BigCalendar } from "react-big-calendar";
import { dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import type { BookingEvent } from "../types";

interface CalendarProps {
  events: BookingEvent[];
  onEventClick?: (event: BookingEvent) => void;
  isInterpreter?: boolean;
}

// Set up the DateLocalizer using date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { enUS },
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
        id: event.id,
        title: `${event.resource.client.name} - ${
          event.resource.language.name
        } (${startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${endDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })})`,
        start: startDate,
        end: endDate,
        resource: event.resource,
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
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default Calendar;
