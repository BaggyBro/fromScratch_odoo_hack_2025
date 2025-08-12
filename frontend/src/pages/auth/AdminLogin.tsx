import { useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Spline from "@splinetool/react-spline";

const API_BASE = "http://localhost:3000"; // backend URL

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassword(""); // Clear password field on error
        throw new Error(data.message || "Admin login failed");
      }

      // Persist admin identity
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("user", JSON.stringify({ role: "admin" }));

      navigate("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-xl text-[#d3d3ff] bg-black/60 border-[#E6E6FA]/50">
          <CardHeader>
            <CardTitle className="text-2xl text-[#d3d3ff]">Admin Login</CardTitle>
            <p className="text-sm text-white/70">Log in to access the admin panel</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <p className="text-red-400 text-sm" role="alert" aria-live="assertive">
                  {error}
                </p>
              )}
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 rounded bg-black border border-[#E6E6FA]/50 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 rounded bg-black border border-[#E6E6FA]/50 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                className="w-full bg-[#E6E6FA] text-black hover:bg-[#E6E6FA]/80"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="hidden md:block w-1/2 h-screen">
        <Spline
          scene="https://prod.spline.design/RJpSCkoPCHxfmSjY/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </main>
  );
};

export default AdminLogin;