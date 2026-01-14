import React from 'react';
import {
    BarChart, Bar, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area, XAxis
} from 'recharts';

interface DashboardChartsProps {
    type: 'visitors' | 'categories';
    data: any;
    colors?: string[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ type, data, colors }) => {
    if (type === 'visitors') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#visitorGradient)"
                    />
                    <Tooltip
                        cursor={{ stroke: '#3b82f6', strokeDasharray: '5 5' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px',
                            background: 'white'
                        }}
                        labelFormatter={(_, payload) => {
                            if (payload && payload[0]) {
                                return payload[0].payload.fullDate;
                            }
                            return '';
                        }}
                        formatter={(value: any) => [`${value} Ziyaretçi`, '']}
                    />
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    if (type === 'categories') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={(colors || [])[index % (colors?.length || 1)]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value} Adet`, 'Satış']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: any) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return null;
};

export default DashboardCharts;
