import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bell, Calendar, ChevronRight, HeartPulse, Users, Activity, AlertTriangle, ClipboardList, Search } from "lucide-react";

interface DoctorDashboardProps {
  onConnectPatient: (patientId: string) => void;
  onBack: () => void;
}

// Sample datasets crafted to resemble the reference
const kpi = {
  patients: { value: 6025, delta: 8.95 },
  newThisWeek: { value: 4152, delta: 5.12 },
  criticalAlerts: { value: 5948, delta: -9.05 },
  appointments: { value: 5626, delta: 2.74 },
};

const overviewData = [
  { m: "Jan", v: 12500 },
  { m: "Feb", v: 14200 },
  { m: "Mar", v: 15800 },
  { m: "Apr", v: 17100 },
  { m: "May", v: 18250 },
  { m: "Jun", v: 19600 },
  { m: "Jul", v: 47500 },
  { m: "Aug", v: 21000 },
  { m: "Sep", v: 22650 },
  { m: "Oct", v: 24100 },
  { m: "Nov", v: 25600 },
  { m: "Dec", v: 27350 },
];

const diagnoseData = [
  { name: "Neurology", value: 120, color: "#3B82F6" },
  { name: "Oncology", value: 30, color: "#06B6D4" },
  { name: "Urology", value: 24, color: "#EF4444" },
  { name: "Cardio", value: 12, color: "#F59E0B" },
];

const latestVisits = [
  { name: "Esther Howard", dept: "Dermatology", time: "Today 8:44" },
  { name: "Eleanor Pena", dept: "Gastroenterology", time: "Today 10:20" },
  { name: "Brooklyn Simmons", dept: "Neurology", time: "Yesterday 16:03" },
  { name: "Guy Hawkins", dept: "Urology", time: "Yesterday 11:19" },
];

const schedule = [
  { id: "p1", title: "Pre-op Consultation", start: 9, end: 10, avatars: ["JS", "JD", "SJ"], color: "#1F8FFF" },
  { id: "p2", title: "Blood Pressure Follow-up", start: 12, end: 12.75, avatars: ["AM", "RB"], color: "#1F8FFF" },
  { id: "p3", title: "Migraine Evaluation", start: 14, end: 15, avatars: ["KL"], color: "#F05252" },
];

