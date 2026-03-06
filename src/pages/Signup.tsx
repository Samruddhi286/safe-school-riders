import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/services/api";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ parentName: "", email: "", phone: "", password: "", childName: "", schoolName: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch {
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-extrabold text-gradient block text-center mb-8">SafeRide</Link>
        <div className="bg-card rounded-lg p-8 card-shadow">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {([
              ["parentName", "Parent Name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone Number", "tel"],
              ["password", "Password", "password"],
              ["childName", "Child Name", "text"],
              ["schoolName", "School Name", "text"],
            ] as const).map(([key, label, type]) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} type={type} value={form[key]} onChange={update(key)} required className="mt-1" />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
