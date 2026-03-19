import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const trafficData = [
  { date: 'Mar 1', visitors: 3 },
  { date: 'Mar 3', visitors: 5 },
  { date: 'Mar 5', visitors: 8 },
  { date: 'Mar 7', visitors: 4 },
  { date: 'Mar 9', visitors: 12 },
  { date: 'Mar 11', visitors: 7 },
  { date: 'Mar 13', visitors: 9 },
  { date: 'Mar 15', visitors: 14 },
  { date: 'Mar 17', visitors: 11 },
  { date: 'Mar 19', visitors: 18 },
];

const countries = [
  { flag: '🇺🇸', name: 'United States', visitors: 12 },
  { flag: '🇬🇷', name: 'Greece', visitors: 2 },
  { flag: '🇷🇴', name: 'Romania', visitors: 2 },
  { flag: '🇨🇳', name: 'China', visitors: 1 },
  { flag: '🇨🇦', name: 'Canada', visitors: 1 },
];

const totalVisitors = countries.reduce((s, c) => s + c.visitors, 0);

const kpis = [
  { label: 'Visitors', value: totalVisitors.toString() },
  { label: 'Page Views', value: '47' },
  { label: 'Bounce Rate', value: '42%' },
  { label: 'Avg. Duration', value: '1m 24s' },
];

const Index = () => (
  <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]">
    {/* Header */}
    <header className="border-b border-[#1e1e2a] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <h1 className="text-lg font-semibold text-white tracking-tight font-body">
          carshake.online
        </h1>
      </div>
      <span className="text-xs text-[#71717a] font-body">Last 30 days</span>
    </header>

    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-5"
          >
            <p className="text-xs text-[#71717a] font-body uppercase tracking-widest mb-2">
              {kpi.label}
            </p>
            <p className="text-2xl font-semibold text-white font-body">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-6">
        <h2 className="text-sm font-semibold text-[#a1a1aa] font-body uppercase tracking-widest mb-6">
          Traffic
        </h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a25',
                  border: '1px solid #2a2a3a',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#e4e4e7',
                }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorVisitors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Countries */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-6">
        <h2 className="text-sm font-semibold text-[#a1a1aa] font-body uppercase tracking-widest mb-5">
          Visitors by Country
        </h2>
        <div className="space-y-3">
          {countries.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-xl">{c.flag}</span>
              <span className="flex-1 text-sm text-[#d4d4d8] font-body">{c.name}</span>
              {/* bar */}
              <div className="w-32 h-2 rounded-full bg-[#1e1e2a] overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${(c.visitors / totalVisitors) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-white font-body w-8 text-right">
                {c.visitors}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default Index;
