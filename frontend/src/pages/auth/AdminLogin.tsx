import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:3000"; // backend URL

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Directly authenticate admin (modify endpoint as needed)
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // no adminCode anymore
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      // Persist admin identity
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("user", JSON.stringify({ role: "admin" }));

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-black/60 border-[#E6E6FA]/50">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-white/70">
            Log in to access the admin panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="text-red-400 text-sm">{error}</p>}
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
  );
};

export default AdminLogin;
