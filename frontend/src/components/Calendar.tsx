import { Calendar as BigCalendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { formatWithOptions } from "date-fns/fp";
import { enUS } from "date-fns/locale";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";

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
  return (
    <BigCalendar
      localizer={localizer as any} // temporary type assertion
      events={[]}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  );
}
