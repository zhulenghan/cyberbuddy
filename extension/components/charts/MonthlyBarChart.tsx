import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MonthlyBarChartProps {
  data: Array<{
    day: string
    duration: number
  }>
  currentDay?: string
}

export function MonthlyBarChart({ data, currentDay }: MonthlyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: '#000' }}
          stroke="#909090"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#000' }}
          stroke="#909090"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #D9D9D9',
            borderRadius: '4px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${value} min`, 'Focus Time']}
        />
        <Bar
          dataKey="duration"
          fill={(entry: any) => entry.day === currentDay ? '#909090' : '#C6C6C6'}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
