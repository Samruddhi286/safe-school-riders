import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-illustration.png";

const features = [
  { icon: Shield, title: "Verified Parents", desc: "Every parent is verified for maximum safety" },
  { icon: Users, title: "Shared Rides", desc: "Split costs and reduce traffic near schools" },
  { icon: MapPin, title: "Live Tracking", desc: "Know exactly where your child is in real-time" },
  { icon: Clock, title: "On-Time Pickups", desc: "Reliable schedules you can count on" },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Nav */}
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <span className="text-2xl font-extrabold text-gradient">SafeRide</span>
      <div className="flex gap-3">
        <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
        <Button asChild><Link to="/signup">Sign Up</Link></Button>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
          Safe School Rides,{" "}
          <span className="text-gradient">Shared by Parents</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-lg">
          A trusted platform for parents to share school rides safely. Coordinate pickups, track rides, and build community.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild><Link to="/signup">Get Started</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/login">Login</Link></Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center"
      >
        <img src={heroImg} alt="Children riding school bus safely" className="w-full max-w-md animate-float" />
      </motion.div>
    </section>

    {/* Features */}
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card rounded-lg p-6 card-shadow hover:card-shadow-hover transition-shadow"
          >
            <div className="w-12 h-12 rounded-lg hero-gradient flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default Landing;
