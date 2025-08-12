import { useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const TabButton = ({ active, children, onClick }) => (
  <Button
    variant={active ? "default" : "outline"}
    className={`${active ? "bg-[#E6E6FA] hover:bg-[#E6E6FA]/80 text-black" : "border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20"}`}
    onClick={onClick}
  >
    {children}
  </Button>
);

const MiniCalendar = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const shaded = new Set([2, 9, 16, 21, 28]);
  return (
    <Card className="bg-black/60 border-[#E6E6FA]/50">
      <CardHeader>
        <CardTitle className="text-white">January 2024</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => (
            <div key={d} className={`text-center text-xs p-2 rounded ${shaded.has(d) ? "bg-[#D3D3FF] text-black" : "bg-black/40 text-white/70"}`}>{d}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PieChart = () => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const containerRef = useRef(null);
  const handleMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({ ...t, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };
  const handleEnter = (content) => setTooltip((t) => ({ ...t, visible: true, content }));
  const handleLeave = () => setTooltip((t) => ({ ...t, visible: false }));
  return (
    <div ref={containerRef} className="relative">
      <svg viewBox="0 0 32 32" className="w-full h-56" onMouseMove={handleMove}>
        <circle r="16" cx="16" cy="16" fill="#1a1a1a" />

        {/* Donut slices (Europe 45%, Asia 35%, Americas 20%) */}
        <circle r="8" cx="16" cy="16" fill="transparent" stroke="#E6E6FA" strokeWidth="16" strokeDasharray="45 55" transform="rotate(-90 16 16)" onMouseEnter={() => handleEnter("Europe 45%")}
          onMouseLeave={handleLeave} />
        <circle r="8" cx="16" cy="16" fill="transparent" stroke="#B8B8F0" strokeWidth="16" strokeDasharray="35 65" transform="rotate(72 16 16)" onMouseEnter={() => handleEnter("Asia 35%")}
          onMouseLeave={handleLeave} />
        <circle r="8" cx="16" cy="16" fill="transparent" stroke="#9C9CF5" strokeWidth="16" strokeDasharray="20 80" transform="rotate(198 16 16)" onMouseEnter={() => handleEnter("Americas 20%")}
          onMouseLeave={handleLeave} />

        {/* Center labels - brighter and larger for visibility */}
        <text x="16" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="4" fontWeight="bold">Visits</text>
        <text x="16" y="19.5" textAnchor="middle" fill="#E6E6FA" fontSize="3.4">by Region</text>
      </svg>

      {/* Legend below the chart in white */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-white text-xs">
        <div className="flex items-center gap-2">
          <span style={{ backgroundColor: "#E6E6FA" }} className="inline-block w-3 h-3" />
          <span>Europe 45%</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ backgroundColor: "#B8B8F0" }} className="inline-block w-3 h-3" />
          <span>Asia 35%</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ backgroundColor: "#9C9CF5" }} className="inline-block w-3 h-3" />
          <span>Americas 20%</span>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="pointer-events-none select-none bg-black/80 text-white text-xs px-2 py-1 rounded border border-[#E6E6FA]/50 shadow absolute"
          style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

const LineChart = () => {
  const x = [0, 15, 30, 45, 60, 75, 90, 100];
  const y = [30, 25, 27, 20, 15, 20, 18, 22];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const points = x.map((xi, i) => `${xi},${y[i]}`).join(" ");
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const containerRef = useRef(null);
  const handleMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({ ...t, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };
  const handleEnter = (content) => setTooltip((t) => ({ ...t, visible: true, content }));
  const handleLeave = () => setTooltip((t) => ({ ...t, visible: false }));
  return (
    <div ref={containerRef} className="relative">
      <svg viewBox="0 0 100 40" className="w-full h-40" onMouseMove={handleMove}>
        <rect width="100" height="40" fill="#111111" />
        {/* Grid and axes */}
        {[10, 20, 30].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2="100" y2={gy} stroke="#1e1e1e" strokeWidth="0.5" />
        ))}
        <line x1="0" y1="35" x2="100" y2="35" stroke="#2a2a2a" strokeWidth="0.75" />
        {/* Series */}
        <polyline fill="none" stroke="#E6E6FA" strokeWidth="2" points={points} />
        <polyline fill="rgba(230,230,250,0.15)" stroke="none" points={`0,40  ${points}  100,40`} />
        {/* Points and labels */}
        {x.map((xi, i) => (
          <g key={i}>
            <circle cx={xi} cy={y[i]} r={1.5} fill="#E6E6FA" onMouseEnter={() => handleEnter(`${months[i]}: ${y[i]}`)} onMouseLeave={handleLeave} />
            <text x={xi} y={38} textAnchor="middle" fontSize="3" fill="#b0b0c8">{months[i]}</text>
          </g>
        ))}
      </svg>
      {tooltip.visible && (
        <div
          className="pointer-events-none select-none bg-black/80 text-white text-xs px-2 py-1 rounded border border-[#E6E6FA]/50 shadow absolute"
          style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

const BarChart = () => {
  const heights = [15, 25, 18, 30, 22, 28];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const containerRef = useRef(null);
  const handleMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => ({ ...t, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };
  const handleEnter = (content) => setTooltip((t) => ({ ...t, visible: true, content }));
  const handleLeave = () => setTooltip((t) => ({ ...t, visible: false }));
  return (
    <div ref={containerRef} className="relative">
      <svg viewBox="0 0 100 40" className="w-full h-40" onMouseMove={handleMove}>
        <rect width="100" height="40" fill="#111111" />
        {/* Gridlines */}
        {[10, 20, 30].map((gy) => (
          <line key={gy} x1="0" y1={40 - gy} x2="100" y2={40 - gy} stroke="#1e1e1e" strokeWidth="0.5" />
        ))}
        {heights.map((h, i) => {
          const x = i * 16 + 6;
          const top = 40 - h;
          return (
            <g key={i}>
              <rect x={x} y={top} width="10" height={h} fill="#E6E6FA" onMouseEnter={() => handleEnter(`${labels[i]}: ${h}`)} onMouseLeave={handleLeave} />
              <text x={x + 5} y={top - 1.5} textAnchor="middle" fontSize="3" fill="#cfd0ff">{h}</text>
              <text x={x + 5} y={38} textAnchor="middle" fontSize="3" fill="#b0b0c8">{labels[i]}</text>
            </g>
          );
        })}
      </svg>
      {tooltip.visible && (
        <div
          className="pointer-events-none select-none bg-black/80 text-white text-xs px-2 py-1 rounded border border-[#E6E6FA]/50 shadow absolute"
          style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

// Mock data
const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", trips: 12, status: "active" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", trips: 5, status: "active" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", trips: 8, status: "banned" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", trips: 14, status: "active" },
];

const POPULAR_CITIES = [
  { name: "Paris", visits: 420, region: "Europe" },
  { name: "Tokyo", visits: 530, region: "Asia" },
  { name: "New York", visits: 390, region: "Americas" },
  { name: "Cape Town", visits: 210, region: "Africa" },
  { name: "Sydney", visits: 260, region: "Oceania" },
];

const POPULAR_ACTIVITIES = [
  { name: "Paragliding", visits: 320, region: "Adventure" },
  { name: "Museum Tours", visits: 410, region: "Culture" },
  { name: "Food Trails", visits: 280, region: "Lifestyle" },
  { name: "Hiking", visits: 360, region: "Adventure" },
  { name: "City Walks", visits: 300, region: "Lifestyle" },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [groupBy, setGroupBy] = useState(false);
  const [minVisits, setMinVisits] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const [users, setUsers] = useState(MOCK_USERS);
  const [userSortKey, setUserSortKey] = useState("trips");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u))
    );
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const sorted = [...filtered].sort((a, b) => {
      if (userSortKey === "trips") {
        return sortAsc ? a.trips - b.trips : b.trips - a.trips;
      }
      const av = String(a[userSortKey]).toLowerCase();
      const bv = String(b[userSortKey]).toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, search, sortAsc, userSortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);

  const handleUserSort = (key) => {
    if (userSortKey === key) {
      setSortAsc((s) => !s);
    } else {
      setUserSortKey(key);
    }
  };

  const filterMetrics = (data) => {
    let out = data.filter((m) => m.visits >= minVisits && m.name.toLowerCase().includes(search.toLowerCase()));
    out = out.sort((a, b) => (sortAsc ? a.visits - b.visits : b.visits - a.visits));
    if (groupBy) {
      // simple grouping: region header rows
      const groups = {};
      out.forEach((m) => {
        const key = m.region || "Other";
        groups[key] = groups[key] || [];
        groups[key].push(m);
      });
      return groups; // grouped output
    }
    return out;
  };

  const citiesProcessed = useMemo(() => filterMetrics(POPULAR_CITIES), [search, sortAsc, groupBy, minVisits]);
  const activitiesProcessed = useMemo(() => filterMetrics(POPULAR_ACTIVITIES), [search, sortAsc, groupBy, minVisits]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#D3D3FF]">Admin Panel</h1>

        {/* Search bar and controls */}
        <div className="mb-3 flex flex-col sm:flex-row gap-3 items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, cities, activities..."
            className="flex-1 px-4 py-3 rounded-lg bg-black/60 border border-[#E6E6FA]/60 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#E6E6FA]"
          />
          <Button variant="outline" className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20" onClick={() => setGroupBy((g) => !g)}>
            {groupBy ? "Ungroup" : "Group by"}
          </Button>
          <Button variant="outline" className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20" onClick={() => setFilterOpen((v) => !v)}>
            {filterOpen ? "Hide Filters" : "Filter"}
          </Button>
          <Button variant="outline" className="border-[#E6E6FA] text-white hover:bg-[#E6E6FA]/20" onClick={() => setSortAsc((s) => !s)}>
            Sort by visits {sortAsc ? "▲" : "▼"}
          </Button>
        </div>

        {filterOpen && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm text-white/80">Min visits</label>
            <Input
              type="number"
              value={minVisits}
              onChange={(e) => setMinVisits(Number(e.target.value) || 0)}
              className="w-32 bg-black/60 border border-[#E6E6FA]/60"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>Manage Users</TabButton>
          <TabButton active={tab === "cities"} onClick={() => setTab("cities")}>Popular cities</TabButton>
          <TabButton active={tab === "activities"} onClick={() => setTab("activities")}>Popular Activities</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>User Trends and Analytics</TabButton>
        </div>

        {tab === "users" && (
          <Card className="bg-black/60 border-[#E6E6FA]/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-white/80" onClick={() => handleUserSort("name")}>Name</TableHead>
                    <TableHead className="text-white/80" onClick={() => handleUserSort("email")}>Email</TableHead>
                    <TableHead className="text-white/80" onClick={() => handleUserSort("trips")}>Trips</TableHead>
                    <TableHead className="text-white/80">Status</TableHead>
                    <TableHead className="text-white/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-white/5">
                      <TableCell>{u.name}</TableCell>
                      <TableCell className="text-white/80">{u.email}</TableCell>
                      <TableCell>{u.trips}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${u.status === "active" ? "bg-[#E6E6FA]/30 text-white" : "bg-red-500/30 text-red-200"}`}>
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="border-[#E6E6FA] hover:bg-[#E6E6FA]/20 mr-2" onClick={() => toggleUserStatus(u.id)}>
                          {u.status === "active" ? "Ban" : "Unban"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white/80 hover:text-white" onClick={() => setSelectedUser(u)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-white/70 text-sm">Page {page} of {totalPages}</span>
                <div>
                  <Button size="sm" variant="outline" className="border-[#E6E6FA] hover:bg-[#E6E6FA]/20 mr-2" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    Prev
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#E6E6FA] hover:bg-[#E6E6FA]/20" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "cities" && (
          <Card className="bg-black/60 border-[#E6E6FA]/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Popular Cities</CardTitle>
            </CardHeader>
            <CardContent>
              {groupBy && !Array.isArray(citiesProcessed) ? (
                <div className="space-y-4">
                  {Object.entries(citiesProcessed).map(([group, items]) => (
                    <div key={group}>
                      <h3 className="text-sm mb-2 text-white/70">{group}</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {items.map((c) => (
                          <div key={c.name} className="flex items-center justify-between bg-white/5 rounded p-3">
                            <span>{c.name}</span>
                            <span className="text-[#E6E6FA]">{c.visits}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {citiesProcessed.map((c) => (
                    <div key={c.name} className="flex items-center justify-between bg-white/5 rounded p-3">
                      <span>{c.name}</span>
                      <span className="text-[#E6E6FA]">{c.visits}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "activities" && (
          <Card className="bg-black/60 border-[#E6E6FA]/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Popular Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {groupBy && !Array.isArray(activitiesProcessed) ? (
                <div className="space-y-4">
                  {Object.entries(activitiesProcessed).map(([group, items]) => (
                    <div key={group}>
                      <h3 className="text-sm mb-2 text-white/70">{group}</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {items.map((a) => (
                          <div key={a.name} className="flex items-center justify-between bg-white/5 rounded p-3">
                            <span>{a.name}</span>
                            <span className="text-[#E6E6FA]">{a.visits}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {activitiesProcessed.map((a) => (
                    <div key={a.name} className="flex items-center justify-between bg-white/5 rounded p-3">
                      <span>{a.name}</span>
                      <span className="text-[#E6E6FA]">{a.visits}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-black/60 border-[#E6E6FA]/50">
                <CardHeader>
                  <CardTitle className="text-white">Popular Cities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <PieChart />
                      <p className="mt-2 text-sm text-white/70">Share of visits by region</p>
                    </div>
                    <div>
                      <LineChart />
                      <p className="mt-2 text-sm text-white/70">Visits trend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-[#E6E6FA]/50">
                <CardHeader>
                  <CardTitle className="text-white">Popular Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart />
                  <p className="mt-2 text-sm text-white/70">Activity frequency</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-black/60 border-[#E6E6FA]/50">
                <CardHeader>
                  <CardTitle className="text-white">About</CardTitle>
                </CardHeader>
                <CardContent className="text-white/80 text-sm space-y-4">
                  <div>
                    <p className="font-semibold">Manage User Section:</p>
                    <p>Admin can manage users and their actions, view trips made by users, and more.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Popular cities:</p>
                    <p>Lists cities users are visiting based on current trends.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Popular Activities:</p>
                    <p>Lists popular activities users are doing based on trend data.</p>
                  </div>
                  <div>
                    <p className="font-semibold">User trends and Analytics:</p>
                    <p>Analytics across various points providing useful information to the admin.</p>
                  </div>
                </CardContent>
              </Card>

              <MiniCalendar />
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-black/80 border border-[#E6E6FA]/50 rounded-xl w-full max-w-md p-5 text-white">
            <h2 className="text-xl mb-3">User Details</h2>
            <div className="space-y-2 text-white/80">
              <div><span className="text-white">Name:</span> {selectedUser.name}</div>
              <div><span className="text-white">Email:</span> {selectedUser.email}</div>
              <div><span className="text-white">Trips:</span> {selectedUser.trips}</div>
              <div>
                <span className="text-white">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedUser.status === "active" ? "bg-[#E6E6FA]/30 text-white" : "bg-red-500/30 text-red-200"}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="border-[#E6E6FA] hover:bg-[#E6E6FA]/20" onClick={() => { toggleUserStatus(selectedUser.id); setSelectedUser((u) => (u ? { ...u, status: u.status === "active" ? "banned" : "active" } : u)); }}>
                {selectedUser.status === "active" ? "Ban" : "Unban"}
              </Button>
              <Button variant="outline" className="border-[#E6E6FA] hover:bg-[#E6E6FA]/20" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
