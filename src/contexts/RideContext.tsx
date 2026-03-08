import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Ride } from "@/services/api";

export interface Booking {
  id: string;
  ride: Ride;
  bookedAt: string;
  status: "confirmed" | "in_progress" | "completed" | "cancelled";
}

interface RideContextType {
  customRides: Ride[];
  bookings: Booking[];
  addRide: (ride: Omit<Ride, "id">) => void;
  addBooking: (ride: Ride) => void;
  cancelBooking: (bookingId: string) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: ReactNode }) => {
  const [customRides, setCustomRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addRide = useCallback((ride: Omit<Ride, "id">) => {
    const newRide: Ride = { ...ride, id: `custom-${Date.now()}` };
    setCustomRides((prev) => [...prev, newRide]);
  }, []);

  const addBooking = useCallback((ride: Ride) => {
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      ride,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
    };
    setBookings((prev) => [...prev, booking]);
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b))
    );
  }, []);

  return (
    <RideContext.Provider value={{ customRides, bookings, addRide, addBooking, cancelBooking }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRides = () => {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error("useRides must be used within RideProvider");
  return ctx;
};
