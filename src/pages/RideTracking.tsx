import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, CheckCircle, Loader2, CalendarCheck, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackRide, type TrackingInfo } from "@/services/api";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const carIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const schoolIcon = new L.DivIcon({
  html: `<div style="background:hsl(142,71%,45%);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 5v17"/><path d="M6 5v17"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  className: "",
});

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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.5 });
  }, [center, map]);
  return null;
}

const RideTracking = () => {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [rideStatus, setRideStatus] = useState<"scheduled" | "in_progress" | "completed">("scheduled");
  const [eta, setEta] = useState("Calculating...");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    trackRide().then((data) => {
      setTracking(data);
      // Start simulation after a brief delay
      setTimeout(() => {
        setRideStatus("in_progress");
      }, 1500);
    });
  }, []);

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

  useEffect(() => {
    const remaining = routePoints.length - 1 - routeIndex;
    if (rideStatus === "completed") {
      setEta("Arrived!");
    } else if (rideStatus === "scheduled") {
      setEta("Waiting to start...");
    } else {
      setEta(`${remaining * 2} min`);
    }
  }, [routeIndex, rideStatus]);

  const currentPos = routePoints[routeIndex];
  const traveledRoute = routePoints.slice(0, routeIndex + 1);
  const remainingRoute = routePoints.slice(routeIndex);
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
            {/* Status & Info */}
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
              <div className="h-[400px]">
                <MapContainer
                  center={currentPos}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapUpdater center={currentPos} />

                  {/* Traveled route */}
                  {traveledRoute.length > 1 && (
                    <Polyline positions={traveledRoute} color="hsl(217, 91%, 60%)" weight={4} opacity={0.8} />
                  )}
                  {/* Remaining route */}
                  {remainingRoute.length > 1 && (
                    <Polyline positions={remainingRoute} color="hsl(217, 91%, 60%)" weight={3} opacity={0.3} dashArray="8 8" />
                  )}

                  {/* Driver marker */}
                  <Marker position={currentPos} icon={carIcon}>
                    <Popup>{tracking.driverName} - {rideStatus === "completed" ? "Arrived!" : "On the way"}</Popup>
                  </Marker>

                  {/* School marker */}
                  <Marker position={schoolLocation} icon={schoolIcon}>
                    <Popup>School - Destination</Popup>
                  </Marker>
                </MapContainer>
              </div>
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
