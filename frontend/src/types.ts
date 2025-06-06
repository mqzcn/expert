export interface User {
  _id: string;
  email: string;
  name: string;
  role: "client" | "interpreter" | "admin";
  isActive: boolean;
  hourlyRate?: number;
}

export interface Language {
  _id: string;
  name: string;
  code: string;
}

export interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    client: { name: string };
    language: { name: string };
  };
}
