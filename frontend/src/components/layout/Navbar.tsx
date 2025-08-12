import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
};

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/community", label: "Community" },
];

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:3000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
    
    fetchUserProfile();

    const handleProfileUpdate = () => {
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const links = user ? [...baseLinks, { to: "/calendar", label: "Calendar" }, { to: "/mytrips", label: "My Trips" }] : baseLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6E6FA]/40 bg-black/90 text-white backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full bg-[#D3D3Ff] shadow-[0_0_12px_2px_rgba(230,230,250,0.8)]"
            aria-hidden
          />
          <span className="text-lg font-semibold text-[#D3D3FF]">GlobalTrotters</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-lg ${
                location.pathname === l.to ? "text-[#D3D3FF]" : "text-[#D3D3FF]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative flex items-center gap-2">
              <Link to="/profile" title={user.firstName || "User"}>
                <img
                  src={user.profilePic ? user.profilePic : "https://via.placeholder.com/32?text=User"}
                  alt="User profile"
                  className="h-8 w-8 rounded-full object-cover cursor-pointer"
                />
              </Link>
              <Button
                variant="ghost"
                className="text-black hover:text-black"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-black hover:text-black">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#E6E6FA] hover:bg-[#E6E6FA]/80 text-black">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black text-white border-l border-[#E6E6FA]/30">
              <div className="mt-6 flex flex-col gap-4">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`text-base ${
                      location.pathname === l.to ? "text-[#E6E6FA]" : "text-white/80"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/10 mt-2 flex gap-2">
                  {user ? (
                    <>
                      <Link to="/profile" title={user.firstName || "User"}>
                        <img
                          src={user.profilePic ? user.profilePic : "https://via.placeholder.com/32?text=User"}
                          alt="User profile"
                          className="h-8 w-8 rounded-full object-cover cursor-pointer"
                        />
                      </Link>
                      <Button
                        variant="ghost"
                        className="text-white/80 hover:text-white"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1">
                        <Button
                          variant="ghost"
                          className="w-full text-white/80 hover:text-white"
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link to="/signup" className="flex-1">
                        <Button className="w-full bg-[#E6E6FA] hover:bg-[#E6E6FA]/80 text-black">
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
