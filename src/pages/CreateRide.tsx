import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRide } from "@/services/api";
import { useRides } from "@/contexts/RideContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CreateRide = () => {
  const navigate = useNavigate();
  const { addRide } = useRides();
  const { user } = useAuth();
  const [form, setForm] = useState({ pickupLocation: "", destination: "", date: "", time: "", seats: 1, vehicleDetails: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: field === "seats" ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRide(form);
      addRide({
        driverName: user?.name || "You",
        pickupLocation: form.pickupLocation,
        destination: form.destination,
        date: form.date,
        time: form.time,
        availableSeats: form.seats,
        vehicleDetails: form.vehicleDetails,
      });
      toast.success("Ride created successfully!");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to create ride.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto">
        <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link></Button>
        <span className="text-2xl font-extrabold text-gradient">SafeRide</span>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Create a Ride</h1>
        <div className="bg-card rounded-lg p-8 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Pickup Location</Label>
              <Input value={form.pickupLocation} onChange={update("pickupLocation")} placeholder="e.g. 123 Oak Street" required className="mt-1" />
            </div>
            <div>
              <Label>Destination (School)</Label>
              <Input value={form.destination} onChange={update("destination")} placeholder="e.g. Lincoln Elementary" required className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={update("date")} required className="mt-1" />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={form.time} onChange={update("time")} required className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Number of Seats</Label>
              <Input type="number" min={1} max={8} value={form.seats} onChange={update("seats")} required className="mt-1" />
            </div>
            <div>
              <Label>Vehicle Details</Label>
              <Input value={form.vehicleDetails} onChange={update("vehicleDetails")} placeholder="e.g. White Honda Odyssey" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Ride"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateRide;
