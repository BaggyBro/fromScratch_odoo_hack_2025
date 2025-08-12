import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spline from "@splinetool/react-spline";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AdminSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/admin/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Admin signup failed");

      localStorage.setItem("token", data.token || "");
      localStorage.setItem(
        "user",
        JSON.stringify({ firstName, lastName, email, role: "admin" })
      );
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex">
      {/* Left side - Admin Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-xl text-[#d3d3ff]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#d3d3ff]">Admin Signup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full bg-[#E6E6FA] text-black hover:bg-[#E6E6FA]/80"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Admin Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Spline */}
      <div className="hidden md:block w-1/2 h-screen">
        <Spline
          scene="https://prod.spline.design/RJpSCkoPCHxfmSjY/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </main>
  );
};

export default AdminSignup;
