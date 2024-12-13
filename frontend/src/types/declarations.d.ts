// Add missing module declarations here
declare module "react-big-calendar" {
  import {
    Calendar,
    CalendarProps,
    Views,
    dateFnsLocalizer,
  } from "react-big-calendar";
  export default Calendar;
  export { CalendarProps, Views, dateFnsLocalizer };
}

declare module "react-big-calendar/lib/localizers/date-fns" {
  export const dateFnsLocalizer: any;
}

// Add other missing module declarations as needed
declare module "@heroicons/react/*";
declare module "@headlessui/react";
declare module "react-hot-toast";
// ... add any other modules that are causing errors
