import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRides, type Ride } from "@/contexts/RideContext";
import { toast } from "sonner";

const SearchRide = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<Ride[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addBooking, bookings, searchRides } = useRides();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rides = await searchRides(pickupLocation, schoolName, date);
      setResults(rides);
      setSearched(true);
    } catch {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (ride: Ride) => {
    const alreadyBooked = bookings.some((b) => b.ride.id === ride.id && b.status !== "cancelled");
    if (alreadyBooked) {
      toast.error("You've already booked this ride.");
      return;
    }
    try {
      await addBooking(ride);
      toast.success("Ride booked successfully! Check My Bookings.");
    } catch {
      toast.error("Booking failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto">
        <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link></Button>
        <span className="text-2xl font-extrabold text-gradient">SafeRide</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Search Rides</h1>

        <form onSubmit={handleSearch} className="bg-card rounded-lg p-6 card-shadow space-y-4 mb-8">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Pickup Location</Label>
              <Input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g. Oak Street" className="mt-1" />
            </div>
            <div>
              <Label>School Name</Label>
              <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Lincoln Elementary" className="mt-1" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            <SearchIcon className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {searched && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{results.length} ride(s) found</h2>
            {results.map((ride, i) => {
              const isBooked = bookings.some((b) => b.ride.id === ride.id && b.status !== "cancelled");
              return (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-lg p-5 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground">{ride.driverName}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ride.pickupLocation} → {ride.destination}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ride.time}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{ride.availableSeats} seats</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ride.vehicleDetails}</p>
                  </div>
                  <Button size="sm" onClick={() => handleBook(ride)} disabled={isBooked}>
                    {isBooked ? "Booked ✓" : "Book Ride"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchRide;
