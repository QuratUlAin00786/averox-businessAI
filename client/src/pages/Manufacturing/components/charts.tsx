import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LineChart as RechartsLineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type ChartDataItem = {
  name: string;
  value: number;
};

interface PieChartProps {
  data: ChartDataItem[];
}

export function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px]">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}`, 'Count']} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: ChartDataItem[];
}

export function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px]">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" name="Count" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

interface LineChartProps {
  data: any[];
  dataKey: string;
  xAxisDataKey?: string;
}

export function LineChart({ data, dataKey, xAxisDataKey = "name" }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px]">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}