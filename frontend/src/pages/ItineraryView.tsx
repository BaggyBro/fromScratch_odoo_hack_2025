import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ItineraryView = () => {
  const itineraryData = [
    {
      day: 1,
      activities: [
        {
          name: "Eiffel Tower Visit",
          type: "Physical Activity",
          expense: "$25",
        },
        {
          name: "Louvre Museum Tour",
          type: "Physical Activity",
          expense: "$17",
        },
        {
          name: "Seine River Cruise",
          type: "Physical Activity",
          expense: "$15",
        },
      ],
    },
    {
      day: 2,
      activities: [
        {
          name: "Notre-Dame Cathedral",
          type: "Physical Activity",
          expense: "$0",
        },
        { name: "Arc de Triomphe", type: "Physical Activity", expense: "$13" },
        {
          name: "Champs-Élysées Walk",
          type: "Physical Activity",
          expense: "$0",
        },
      ],
    },
  ];

  return (
    <main
      className="min-h-screen bg-cover bg-center relative p-6"
      style={{ backgroundImage: "url('/back-image.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">
          Itinerary View Screen with budget section
        </h1>

        {/* Search and Filter Section */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search bar ---"
                className="w-full px-4 py-3 rounded-lg border border-[#E6E6FA]/40 focus:outline-none focus:ring-2 focus:ring-[#E6E6FA] focus:border-transparent bg-black/40 text-white"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="px-6 py-3 border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10 text-white"
              >
                Group by
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10 text-white"
              >
                Filter
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 border-[#E6E6FA]/40 hover:bg-[#E6E6FA]/10 text-white"
              >
                Sort by...
              </Button>
            </div>
          </div>
        </section>

        {/* Itinerary Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Itinerary for a selected place
          </h2>
        </div>

        {/* Itinerary Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Day Labels */}
          <div className="space-y-6">
            {itineraryData.map((day) => (
              <div key={day.day} className="flex items-center">
                <div className="bg-[#E6E6FA] text-black px-4 py-2 rounded-lg font-bold">
                  Day {day.day}
                </div>
              </div>
            ))}
          </div>

          {/* Physical Activity Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center mb-4">
              Physical Activity
            </h3>
            {itineraryData.map((day) => (
              <div key={day.day} className="space-y-3">
                {day.activities.map((activity, index) => (
                  <div key={index} className="relative">
                    <Card className="hover-scale border-2 border-transparent bg-[#dbdbff]/80 hover:border-[#E6E6FA]/40 transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-black">
                          {activity.name}
                        </h4>
                        <p className="text-sm text-gray-500">{activity.type}</p>
                      </CardContent>
                    </Card>
                    {index < day.activities.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-[#E6E6FA]/40 -bottom-3"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Expense Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center mb-4">Expense</h3>
            {itineraryData.map((day) => (
              <div key={day.day} className="space-y-3">
                {day.activities.map((activity, index) => (
                  <div key={index} className="relative">
                    <Card className="hover-scale border-2 border-transparent bg-[#dbdbff]/80 hover:border-[#E6E6FA]/40 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <p className="text-lg font-bold text-black">
                          {activity.expense}
                        </p>
                      </CardContent>
                    </Card>
                    {index < day.activities.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-[#E6E6FA]/40 -bottom-3"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Total Budget Summary */}
        <Card className="mt-8 bg-[#dbdbff]/80 text-black">
          <CardHeader>
            <CardTitle className="text-xl">Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#E6E6FA]">$85</p>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">$115</p>
                <p className="text-sm text-gray-600">Remaining Budget</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">$200</p>
                <p className="text-sm text-gray-600">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ItineraryView;