function Stat({ icon, label, value, delta, danger = false }: { icon: JSX.Element; label: string; value: number; delta: number; danger?: boolean }) {
  const up = delta >= 0;
  return (
    <Card className="border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="text-sm">{label}</span>
          </div>
          <span className={`text-xs font-medium ${up ? "text-green-600" : "text-red-600"}`}>{Math.abs(delta).toFixed(2)}%</span>
        </div>
        <CardTitle className="text-2xl">{value.toLocaleString()}</CardTitle>
        <CardDescription>{up ? "Since last week" : "Since last week"}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function DoctorDashboard({ onConnectPatient }: DoctorDashboardProps) {
  const [range, setRange] = useState("y1");

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
  }, []);

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(180deg,#F7FBFF 0%, #F4F8FF 100%)" }}>
      {/* Top search bar */}
      <div className="px-[32px] pt-6">
        <div className="flex justify-between h-[72px]">
          <div className="hidden md:flex items-center w-[650px] h-[50px] max-w-full rounded-[22px] bg-white/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_6px_18px_rgba(27,37,63,0.06)]">
            <Search className="h-4 w-4 ml-4 text-muted-foreground" />
            <input aria-label="Search" placeholder="Search anything here..." className="flex-1 bg-transparent outline-none px-3 text-[13px] placeholder:text-muted-foreground/70" />
            <div className="flex items-center gap-2 pr-2">
              <button aria-label="Notifications" className="relative h-[30px] w-[30px] rounded-full bg-neutral-400 shadow-inner flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-600" />
              </button>
              <Avatar className="h-10 w-10 border-0 ring-0 shadow-none bg-transparent">
                <AvatarImage alt="Profile" />
                <AvatarFallback className="h-[80%] w-[80%] m-auto bg-[#e4e4e4]">DS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="px-[32px] pb-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-[24px]">
        <div>
          {/* Header and tabs */}
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-[#111827]">Dashboard</h1>
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {today}
            </div>
          </div>

          <div className="mt-4">
            <Tabs value={range} onValueChange={(v) => setRange(v)}>
              <TabsList className="rounded-full h-9 bg-muted/50">
                <TabsTrigger value="y1" className="data-[state=active]:bg-background rounded-full text-[13px]">Overview</TabsTrigger>
                <TabsTrigger value="mrep" className="data-[state=active]:bg-background rounded-full text-[13px]">Medical Reports</TabsTrigger>
                <TabsTrigger value="pov" className="data-[state=active]:bg-background rounded-full text-[13px]">Patients Overview</TabsTrigger>
                <TabsTrigger value="diag" className="data-[state=active]:bg-background rounded-full text-[13px]">Diagnose</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <Stat icon={<Users className="h-4 w-4" />} label="Patients" value={kpi.patients.value} delta={kpi.patients.delta} />
            <Stat icon={<Activity className="h-4 w-4" />} label="New This Week" value={kpi.newThisWeek.value} delta={kpi.newThisWeek.delta} />
            <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Critical Alerts" value={kpi.criticalAlerts.value} delta={kpi.criticalAlerts.delta} danger />
            <Stat icon={<ClipboardList className="h-4 w-4" />} label="Appointments" value={kpi.appointments.value} delta={kpi.appointments.delta} />
          </div>

          {/* Overview + Avg Diagnose */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 mt-4">
            <Card className="border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[18px]">Overview</CardTitle>
                    <CardDescription>Avg per month</CardDescription>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary" className="rounded-full">1 Year</Badge>
                    <Badge variant="outline" className="rounded-full">6 Months</Badge>
                    <Badge variant="outline" className="rounded-full">3 Months</Badge>
                    <Badge variant="outline" className="rounded-full">1 Month</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-center">
                  <div>
                    <div className="text-3xl font-semibold">$138,500</div>
                    <div className="text-xs text-green-600 mt-1">13.4%</div>
                    <div className="mt-4 text-sm text-muted-foreground">July 2024</div>
                    <div className="text-xl font-medium">$47,500</div>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer>
                      <BarChart data={overviewData} barSize={18} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="m" tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#1F8FFF" />
                        <Tooltip />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[18px]">Avg Diagnose</CardTitle>
                <CardDescription>Total Patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={diagnoseData} dataKey="value" startAngle={90} endAngle={-270} innerRadius={60} outerRadius={85} paddingAngle={2} cornerRadius={6}>
                          {diagnoseData.map((entry, index) => (
                            <path key={index} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-4xl font-semibold">640</div>
                    {diagnoseData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                        <span>{d.value} {d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today schedule */}
          <Card className="mt-4 border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[18px]">Today Schedule</CardTitle>
                <div className="text-xs text-muted-foreground">September {new Date().getFullYear()}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* time grid */}
                <div className="grid grid-cols-8 text-xs text-muted-foreground">
                  {["06:00","09:00","10:00","12:00","13:00","14:00","16:00",""].map((t, i) => (
                    <div key={i} className="h-6">{t}</div>
                  ))}
                </div>
                <div className="relative h-[84px] rounded-md bg-muted/40">
                  {/* vertical pin at 12:00 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/50" />
                  {/* events */}
                  {schedule.map((s) => {
                    const left = ((s.start - 6) / 10) * 100; // 06 to 16 span
                    const width = ((s.end - s.start) / 10) * 100;
                    return (
                      <button
                        key={s.id}
                        className="absolute top-4 h-10 rounded-full shadow-sm text-white text-xs px-3 flex items-center gap-2"
                        style={{ left: `${left}%`, width: `${width}%`, background: s.color }}
                        onClick={() => onConnectPatient(s.id)}
                        aria-label={s.title}
                      >
                        <div className="flex -space-x-2">
                          {s.avatars.map((a, idx) => (
                            <Avatar key={idx} className="h-6 w-6 border-2 border-white">
                              <AvatarImage />
                              <AvatarFallback>{a}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="truncate">{s.title}</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-80" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card className="border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px]">Latest Visits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestVisits.map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage />
                      <AvatarFallback>{v.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{v.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{v.dept}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{v.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="secondary" className="rounded-full">Add Report</Button>
              <Button variant="secondary" className="rounded-full">Schedule</Button>
              <Button variant="secondary" className="rounded-full">New Patient</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
