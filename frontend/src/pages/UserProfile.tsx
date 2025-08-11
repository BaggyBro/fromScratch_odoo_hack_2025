import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UserProfile = () => {
  const preplannedTrips = [
    { name: "Paris Adventure", date: "March 2024" },
    { name: "Tokyo Discovery", date: "May 2024" },
    { name: "New York City", date: "July 2024" }
  ];

  const previousTrips = [
    { name: "London Experience", date: "January 2024" },
    { name: "Rome History", date: "November 2023" },
    { name: "Barcelona Culture", date: "September 2023" }
  ];

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Top section: avatar + details card */}
        <Card className="mb-6">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-[#E6E6FA]/40" />
            </div>
            <div className="md:col-span-2">
              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    User Details with appropriate option to edit those information....
                  </p>
                  <div className="mt-3">
                    <Button variant="outline" className="border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10">Edit Profile</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Preplanned trips */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Preplanned Trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {preplannedTrips.map((trip) => (
              <Card key={trip.name} className="bg-white/5">
                <CardContent className="p-4 text-center">
                  <div className="h-24 bg-white/10 rounded mb-3" />
                  <p className="font-medium">{trip.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">{trip.date}</p>
                  <Button size="sm" variant="outline" className="border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10">View</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Previous trips */}
        <section>
          <h2 className="text-xl font-bold mb-4">Previous Trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {previousTrips.map((trip) => (
              <Card key={trip.name} className="bg-white/5">
                <CardContent className="p-4 text-center">
                  <div className="h-24 bg-white/10 rounded mb-3" />
                  <p className="font-medium">{trip.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">{trip.date}</p>
                  <Button size="sm" variant="outline" className="border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10">View</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default UserProfile; 