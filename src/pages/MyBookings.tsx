import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Users, CalendarCheck, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRides, type Booking } from "@/contexts/RideContext";
import { toast } from "sonner";

const statusConfig: Record<Booking["status"], { label: string; icon: typeof CheckCircle; color: string }> = {
  confirmed: { label: "Confirmed", icon: CalendarCheck, color: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", icon: Loader2, color: "bg-amber-500/20 text-amber-700" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-emerald-500/20 text-emerald-700" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

const MyBookings = () => {
  const { bookings, cancelBooking, loadingBookings } = useRides();
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    toast.success("Booking cancelled.");
  };

  if (loadingBookings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <span className="text-2xl font-extrabold text-gradient">SafeRide</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-card rounded-lg p-12 card-shadow text-center">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No bookings yet</p>
            <p className="text-muted-foreground mb-6">Search for rides and book one to get started.</p>
            <Button asChild>
              <Link to="/search-ride">Search Rides</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {activeBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Active Bookings ({activeBookings.length})</h2>
                {activeBookings.map((booking, i) => {
                  const cfg = statusConfig[booking.status];
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-card rounded-lg p-5 card-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-foreground">{booking.ride.driverName}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                              <cfg.icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{booking.ride.pickupLocation} → {booking.ride.destination}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.ride.date} at {booking.ride.time}</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{booking.ride.availableSeats} seats</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{booking.ride.vehicleDetails}</p>
                          <p className="text-xs text-muted-foreground">Booked: {new Date(booking.bookedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/ride-tracking">Track</Link>
                          </Button>
                          {booking.status === "confirmed" && (
                            <Button size="sm" variant="destructive" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {cancelledBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground">Cancelled ({cancelledBookings.length})</h2>
                {cancelledBookings.map((booking) => {
                  const cfg = statusConfig[booking.status];
                  return (
                    <div key={booking.id} className="bg-card rounded-lg p-5 card-shadow opacity-60">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-foreground">{booking.ride.driverName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.ride.pickupLocation} → {booking.ride.destination} on {booking.ride.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
