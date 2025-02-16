export interface User {
  _id: string;
  email: string;
  name: string;
  role: "client" | "interpreter" | "admin";
  isActive: boolean;
  hourlyRate?: number;
}
