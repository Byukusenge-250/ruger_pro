export type Role = "client" | "photographer" | "admin";
export type PhotographerStatus = "pending" | "approved" | "rejected" | "suspended";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Photographer {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  specialties: string[];
  price_from: number | null;
  avatar_url: string | null;
  cover_url: string | null;
  status: PhotographerStatus;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  photographer_id: string;
  client_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  photographer_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  session_date: string;
  session_type: string;
  location: string | null;
  message: string | null;
  status: BookingStatus;
  created_at: string;
}

export const SPECIALTIES = [
  "Wedding",
  "Portrait",
  "Editorial",
  "Events",
  "Family",
  "Newborn",
  "Fashion",
  "Product",
  "Architecture",
  "Landscape",
] as const;

export const CITIES = [
  "Kigali",
  "Musanze",
  "Rubavu",
  "Huye",
  "Muhanga",
  "Rwamagana",
  "Miyanze",
  "Nyanza",
  "Kibuye",
  "Rusizi",
] as const;
