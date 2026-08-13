import {
  Area,
  AreaChart,
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
} from 'recharts'

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid hsl(262 20% 90%)',
  boxShadow: '0 8px 24px rgba(63, 37, 116, 0.08)',
  fontSize: '12px',
}

export function TrendChart({
  data,
  dataKey,
  color = '#5737A8',
  unit = '',
  height = 220,
}: {
  data: { t: string }[]
  dataKey: string
  color?: string
  unit?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(262 20% 93%)" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={(v: string) => {
            const d = new Date(v)
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          width={56}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${value}${unit}`, '']}
          labelFormatter={(label) => new Date(label as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MultiLineChart({
  data,
  series,
  height = 240,
}: {
  data: Record<string, string | number>[]
  series: { key: string; name: string; color: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(262 20% 93%)" vertical={false} />
        <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} minTickGap={24} tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={56} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BarsChart({
  data,
  dataKey,
  color = '#5737A8',
  height = 240,
  xKey = 'name',
}: {
  data: Record<string, string | number>[]
  dataKey: string
  color?: string
  height?: number
  xKey?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(262 20% 93%)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(262 20% 96%)' }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const donutColors = ['#5737A8', '#9A73DF', '#B79AEA', '#E7DDFB', '#F59E0B', '#22A55A', '#3B82F6', '#EF4444']

export function DonutChart({
  data,
  height = 200,
  colors,
}: {
  data: { name: string; value: number }[]
  height?: number
  colors?: string[]
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
          {data.map((_, i) => (
            <Cell key={i} fill={(colors ?? donutColors)[i % (colors ?? donutColors).length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}
