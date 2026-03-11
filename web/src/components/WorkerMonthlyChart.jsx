import { Card } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WorkerMonthlyChart({ data = [] }) {
  return (
    <Card title="Thu nhập theo tháng" style={{ marginTop: 16 }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total_money" stroke="#1677ff" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}