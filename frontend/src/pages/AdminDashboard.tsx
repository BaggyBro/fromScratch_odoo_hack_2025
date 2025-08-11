import { useMemo, useState } from "react";
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

const TabButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
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

const PieChart = () => (
  <svg viewBox="0 0 32 32" className="w-full h-56">
    <circle r="16" cx="16" cy="16" fill="#1a1a1a" />
    <circle r="8" cx="16" cy="16" fill="transparent" stroke="#E6E6FA" strokeWidth="16" strokeDasharray="60 40" transform="rotate(-90 16 16)" />
    <circle r="8" cx="16" cy="16" fill="transparent" stroke="#B8B8F0" strokeWidth="16" strokeDasharray="25 75" transform="rotate(-30 16 16)" />
  </svg>
);

const LineChart = () => (
  <svg viewBox="0 0 100 40" className="w-full h-40">
    <rect width="100" height="40" fill="#111111" />
    <polyline fill="none" stroke="#E6E6FA" strokeWidth="2" points="0,30 15,25 30,27 45,20 60,15 75,20 90,18 100,22" />
    <polyline fill="rgba(230,230,250,0.15)" stroke="none" points="0,40 0,30 15,25 30,27 45,20 60,15 75,20 90,18 100,22 100,40" />
  </svg>
);

const BarChart = () => (
  <svg viewBox="0 0 100 40" className="w-full h-40">
    <rect width="100" height="40" fill="#111111" />
    {[15, 25, 18, 30, 22, 28].map((h, i) => (
      <rect key={i} x={i * 16 + 6} y={40 - h} width="10" height={h} fill="#E6E6FA" />
    ))}
  </svg>
);

// Mock data
type User = { id: number; name: string; email: string; trips: number; status: "active" | "banned" };
const MOCK_USERS: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", trips: 12, status: "active" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", trips: 5, status: "active" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", trips: 8, status: "banned" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", trips: 14, status: "active" },
];

type Metric = { name: string; visits: number; region?: string };
const POPULAR_CITIES: Metric[] = [
  { name: "Paris", visits: 420, region: "Europe" },
  { name: "Tokyo", visits: 530, region: "Asia" },
  { name: "New York", visits: 390, region: "Americas" },
  { name: "Cape Town", visits: 210, region: "Africa" },
  { name: "Sydney", visits: 260, region: "Oceania" },
];

const POPULAR_ACTIVITIES: Metric[] = [
  { name: "Paragliding", visits: 320, region: "Adventure" },
  { name: "Museum Tours", visits: 410, region: "Culture" },
  { name: "Food Trails", visits: 280, region: "Lifestyle" },
  { name: "Hiking", visits: 360, region: "Adventure" },
  { name: "City Walks", visits: 300, region: "Lifestyle" },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState<"users" | "cities" | "activities" | "analytics">("users");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [groupBy, setGroupBy] = useState(false);
  const [minVisits, setMinVisits] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const toggleUserStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u))
    );
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => (sortAsc ? a.trips - b.trips : b.trips - a.trips));
  }, [users, search, sortAsc]);

  const filterMetrics = (data: Metric[]) => {
    let out = data.filter((m) => m.visits >= minVisits && m.name.toLowerCase().includes(search.toLowerCase()));
    out = out.sort((a, b) => (sortAsc ? a.visits - b.visits : b.visits - a.visits));
    if (groupBy) {
      // simple grouping: region header rows
      const groups: Record<string, Metric[]> = {};
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
                    <TableHead className="text-white/80">Name</TableHead>
                    <TableHead className="text-white/80">Email</TableHead>
                    <TableHead className="text-white/80">Trips</TableHead>
                    <TableHead className="text-white/80">Status</TableHead>
                    <TableHead className="text-white/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
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
                        <Button size="sm" variant="ghost" className="text-white/80 hover:text-white">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  {Object.entries(citiesProcessed as Record<string, Metric[]>).map(([group, items]) => (
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
                  {(citiesProcessed as Metric[]).map((c) => (
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
                  {Object.entries(activitiesProcessed as Record<string, Metric[]>).map(([group, items]) => (
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
                  {(activitiesProcessed as Metric[]).map((a) => (
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
    </main>
  );
};

export default AdminDashboard;
