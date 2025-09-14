import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Droplets, Gauge, HeartPulse, Search } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface PatientDashboardProps {
  onRequestConsultation: () => void;
  onBack: () => void;
}

const weeklyData = [
  { label: "1", value: 540 },
  { label: "2", value: 560 },
  { label: "3", value: 600 },
  { label: "4", value: 580 },
  { label: "5", value: 620 },
  { label: "6", value: 590 },
  { label: "7", value: 640 },
];

const monthlyData = [
  { label: "Jan", value: 520 },
  { label: "Feb", value: 560 },
  { label: "Mar", value: 610 },
  { label: "Apr", value: 580 },
  { label: "May", value: 640 },
  { label: "Jun", value: 600 },
  { label: "Jul", value: 680 },
  { label: "Aug", value: 620 },
  { label: "Sep", value: 700 },
  { label: "Oct", value: 660 },
  { label: "Nov", value: 720 },
  { label: "Dec", value: 690 },
];

const StatCard = ({
  title,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  subtitle: string;
  icon: JSX.Element;
  gradient: string;
}) => (
  <div className={`rounded-2xl p-5 md:p-6 ${gradient} text-white shadow-sm`}> 
    <div className="flex items-center justify-between">
      <div className="bg-white/20 rounded-xl p-3">{icon}</div>
    </div>
    <div className="mt-6">
      <p className="text-sm/5 opacity-90">{title}</p>
      <p className="text-2xl md:text-3xl font-semibold mt-1">{subtitle}</p>
    </div>
  </div>
);

const PatientDashboard = ({ onRequestConsultation }: PatientDashboardProps) => {
  const [range, setRange] = useState<"weekly" | "monthly">("monthly");

  const chartData = useMemo(() => (range === "weekly" ? weeklyData : monthlyData), [range]);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className="min-h-full bg-background">
      <div className="px-4 md:px-8 py-6 md:py-8">
        {/* Top row: Search + Date */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 h-10 rounded-xl bg-muted/40 border-none focus-visible:ring-1" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{today}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mt-6">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
          <StatCard
            title="Heart Rate"
            subtitle="80 BPM"
            icon={<HeartPulse className="h-6 w-6 text-white" />}
            gradient="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600"
          />
          <StatCard
            title="Blood Pressure"
            subtitle="120/80 mmHg"
            icon={<Gauge className="h-6 w-6 text-white" />}
            gradient="bg-gradient-to-br from-cyan-500 via-indigo-400 to-indigo-600"
          />
          <StatCard
            title="Glucose Level"
            subtitle="60 - 80 mg/dL"
            icon={<Droplets className="h-6 w-6 text-white" />}
            gradient="bg-gradient-to-br from-pink-500 via-fuchsia-400 to-fuchsia-600"
          />
        </div>

        {/* Activity chart */}
        <Card className="mt-6 rounded-2xl">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Activity</CardTitle>
            <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ stroke: "hsl(var(--ring))", strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation & Treatment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>What is Arteriosclerosis and how do I prevent it?</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="rounded-xl">Read More</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Treatment</CardTitle>
              <CardDescription>Vitamin A – 1 tablet twice a day</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button onClick={onRequestConsultation} className="rounded-xl">Consultation</Button>
              <Button variant="outline" className="rounded-xl">Remind Me</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
