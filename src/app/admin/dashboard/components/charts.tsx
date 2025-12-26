'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const userData = [
  { name: 'Jan', users: 4000 },
  { name: 'Feb', users: 3000 },
  { name: 'Mar', users: 2000 },
  { name: 'Apr', users: 2780 },
  { name: 'May', users: 1890 },
  { name: 'Jun', users: 2390 },
  { name: 'Jul', users: 3490 },
];

const transactionData = [
  { name: 'Jan', transactions: 2400 },
  { name: 'Feb', transactions: 1398 },
  { name: 'Mar', transactions: 9800 },
  { name: 'Apr', transactions: 3908 },
  { name: 'May', transactions: 4800 },
  { name: 'Jun', transactions: 3800 },
  { name: 'Jul', transactions: 4300 },
];

export function UserChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={userData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="users" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TransactionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={transactionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="transactions" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
