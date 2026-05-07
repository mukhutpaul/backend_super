"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Données mock (tu remplaceras par API Spring Boot)
const data = [
  { name: "Lun", presents: 2200, absents: 350 },
  { name: "Mar", presents: 2100, absents: 420 },
  { name: "Mer", presents: 2300, absents: 300 },
  { name: "Jeu", presents: 2250, absents: 380 },
  { name: "Ven", presents: 2400, absents: 260 },
  { name: "Sam", presents: 2000, absents: 500 },
  { name: "Dim", presents: 1950, absents: 520 },
];

export default function PoliceChart() {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300 p-4">

      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Évolution des effectifs
        </h2>

        <p className="text-sm text-base-content/60">
          Présence vs Absence (7 derniers jours)
        </p>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
              </linearGradient>

              <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Legend />

            {/* Présents */}
            <Area
              type="monotone"
              dataKey="presents"
              stroke="#16a34a"
              fillOpacity={1}
              fill="url(#colorPresent)"
            />

            {/* Absents */}
            <Area
              type="monotone"
              dataKey="absents"
              stroke="#dc2626"
              fillOpacity={1}
              fill="url(#colorAbsent)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>
    </div>
  );
}