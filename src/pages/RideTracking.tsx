import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, CheckCircle, Loader2, CalendarCheck, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackRide, type TrackingInfo } from "@/services/api";
import L from "leaflet";

// Simulated route points (pickup to school)
const routePoints: [number, number][] = [
  [40.7128, -74.006],
  [40.714, -74.004],
  [40.716, -74.002],
  [40.718, -74.0],
  [40.72, -73.998],
  [40.722, -73.996],
  [40.724, -73.994],
  [40.726, -73.992],
  [40.728, -73.99],
  [40.73, -73.988],
];

const schoolLocation: [number, number] = routePoints[routePoints.length - 1];

const statusConfig = {
  scheduled: { label: "Scheduled", icon: CalendarCheck, color: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In Progress", icon: Loader2, color: "bg-amber-500/20 text-amber-700" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-emerald-500/20 text-emerald-700" },
};

const RideTracking = () => {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [rideStatus, setRideStatus] = useState<"scheduled" | "in_progress" | "completed">("scheduled");
  const [eta, setEta] = useState("Calculating...");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const traveledLineRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(routePoints[0], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Ensure map renders correctly after DOM is ready
    setTimeout(() => map.invalidateSize(), 100);

    // Remaining route (dashed)
    L.polyline(routePoints, { color: "#3b82f6", weight: 3, opacity: 0.3, dashArray: "8 8" }).addTo(map);

    // School marker
    const schoolIcon = L.divIcon({
      html: `<div style="background:#22c55e;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 5v17"/><path d="M6 5v17"/></svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      className: "",
    });
    L.marker(schoolLocation, { icon: schoolIcon }).addTo(map).bindPopup("School - Destination");

    // Driver marker
    const driverMarker = L.marker(routePoints[0]).addTo(map).bindPopup("Driver - On the way");
    driverMarkerRef.current = driverMarker;

    // Traveled line
    const traveledLine = L.polyline([routePoints[0]], { color: "#3b82f6", weight: 4, opacity: 0.8 }).addTo(map);
    traveledLineRef.current = traveledLine;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch tracking data
  useEffect(() => {
    trackRide().then((data) => {
      setTracking(data);
      setTimeout(() => setRideStatus("in_progress"), 1500);
    });
  }, []);

  // Simulate movement
  useEffect(() => {
    if (rideStatus === "in_progress") {
      intervalRef.current = setInterval(() => {
        setRouteIndex((prev) => {
          const next = prev + 1;
          if (next >= routePoints.length - 1) {
            clearInterval(intervalRef.current!);
            setTimeout(() => setRideStatus("completed"), 500);
            return routePoints.length - 1;
          }
          return next;
        });
      }, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rideStatus]);

  // Update map markers on movement
  useEffect(() => {
    const pos = routePoints[routeIndex];
    driverMarkerRef.current?.setLatLng(pos);
    traveledLineRef.current?.setLatLngs(routePoints.slice(0, routeIndex + 1));
    mapRef.current?.panTo(pos, { animate: true, duration: 0.5 });

    const remaining = routePoints.length - 1 - routeIndex;
    if (rideStatus === "completed") setEta("Arrived!");
    else if (rideStatus === "scheduled") setEta("Waiting to start...");
    else setEta(`${remaining * 2} min`);
  }, [routeIndex, rideStatus]);

  const statusInfo = statusConfig[rideStatus];

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <span className="text-2xl font-extrabold text-gradient">SafeRide</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Ride Tracking</h1>

        {tracking ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card rounded-lg p-6 card-shadow space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <statusInfo.icon className={`w-4 h-4 ${rideStatus === "in_progress" ? "animate-spin" : ""}`} />
                  {statusInfo.label}
                </span>
                {rideStatus === "in_progress" && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Navigation className="w-4 h-4 text-primary" />
                    Step {routeIndex + 1} of {routePoints.length}
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
                    <p className="font-semibold text-foreground">{eta}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Map */}
            <div className="bg-card rounded-lg card-shadow overflow-hidden">
              <div ref={mapContainerRef} className="h-[400px] w-full" />
            </div>

            {/* Status timeline */}
            <div className="bg-card rounded-lg p-6 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Ride Progress</h3>
              <div className="space-y-3">
                {(["scheduled", "in_progress", "completed"] as const).map((s, i) => {
                  const cfg = statusConfig[s];
                  const isActive = s === rideStatus;
                  const isDone = ["scheduled", "in_progress", "completed"].indexOf(rideStatus) > i;
                  return (
                    <div key={s} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 border border-primary/20" : isDone ? "bg-muted/50" : "opacity-40"}`}>
                      <cfg.icon className={`w-5 h-5 ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground"} ${isActive && s === "in_progress" ? "animate-spin" : ""}`} />
                      <span className={`font-medium ${isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>{cfg.label}</span>
                      {isDone && <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />}
                    </div>
                  );
                })}
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
