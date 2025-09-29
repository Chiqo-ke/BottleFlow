"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { usePurchases, useWorkerPayments } from '@/lib/hooks/useApi';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const purchaseChartConfig = {
    cost: {
        label: "Purchases",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const salaryChartConfig = {
    salary: {
        label: "Salaries",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function ExpensesClient() {
    const [period, setPeriod] = useState<Period>('monthly');
    const { data: purchases, loading: purchasesLoading } = usePurchases();
    const { data: workerPayments, loading: paymentsLoading } = useWorkerPayments(null);
    
    const loading = purchasesLoading || paymentsLoading;

    const getTotalSalariesPaid = () => {
        if (!workerPayments) return 0;
        return workerPayments.reduce((total, payment) => total + payment.amount, 0);
    }

    const getFormattedData = (p: Period) => {
        const totalSalariesPaid = getTotalSalariesPaid();
        const totalPurchasesPaid = purchases ? purchases.reduce((acc, p) => acc + p.amountPaid, 0) : 0;

        // Mock data aggregation based on period
        if (p === 'daily') {
            return [
                { date: 'Today', purchases: totalPurchasesPaid, salaries: totalSalariesPaid },
                { date: 'Yesterday', purchases: 150, salaries: 45 },
            ]
        }
        if (p === 'weekly') {
            return [
                { date: 'This Week', purchases: totalPurchasesPaid, salaries: totalSalariesPaid },
                { date: 'Last Week', purchases: 750, salaries: 280 },
            ]
        }
        if (p === 'yearly') {
            return [
                { date: 'This Year', purchases: totalPurchasesPaid, salaries: totalSalariesPaid },
                { date: 'Last Year', purchases: 22000, salaries: 14000 },
            ]
        }
        // Monthly
        return [
            { date: 'Jan', purchases: 2000, salaries: 1200 },
            { date: 'Feb', purchases: 1800, salaries: 1100 },
            { date: 'Mar', purchases: 2200, salaries: 1300 },
            { date: 'Apr', purchases: 2500, salaries: 1500 },
            { date: 'May', purchases: 2300, salaries: 1400 },
            { date: 'Jun', purchases: 2800, salaries: 1600 },
            { date: 'Jul', purchases: totalPurchasesPaid, salaries: totalSalariesPaid },
        ]
    };

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const data = getFormattedData(period);
    
    const purchaseChartData = data.map(d => ({ name: d.date, cost: d.purchases }));
    const salaryChartData = data.map(d => ({ name: d.date, salary: d.salaries }));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline">Expense Tracking</CardTitle>
                            <CardDescription>Visualize expenditures on purchases and salaries.</CardDescription>
                        </div>
                        <div className="w-full sm:w-auto">
                            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Costs</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={purchaseChartConfig} className="h-[250px] w-full">
                                <BarChart data={purchaseChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Salary Costs</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={salaryChartConfig} className="h-[250px] w-full">
                                <LineChart data={salaryChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line type="monotone" dataKey="salary" stroke="var(--color-salary)" strokeWidth={2} />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}
