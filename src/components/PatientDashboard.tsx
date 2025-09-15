import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Bell, Droplets, Gauge, HeartPulse, Search, Users, Activity, AlertTriangle, ClipboardList } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PatientDashboardProps {
  onRequestConsultation: () => void;
  onBack: () => void;
}

// KPI data (from screenshot)
const KPI_ITEMS = [
  { id: 'patients', title: 'Patients', value: 6025, delta: 6.85 },
  { id: 'new', title: 'New This Week', value: 4152, delta: 4.11 },
  { id: 'critical', title: 'Critical Alerts', value: 5948, delta: 92.05 },
  { id: 'appointments', title: 'Appointments', value: 5626, delta: 27.4 },
];

// Overview monthly data
const OVERVIEW_FULL = [
  { m: 'Jan', v: 12500 },
  { m: 'Feb', v: 14200 },
  { m: 'Mar', v: 15800 },
  { m: 'Apr', v: 17100 },
  { m: 'May', v: 18250 },
  { m: 'Jun', v: 19600 },
  { m: 'Jul', v: 47500 },
  { m: 'Aug', v: 21000 },
  { m: 'Sep', v: 22650 },
  { m: 'Oct', v: 24100 },
  { m: 'Nov', v: 25600 },
  { m: 'Dec', v: 27350 },
];

const DIAGNOSE_DATA = [
  { name: 'Neurology', value: 120, color: '#3B82F6' },
  { name: 'Oncology', value: 30, color: '#06B6D4' },
  { name: 'Urology', value: 24, color: '#FB7185' },
  { name: 'Cardio', value: 12, color: '#F59E0B' },
];

const initialSchedule = [
  { id: 's1', title: 'Pre-op Consultation', start: 8, end: 9, avatars: ['JS','AL'], color: '#1F8FFF' },
  { id: 's2', title: 'Blood Pressure Follow-up', start: 11.5, end: 12.5, avatars: ['MB'], color: '#1F8FFF' },
  { id: 's3', title: 'Migraine Evaluation', start: 14, end: 15, avatars: ['KL'], color: '#F97316' },
];

