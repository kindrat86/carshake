import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const trafficData = [
  { date: 'Mar 12', visitors: 7 },
  { date: 'Mar 13', visitors: 5 },
  { date: 'Mar 14', visitors: 3 },
  { date: 'Mar 15', visitors: 4 },
  { date: 'Mar 16', visitors: 2 },
  { date: 'Mar 17', visitors: 1 },
  { date: 'Mar 18', visitors: 1 },
];

const countries = [
  { flag: '🇺🇸', name: 'United States', visitors: 12 },
  { flag: '🇬🇷', name: 'Greece', visitors: 2 },
  { flag: '🇷🇴', name: 'Romania', visitors: 2 },
  { flag: '🇨🇳', name: 'China', visitors: 1 },
  { flag: '🇨🇦', name: 'Canada', visitors: 1 },
];

const sources = [
  { name: 'Direct', value: 20 },
  { name: 'perplexity.ai', value: 1 },
  { name: 'reddit.com', value: 1 },
];

const pages = [
  { name: '/', value: 22 },
  { name: '/auth', value: 3 },
];

const devices = [
  { name: 'Desktop', pct: 72.7 },
  { name: 'Mobile', pct: 27.3 },
];

const kpis = [
  { label: 'Visitors', value: '23' },
  { label: 'Pageviews', value: '93' },
  { label: 'Views Per Visit', value: '4.04' },
  { label: 'Visit Duration', value: '16m 54s' },
  { label: 'Bounce Rate', value: '89%' },
];

const totalCountry = countries.reduce((s, c) => s + c.visitors, 0);

const Index = () => (
  <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]">
    <header className="border-b border-[#1e1e2a] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white tracking-tight font-body">Web Analytics</h1>
        <div className="flex items-center gap-1.5 text-xs text-[#71717a] font-body">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          0 current visitors
        </div>
      </div>
      <span className="text-xs text-[#71717a] font-body">Last 7 days</span>
    </header>

    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-4">
            <p className="text-[10px] text-[#71717a] font-body uppercase tracking-widest mb-1.5">{kpi.label}</p>
            <p className="text-xl font-semibold text-white font-body">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-6">
        <h2 className="text-xs font-semibold text-[#71717a] font-body uppercase tracking-widest mb-5">Visitors</h2>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 8]} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12, color: '#e4e4e7' }} />
              <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} fill="url(#cv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2x2 Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sources */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-5">
          <h2 className="text-xs font-semibold text-[#71717a] font-body uppercase tracking-widest mb-4">Sources</h2>
          <div className="space-y-2.5">
            {sources.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm font-body">
                <span className="text-[#d4d4d8]">{s.name}</span>
                <span className="text-white font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pages */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-5">
          <h2 className="text-xs font-semibold text-[#71717a] font-body uppercase tracking-widest mb-4">Pages</h2>
          <div className="space-y-2.5">
            {pages.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm font-body">
                <span className="text-[#d4d4d8] font-mono text-xs">{p.name}</span>
                <span className="text-white font-semibold">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-5">
          <h2 className="text-xs font-semibold text-[#71717a] font-body uppercase tracking-widest mb-4">Countries</h2>
          <div className="space-y-2.5">
            {countries.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5">
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 text-sm text-[#d4d4d8] font-body">{c.name}</span>
                <div className="w-20 h-1.5 rounded-full bg-[#1e1e2a] overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(c.visitors / totalCountry) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-white font-body w-6 text-right">{c.visitors}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2a] p-5">
          <h2 className="text-xs font-semibold text-[#71717a] font-body uppercase tracking-widest mb-4">Devices</h2>
          <div className="space-y-3">
            {devices.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-[#d4d4d8]">{d.name}</span>
                  <span className="text-white font-semibold">{d.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1e1e2a] overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default Index;
