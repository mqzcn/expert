import { Calendar as BigCalendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import enUS from "date-fns/locale/en-US";

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: "pending" | "accepted" | "completed" | "cancelled";
  client?: { name: string; email: string };
  interpreter?: { name: string; email: string };
  language: { name: string; code: string };
  meetingLink?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  isInterpreter?: boolean;
}

export default function Calendar({
  events,
  onEventClick,
  isInterpreter,
}: CalendarProps) {
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    switch (event.status) {
      case "pending":
        backgroundColor = "#FCD34D"; // yellow
        break;
      case "accepted":
        backgroundColor = "#34D399"; // green
        break;
      case "completed":
        backgroundColor = "#60A5FA"; // blue
        break;
      case "cancelled":
        backgroundColor = "#EF4444"; // red
        break;
      default:
        backgroundColor = "#6B7280"; // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  const formats = {
    eventTimeRangeFormat: () => "", // Hide the time range in month view
    timeGutterFormat: (date: Date) => format(date, "HH:mm"), // 24-hour format
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        formats={formats}
        onSelectEvent={(event: CalendarEvent) => onEventClick?.(event)}
        tooltipAccessor={(event: CalendarEvent) => `
          ${event.title}
          ${event.client ? `\nClient: ${event.client.name}` : ""}
          ${event.interpreter ? `\nInterpreter: ${event.interpreter.name}` : ""}
          ${event.language ? `\nLanguage: ${event.language.name}` : ""}
          \nStatus: ${
            event.status.charAt(0).toUpperCase() + event.status.slice(1)
          }
        `}
        views={["month", "week", "day"]}
      />
    </div>
  );
}
