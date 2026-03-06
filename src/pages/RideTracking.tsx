import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, User, CheckCircle, Loader2, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackRide, type TrackingInfo } from "@/services/api";

const statusConfig = {
  scheduled: { label: "Scheduled", icon: CalendarCheck, color: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In Progress", icon: Loader2, color: "bg-warning text-warning-foreground" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-success text-success-foreground" },
};

const RideTracking = () => {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);

  useEffect(() => {
    trackRide().then(setTracking);
  }, []);

  const status = tracking ? statusConfig[tracking.status] : null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto">
        <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link></Button>
        <span className="text-2xl font-extrabold text-gradient">SafeRide</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Ride Tracking</h1>

        {tracking ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card rounded-lg p-6 card-shadow space-y-4">
              <div className="flex items-center gap-3">
                {status && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    <status.icon className="w-4 h-4" />
                    {status.label}
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Driver</p>
                    <p className="font-semibold text-foreground">{tracking.driverName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                    <p className="font-semibold text-foreground">{tracking.estimatedArrival}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-card rounded-lg card-shadow overflow-hidden">
              <div className="h-72 bg-muted flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-10 hero-gradient" />
                <div className="text-center z-10">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Live Map View</p>
                  <p className="text-sm text-muted-foreground">Map integration coming soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Loading tracking info...</div>
        )}
      </main>
    </div>
  );
};

export default RideTracking;
