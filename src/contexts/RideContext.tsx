import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

export interface Booking {
  id: string;
  ride: Ride;
  bookedAt: string;
  status: "confirmed" | "in_progress" | "completed" | "cancelled";
}

interface RideContextType {
  rides: Ride[];
  bookings: Booking[];
  loadingRides: boolean;
  loadingBookings: boolean;
  addRide: (ride: Omit<Ride, "id">) => Promise<void>;
  addBooking: (ride: Ride) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  searchRides: (pickup?: string, destination?: string, date?: string) => Promise<Ride[]>;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchRides = useCallback(async () => {
    setLoadingRides(true);
    const { data } = await supabase.from("rides").select("*").order("created_at", { ascending: false });
    if (data) {
      setRides(data.map((r) => ({
        id: r.id,
        driverName: r.driver_name,
        pickupLocation: r.pickup_location,
        destination: r.destination,
        date: r.date,
        time: r.time,
        availableSeats: r.available_seats,
        vehicleDetails: r.vehicle_details,
      })));
    }
    setLoadingRides(false);
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoadingBookings(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, rides(*)")
      .eq("user_id", user.id)
      .order("booked_at", { ascending: false });
    if (data) {
      setBookings(data.map((b) => ({
        id: b.id,
        bookedAt: b.booked_at,
        status: b.status as Booking["status"],
        ride: {
          id: b.rides!.id,
          driverName: b.rides!.driver_name,
          pickupLocation: b.rides!.pickup_location,
          destination: b.rides!.destination,
          date: b.rides!.date,
          time: b.rides!.time,
          availableSeats: b.rides!.available_seats,
          vehicleDetails: b.rides!.vehicle_details,
        },
      })));
    }
    setLoadingBookings(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRides();
      fetchBookings();
    }
  }, [user, fetchRides, fetchBookings]);

  const addRide = useCallback(async (ride: Omit<Ride, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("rides").insert({
      user_id: user.id,
      driver_name: ride.driverName,
      pickup_location: ride.pickupLocation,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      available_seats: ride.availableSeats,
      vehicle_details: ride.vehicleDetails,
    });
    if (!error) await fetchRides();
  }, [user, fetchRides]);

  const addBooking = useCallback(async (ride: Ride) => {
    if (!user) return;
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      ride_id: ride.id,
      status: "confirmed",
    });
    if (!error) await fetchBookings();
  }, [user, fetchBookings]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    if (!error) await fetchBookings();
  }, [fetchBookings]);

  const searchRides = useCallback(async (pickup?: string, destination?: string, date?: string) => {
    let query = supabase.from("rides").select("*");
    if (pickup) query = query.ilike("pickup_location", `%${pickup}%`);
    if (destination) query = query.ilike("destination", `%${destination}%`);
    if (date) query = query.eq("date", date);
    const { data } = await query.order("created_at", { ascending: false });
    return (data || []).map((r) => ({
      id: r.id,
      driverName: r.driver_name,
      pickupLocation: r.pickup_location,
      destination: r.destination,
      date: r.date,
      time: r.time,
      availableSeats: r.available_seats,
      vehicleDetails: r.vehicle_details,
    }));
  }, []);

  return (
    <RideContext.Provider value={{ rides, bookings, loadingRides, loadingBookings, addRide, addBooking, cancelBooking, searchRides }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRides = () => {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error("useRides must be used within RideProvider");
  return ctx;
};
