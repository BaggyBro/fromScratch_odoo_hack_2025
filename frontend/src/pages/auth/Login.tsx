import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spline from "@splinetool/react-spline";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "admin") {
      window.location.href = "/admin-login";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      
      try {
        const profileRes = await fetch(`${API_BASE}/profile`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            localStorage.setItem("user", JSON.stringify({ ...profileData.user, role: "user" }));
          }
        }
      } catch (profileError) {
        console.error("Failed to fetch profile:", profileError);
        localStorage.setItem("user", JSON.stringify({ ...data.user, role: "user" }));
      }
      
      localStorage.removeItem("justSignedUp");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md text-[#d3d3ff]">
          <CardHeader>
            <CardTitle className="text-2xl font-mono italic text-center">Login</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div>
                <label className="block mb-1 text-sm">Login as</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "user" | "admin")}
                  className="w-full bg-black border border-[#E6E6FA]/40 rounded px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {role === "user" && (
                <>
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </>
              )}

              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? "Processing..." : role === "admin" ? "Continue to Admin Login" : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              No account? <a className="text-primary hover:underline" href="/signup">Create one</a>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block w-1/2 h-screen">
        <Spline scene="https://prod.spline.design/RJpSCkoPCHxfmSjY/scene.splinecode" className="w-full h-full" />
      </div>
    </div>
  );
};

export default Login;
