import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Bell, Droplets, Gauge, HeartPulse, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

// Chart data to match requested wave shape (0..11)
const chartRows = [
  { x: 0, p: 400, s: 320 },
  { x: 1, p: 480, s: 420 },
  { x: 2, p: 360, s: 380 },
  { x: 3, p: 540, s: 440 },
  { x: 4, p: 600, s: 500 },
  { x: 5, p: 520, s: 560 },
  { x: 6, p: 760, s: 600 },
  { x: 7, p: 680, s: 620 },
  { x: 8, p: 590, s: 580 },
  { x: 9, p: 620, s: 600 },
  { x: 10, p: 650, s: 620 },
  { x: 11, p: 670, s: 640 },
];

const hexPattern = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 86' opacity='0.08'>
    <defs>
      <pattern id='hex' width='17.32' height='30' patternUnits='userSpaceOnUse' patternTransform='scale(1)'>
        <polygon points='8.66,0 17.32,5 17.32,15 8.66,20 0,15 0,5' fill='white'/>
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(#hex)'/>
  </svg>`
);

function StatCard({
  title,
  value,
  gradient,
  icon,
}: {
  title: string;
  value: string;
  gradient: string;
  icon: JSX.Element;
}) {
  return (
    <div
      className="rounded-[16px] bg-white shadow-[0_6px_18px_rgba(27,37,63,0.06)] p-3"
      aria-label={`${title} card`}
    >
      <div
        className="relative rounded-[14px] p-4 md:p-5 min-h-[112px]"
        style={{
          backgroundImage: `${gradient}, url("data:image/svg+xml;utf8,${hexPattern}")`,
          backgroundBlendMode: "overlay",
          backgroundSize: "cover, 180px",
          boxShadow: "inset 0 2px 6px rgba(255,255,255,0.6)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="h-9 w-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            {icon}
          </div>
        </div>
        <div className="mt-6">
          <p className="text-[18px] font-semibold leading-[1.1] text-[#111827]">{title}</p>
          <p className="text-[14px] font-medium leading-[1.4] text-[#111827]/80 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

const PatientDashboard = ({ onRequestConsultation }: PatientDashboardProps) => {
  const [range, setRange] = useState("monthly");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
  }, []);

  return (
    <div
      className="min-h-full"
      style={{ background: "linear-gradient(180deg,#F7FBFF 0%, #F4F8FF 100%)" }}
    >
      {/* Top bar inside canvas */}
      <div className="px-[32px] pt-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Left spacer for logo area */}
          <div className="w-[112px] shrink-0" />
          {/* Search pill */}
          <div className="hidden md:flex items-center w-[520px] h-[42px] rounded-[22px] bg-white/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_6px_18px_rgba(27,37,63,0.06)]">
            <Search className="h-4 w-4 ml-4 text-muted-foreground" />
            <input
              aria-label="Search"
              placeholder="Search…"
              className="flex-1 bg-transparent outline-none px-3 text-[13px] placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center gap-2 pr-2">
              <button aria-label="Notifications" className="relative h-8 w-8 rounded-full bg-white/80 shadow-inner flex items-center justify-center">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
              <Avatar className="h-9 w-9 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
                <AvatarImage alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="ml-auto" />
        </div>
      </div>

      {/* Main content grid: left (main) + right rail */}
      <div className="px-[32px] pb-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-[24px]">
        <div>
          {/* Title */}
          <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-[#111827]">Dashboard</h1>

          {/* Status cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            <StatCard
              title="Heart Rate"
              value="80 BPM"
              icon={<HeartPulse className="h-5 w-5 text-blue-600" />}
              gradient="radial-gradient(120%_120%at_0%_0%,#E8EEFF 0%,transparent 60%), linear-gradient(135deg,#E8EEFF 0%,#CFD8FF 100%)"
            />
            <StatCard
              title="Blood Pressure"
              value="120/80 mmHG"
              icon={<Gauge className="h-5 w-5 text-cyan-600" />}
              gradient="radial-gradient(120%_120%at_0%_0%,#E7F9FF 0%,transparent 60%), linear-gradient(135deg,#E7F9FF 0%,#DFF7FF 100%)"
            />
            <StatCard
              title="Glucose Level"
              value="60 - 80 mg/dl"
              icon={<Droplets className="h-5 w-5 text-pink-600" />}
              gradient="radial-gradient(120%_120%at_0%_0%,#FFF0FB 0%,transparent 60%), linear-gradient(135deg,#FFF0FB 0%,#F6D9F9 100%)"
            />
          </div>

          {/* Activity card with chart */}
          <Card className="mt-6 rounded-[16px] shadow-[var(--shadow-1,0_6px_18px_rgba(27,37,63,0.06))]">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-2">
              <CardTitle className="text-[18px] font-semibold leading-[1.1]">Activity</CardTitle>
              <Tabs value={range} onValueChange={(v) => setRange(v)}>
                <TabsList className="rounded-full h-9 bg-muted/50">
                  <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full text-[13px]">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full text-[13px]">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full text-[13px]">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] rounded-[12px] bg-white shadow-[0_6px_18px_rgba(27,37,63,0.06)] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                    <XAxis dataKey="x" tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 800]}
                      ticks={[0, 200, 400, 600, 800]}
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgba(44,138,255,0.18)", strokeWidth: 1, strokeDasharray: "4 4" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="rounded-md bg-white/95 shadow-lg border px-3 py-2 text-[12px]">
                            <div className="font-medium">x: {label}</div>
                            <div className="text-blue-600">Primary: ${payload[0].value as number}</div>
                            {payload[1] && <div className="text-sky-500">Secondary: ${payload[1].value as number}</div>}
                          </div>
                        );
                      }}
                    />
                    <Line type="monotone" dataKey="p" stroke="#2B63F7" strokeWidth={3.5} dot={{ r: 0 }} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="s" stroke="#9FC6FF" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lower info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px] mt-6">
            <Card className="rounded-[12px] shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <CardTitle className="text-[18px] font-semibold leading-[1.1]">Recommendation</CardTitle>
                </div>
                <CardDescription className="text-[13px]">What is Arteriosclerosis and how do I prevent it?</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="rounded-[12px] text-[13px]">Read More</Button>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <CardTitle className="text-[18px] font-semibold leading-[1.1]">Treatment</CardTitle>
                </div>
                <CardDescription className="text-[13px]">Vitamin A – 1 tablet twice a day</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Button onClick={onRequestConsultation} className="rounded-[12px] text-[13px]">Consultation</Button>
                <Button variant="outline" className="rounded-[12px] text-[13px]">Remind Me</Button>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <CardTitle className="text-[18px] font-semibold leading-[1.1]">Messages</CardTitle>
                </div>
                <CardDescription className="text-[13px]">2 unread messages</CardDescription>
              </CardHeader>
              <CardContent className="text-[13px] text-muted-foreground">Check updates from your doctor.</CardContent>
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card className="rounded-[16px] shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[18px] font-semibold leading-[1.1]">Calendar</CardTitle>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  April 2023
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Calendar mode="single" numberOfMonths={1} selected={date} onSelect={setDate} className="rounded-md border w-full max-w-none" />
            </CardContent>
          </Card>

          <Card className="rounded-[16px] shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px] font-semibold leading-[1.1]">Doctors</CardTitle>
              <CardDescription className="text-[13px]">Available today</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {["Austin","María","Ava"].map((name, i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage alt={`${name} avatar`} />
                      <AvatarFallback>{name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="text-[13px]">
                      <div className="font-medium">Dr. {name}</div>
                      <div className="text-muted-foreground">Cardiologist</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">A+</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[16px] shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px] font-semibold leading-[1.1]">Details</CardTitle>
              <CardDescription className="text-[13px]">Patient stats</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="p-3 rounded-md bg-muted/40">
                <div className="text-muted-foreground">Blood Group</div>
                <div className="font-semibold">A+</div>
              </div>
              <div className="p-3 rounded-md bg-muted/40">
                <div className="text-muted-foreground">Height</div>
                <div className="font-semibold">172 cm</div>
              </div>
              <div className="p-3 rounded-md bg-muted/40">
                <div className="text-muted-foreground">Weight</div>
                <div className="font-semibold">64 kg</div>
              </div>
              <div className="p-3 rounded-md bg-muted/40">
                <div className="text-muted-foreground">BMI</div>
                <div className="font-semibold">21.6</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
