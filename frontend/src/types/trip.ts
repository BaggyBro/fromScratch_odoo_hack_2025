export interface City {
  id: number;
  name: string;
  country: string;
  activities: Array<{
    id: number;
    name: string;
    description: string;
    cost: number;
  }>;
}

export interface Stop {
  id: number;
  city: City;
  arrivalDate: string;
  departureDate: string;
}

export interface StopActivity {
  id: number;
  city: City;
  activity: {
    id: number;
    name: string;
    description: string;
    cost: number;
  };
  date: string;
}

export interface Budget {
  id: number;
  amount: number;
  category: string;
  description: string;
}

export interface Suggestion {
  id: number;
  content: string;
  type: string;
}

export interface Trip {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  stops: Stop[];
  stopActivities: StopActivity[];
  budgets: Budget[];
  suggestions: Suggestion[];
}

export interface CreateTripData {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface UpdateTripData extends Partial<CreateTripData> {}

export interface CreateBudgetData {
  amount: number;
  category: string;
  description?: string;
} 