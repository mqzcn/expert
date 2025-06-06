import React from "react";
import { Calendar as BigCalendar } from "react-big-calendar/lib";
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
  const calendarFormats = {
    dateFormat: "dd/MM", // Date display in month view cells, e.g., "25/12"
    dayFormat: (date: Date, culture: string | undefined, localizer: any) =>
      localizer.format(date, "dd/MM/yyyy", culture), // Day header in week/day view
    weekdayFormat: (date: Date, culture: string | undefined, localizer: any) =>
      localizer.format(date, "EEE", culture), // Weekday header format e.g. "Mon"

    timeGutterFormat: (
      date: Date,
      culture: string | undefined,
      localizer: any
    ) => localizer.format(date, "HH:mm", culture), // Time gutter format e.g. "09:00"

    monthHeaderFormat: (
      date: Date,
      culture: string | undefined,
      localizer: any
    ) => localizer.format(date, "MMMM yyyy", culture),

    dayRangeHeaderFormat: (
      { start, end }: { start: Date; end: Date },
      culture: string | undefined,
      localizer: any
    ) =>
      localizer.format(start, "dd/MM", culture) +
      " – " +
      localizer.format(end, "dd/MM", culture),

    agendaDateFormat: (
      date: Date,
      culture: string | undefined,
      localizer: any
    ) => localizer.format(date, "EEE dd/MM/yyyy", culture),
  };

  // Format the events with proper start and end times
  const formattedEvents = events.map((event) => {
    if (event.resource) {
      // Ensure event.resource.date and startTime/endTime are valid
      const startDate = new Date(
        `${event.resource.date}T${event.resource.startTime}`
      );
      const endDate = new Date(
        `${event.resource.date}T${event.resource.endTime}`
      );

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn("Invalid date/time for event:", event);
        // Return a version of the event that won't break, or skip it
        return {
          ...event,
          title: event.title || "Invalid Event Data",
          start: new Date(), // fallback
          end: new Date(), // fallback
        };
      }

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
        views={["month", "week", "day", "agenda"]} // Added agenda view
        style={{ height: "100%" }}
        formats={calendarFormats} // Add this line
      />
    </div>
  );
};

export default Calendar;
