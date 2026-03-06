import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("saferide_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterPayload {
  parentName: string;
  email: string;
  phone: string;
  password: string;
  childName: string;
  schoolName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateRidePayload {
  pickupLocation: string;
  destination: string;
  date: string;
  time: string;
  seats: number;
  vehicleDetails: string;
}

export interface SearchRideParams {
  pickupLocation: string;
  schoolName: string;
  date: string;
}

export interface Ride {
  id: string;
  driverName: string;
  pickupLocation: string;
  destination: string;
  date: string;
  time: string;
  availableSeats: number;
  vehicleDetails: string;
}

export interface TrackingInfo {
  rideId: string;
  status: "scheduled" | "in_progress" | "completed";
  driverName: string;
  estimatedArrival: string;
  currentLocation?: { lat: number; lng: number };
}

// --- Mock data for demo ---
const mockRides: Ride[] = [
  { id: "1", driverName: "Sarah Johnson", pickupLocation: "Oak Street", destination: "Lincoln Elementary", date: "2026-03-10", time: "07:30", availableSeats: 3, vehicleDetails: "White Honda Odyssey" },
  { id: "2", driverName: "Michael Chen", pickupLocation: "Maple Ave", destination: "Lincoln Elementary", date: "2026-03-10", time: "07:45", availableSeats: 2, vehicleDetails: "Blue Toyota Sienna" },
  { id: "3", driverName: "Priya Patel", pickupLocation: "Pine Road", destination: "Westview Academy", date: "2026-03-11", time: "08:00", availableSeats: 4, vehicleDetails: "Silver Chrysler Pacifica" },
];

const mockTracking: TrackingInfo = {
  rideId: "1",
  status: "in_progress",
  driverName: "Sarah Johnson",
  estimatedArrival: "7 minutes",
};

// --- API functions (fall back to mock data) ---

export const registerUser = async (data: RegisterPayload) => {
  try {
    const res = await API.post("/register", data);
    return res.data;
  } catch {
    // Mock response
    return { success: true, message: "Registered successfully (mock)" };
  }
};

export const loginUser = async (data: LoginPayload) => {
  try {
    const res = await API.post("/login", data);
    return res.data;
  } catch {
    // Mock response
    return { success: true, token: "mock_token_123", user: { name: "Demo Parent", email: data.email } };
  }
};

export const searchRides = async (_params: SearchRideParams): Promise<Ride[]> => {
  try {
    const res = await API.get("/rides", { params: _params });
    return res.data;
  } catch {
    return mockRides;
  }
};

export const createRide = async (data: CreateRidePayload) => {
  try {
    const res = await API.post("/createRide", data);
    return res.data;
  } catch {
    return { success: true, message: "Ride created successfully (mock)" };
  }
};

export const bookRide = async (rideId: string) => {
  try {
    const res = await API.post("/bookRide", { rideId });
    return res.data;
  } catch {
    return { success: true, message: "Ride booked successfully (mock)" };
  }
};

export const trackRide = async (_rideId?: string): Promise<TrackingInfo> => {
  try {
    const res = await API.get("/trackRide", { params: { rideId: _rideId } });
    return res.data;
  } catch {
    return mockTracking;
  }
};

export default API;