function KpiCard({ item, active, onClick }: { item: typeof KPI_ITEMS[number]; active?: boolean; onClick: (id: string) => void }) {
  return (
    <div
      role="button"
      onClick={() => onClick(item.id)}
      className={`rounded-[12px] bg-white p-4 shadow-[0_6px_18px_rgba(27,37,63,0.06)] cursor-pointer transition-transform ${active ? 'ring-2 ring-primary/30 scale-[1.01]' : ''}`}
    >
      <div className="text-sm text-muted-foreground">{item.title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">{item.value.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Since last week</div>
        </div>
        <div className={`text-sm font-medium ${item.delta >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{item.delta}%</div>
      </div>
    </div>
  );
}

function AvatarStack({ avatars }: { avatars: string[] }) {
  const visible = avatars.slice(0, 3);
  const more = avatars.length - visible.length;
  return (
    <div className="flex -space-x-3 items-center">
      {visible.map((a, i) => (
        <div key={i} className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-medium ring-2 ring-white shadow-sm" style={{background:'#EDEFF6'}}>{a}</div>
      ))}
      {more > 0 && <div className="h-8 w-8 rounded-full bg-muted/10 flex items-center justify-center text-xs font-medium ring-2 ring-white shadow-sm">+{more}</div>}
    </div>
  );
}

export default function PatientDashboard({ onRequestConsultation }: PatientDashboardProps) {
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [overviewRange, setOverviewRange] = useState<'1y'|'6m'|'3m'|'1m'>('1y');
  const [overviewData, setOverviewData] = useState(OVERVIEW_FULL);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [editing, setEditing] = useState<any | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [messageCount, setMessageCount] = useState(2);

  useEffect(() => {
    // simulate websocket updates for message count
    const t = setInterval(() => {
      setMessageCount((c) => (Math.random() > 0.7 ? c + Math.floor(Math.random()*2) : Math.max(0, c - (Math.random()>0.8?1:0))));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // update overviewData when range changes
    if (overviewRange === '1y') setOverviewData(OVERVIEW_FULL);
    if (overviewRange === '6m') setOverviewData(OVERVIEW_FULL.slice(6).concat(OVERVIEW_FULL.slice(0,6)));
    if (overviewRange === '3m') setOverviewData(OVERVIEW_FULL.slice(9));
    if (overviewRange === '1m') setOverviewData(OVERVIEW_FULL.slice(11));
  }, [overviewRange]);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
  }, []);

  const onKpiClick = (id: string) => {
    setSelectedKpi((s) => (s === id ? null : id));
    // simple visual filter: when selecting critical show only July big spike
    if (id === 'critical') setOverviewRange('1y');
  };

  const onDiagnosisClick = (name: string) => {
    setSelectedDiagnosis((s) => (s === name ? null : name));
  };

  // drag/drop handlers for schedule
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left; // 0..width
    const width = rect.width;
    const hour = 6 + (x / width) * 10; // map to 6..16
    setSchedule((s) => s.map((it) => (it.id === id ? { ...it, start: Math.max(6, Math.min(15, Math.round(hour*4)/4)), end: Math.max( it.start + 0.5, Math.round((Math.max(6, Math.min(15, Math.round(hour*4)/4))+0.5)*4)/4) } : it)));
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const openEdit = (id: string) => {
    const it = schedule.find(s => s.id === id);
    if (it) setEditing({ ...it });
  };
  const saveEdit = () => {
    if (!editing) return;
    setSchedule((s) => s.map((it) => it.id === editing.id ? editing : it));
    setEditing(null);
  };

  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(180deg,#F7FBFF 0%, #F4F8FF 100%)' }}>
      <div className="px-[32px] pt-6">
        <div className="flex justify-between h-[72px]">
          <div className="hidden md:flex items-center w-[650px] h-[60px] max-w-full rounded-[22px] bg-white/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_6px_18px_rgba(27,37,63,0.06)]">
            <Search className="h-4 w-4 ml-4 text-muted-foreground" />
            <input aria-label="Search" placeholder="Search anything here..." className="flex-1 bg-transparent outline-none px-3 text-[13px] placeholder:text-muted-foreground/70" />
            <div className="flex items-center gap-2 pr-2">
              <button aria-label="Notifications" className="relative h-[20px] w-[20px] rounded-full bg-neutral-400 shadow-inner flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-600" />
              </button>
              <Avatar className="h-10 w-10 border-0 ring-0 shadow-none bg-transparent">
                <AvatarImage alt="Profile" />
                <AvatarFallback className="h-[60%] w-[60%] m-auto bg-[#e4e4e4]">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[32px] pb-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-[24px]">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-[#111827]">Dashboard</h1>
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {today}
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            {KPI_ITEMS.map(k => (
              <KpiCard key={k.id} item={k} active={selectedKpi===k.id} onClick={onKpiClick} />
            ))}
          </div>

          {/* Overview + donut + schedule */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 mt-4">
            <Card className="border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[18px]">Overview</CardTitle>
                    <CardDescription>Avg per month</CardDescription>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Button variant={overviewRange==='1y'? 'secondary' : 'ghost'} size="sm" onClick={() => setOverviewRange('1y')}>1 Year</Button>
                    <Button variant={overviewRange==='6m'? 'secondary' : 'ghost'} size="sm" onClick={() => setOverviewRange('6m')}>6 Months</Button>
                    <Button variant={overviewRange==='3m'? 'secondary' : 'ghost'} size="sm" onClick={() => setOverviewRange('3m')}>3 Months</Button>
                    <Button variant={overviewRange==='1m'? 'secondary' : 'ghost'} size="sm" onClick={() => setOverviewRange('1m')}>1 Month</Button>
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
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(17,24,39,0.06)" />
                        <XAxis dataKey="m" tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Bar dataKey="v" radius={[6,6,0,0]} fill="#2B63F7" label={({ x, y, value, index }) => overviewData[index]?.m === 'Jul' ? <text x={x} y={y-8} fill="#111827" fontSize={12} fontWeight={600}>$47,500</text> : null}>
                          {overviewData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.m === 'Jul' ? '#1F8FFF' : '#E6F0FF'} />
                          ))}
                        </Bar>
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
                        <Pie data={DIAGNOSE_DATA} dataKey="value" startAngle={90} endAngle={-270} innerRadius={60} outerRadius={85} paddingAngle={2} cornerRadius={6} onClick={(d:any) => onDiagnosisClick(d?.name)}>
                          {DIAGNOSE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-4xl font-semibold">640</div>
                    {DIAGNOSE_DATA.map((d) => (
                      <div key={d.name} className={`flex items-center gap-2 ${selectedDiagnosis===d.name ? 'font-semibold' : ''}`}>
                        <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                        <span>{d.value} {d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today Schedule */}
          <Card className="mt-4 border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[18px]">Today Schedule</CardTitle>
                <div className="text-xs text-muted-foreground">September {new Date().getFullYear()}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="grid grid-cols-8 text-xs text-muted-foreground">
                  {['06:00','08:00','10:00','12:00','14:00','16:00','18:00',''].map((t,i) => (
                    <div key={i} className="h-6">{t}</div>
                  ))}
                </div>
                <div className="relative h-[96px] rounded-md bg-muted/40 mt-2" onDrop={onDrop} onDragOver={onDragOver}>
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/40" />
                  {schedule.map(s => {
                    const left = ((s.start - 6) / 12) * 100; // 6..18
                    const width = ((s.end - s.start) / 12) * 100;
                    return (
                      <button
                        key={s.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, s.id)}
                        onClick={() => openEdit(s.id)}
                        className="absolute top-4 h-10 rounded-full shadow-sm text-white text-xs px-3 flex items-center gap-2"
                        style={{ left: `${left}%`, width: `${Math.max(6, width)}%`, background: s.color }}
                        aria-label={s.title}
                      >
                        <AvatarStack avatars={s.avatars} />
                        <span className="truncate">{s.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lower info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px] mt-6">
            <Card className="rounded-[12px] border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
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

            <Card className="rounded-[12px] border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
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

            <Card className="rounded-[12px] border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <CardTitle className="text-[18px] font-semibold leading-[1.1]">Messages</CardTitle>
                </div>
                <CardDescription className="text-[13px]">{messageCount} unread messages</CardDescription>
              </CardHeader>
              <CardContent className="text-[13px] text-muted-foreground">Check updates from your doctor.</CardContent>
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card className="rounded-[16px] border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px] font-semibold leading-[1.1]">Avg Diagnose</CardTitle>
              <CardDescription className="text-[13px]">Total Patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-[140px] h-[140px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={DIAGNOSE_DATA} dataKey="value" startAngle={90} endAngle={-270} innerRadius={48} outerRadius={70} paddingAngle={2} cornerRadius={6} onClick={(d:any) => onDiagnosisClick(d?.name)}>
                        {DIAGNOSE_DATA.map((entry, index) => (
                          <Cell key={`c-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-2xl font-semibold">640</div>
                  {DIAGNOSE_DATA.map((d) => (
                    <div key={d.name} className={`flex items-center gap-2 ${selectedDiagnosis===d.name ? 'font-semibold' : ''}`}>
                      <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                      <span>{d.value} {d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[16px] border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px] font-semibold leading-[1.1]">Latest Visits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[{name:'Esther Howard',dept:'Dermatology',time:'Today 8:44'},{name:'Eleanor Pena',dept:'Gastroenterology',time:'Today 8:54'},{name:'Brooklyn Simmons',dept:'Ophthalmology',time:'Yesterday 7:39'}].map((v,i)=>(
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage />
                      <AvatarFallback>{v.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
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

          <Card className="rounded-[16px] border-0 shadow-[0_6px_18px_rgba(27,37,63,0.06)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[18px] font-semibold leading-[1.1]">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-2 pb-6">
              <div className="rounded-md w-full p-3">
                <div className="flex pr-[10px] justify-center items-start">
                  <Calendar mode="single" numberOfMonths={1} selected={date} onSelect={setDate} className="rounded-md w-full max-w-none" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Edit dialog for schedule items */}
      <Dialog open={!!editing} onOpenChange={(o) => { if(!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <label className="text-sm">Title</label>
              <input value={editing.title} onChange={(e) => setEditing({...editing, title: e.target.value})} className="input bg-muted/10 p-2 rounded" />
              <label className="text-sm">Start</label>
              <input type="number" value={editing.start} onChange={(e) => setEditing({...editing, start: Number(e.target.value)})} className="input bg-muted/10 p-2 rounded" />
              <label className="text-sm">End</label>
              <input type="number" value={editing.end} onChange={(e) => setEditing({...editing, end: Number(e.target.value)})} className="input bg-muted/10 p-2 rounded" />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={saveEdit}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
