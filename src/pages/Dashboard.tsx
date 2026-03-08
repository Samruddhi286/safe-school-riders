import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, PlusCircle, BookOpen, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const cards = [
  { title: "Search Ride", desc: "Find available rides near you", icon: Search, to: "/search-ride", color: "hero-gradient" },
  { title: "Create Ride", desc: "Offer a ride to other parents", icon: PlusCircle, to: "/create-ride", color: "hero-gradient" },
  { title: "My Bookings", desc: "View your booked rides", icon: BookOpen, to: "/my-bookings", color: "hero-gradient" },
  { title: "Ride Tracking", desc: "Track your child's ride live", icon: MapPin, to: "/ride-tracking", color: "hero-gradient" },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-2xl font-extrabold text-gradient">SafeRide</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">Hi, {user?.name || "Parent"}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground mb-2"
        >
          Welcome, {user?.name || "Parent"} 👋
        </motion.h1>
        <p className="text-muted-foreground mb-10">Manage your school rides from one place.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={c.to}
                className="block bg-card rounded-lg p-6 card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-lg ${c.color} flex items-center justify-center mb-4`}>
                  <c.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
