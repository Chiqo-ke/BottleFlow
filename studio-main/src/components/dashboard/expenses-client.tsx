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
    const [chartData, setChartData] = useState<any>({
        daily: [],
        weekly: [],
        monthly: [],
        yearly: [],
    });
    const { data: purchases, loading: purchasesLoading } = usePurchases();
    const { data: workerPayments, loading: paymentsLoading } = useWorkerPayments(null);
    
    const loading = purchasesLoading || paymentsLoading;

    const getTotalSalariesPaid = () => {
        if (!workerPayments) return 0;
        return workerPayments.reduce((total, payment) => total + payment.amount, 0);
    }

    const getFormattedData = async (p: Period) => {
        const totalSalariesPaid = getTotalSalariesPaid();
        const totalPurchasesPaid = purchases ? purchases.reduce((acc, p) => acc + p.amountPaid, 0) : 0;

        // Helper function to fetch purchase data
        const fetchPurchaseData = async (startDate: string, endDate: string) => {
            const params = new URLSearchParams({
                summary: 'true',
                start_date: startDate,
                end_date: endDate,
            });
            const response = await fetch(`/api/purchases?${params.toString()}`);
            const data = await response.json();
            return data?.[0]?.total_cost || 0;
        };

        // Helper function to fetch salary data
        const fetchSalaryData = async (startDate: string, endDate: string) => {
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
            });
            const response = await fetch(`/api/salaries/payments?${params.toString()}`);
            const data = await response.json();
            // Aggregate salary data
            const totalSalary = data.reduce((acc: number, payment: any) => acc + parseFloat(payment.amount), 0);
            return totalSalary;
        };

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 7);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);

        // Format dates to string
        const formatDate = (date: Date): string => date.toISOString().split('T')[0];

        // Fetch data for each period
        const getDailyData = async () => {
            const [todayPurchases, yesterdayPurchases, todaySalaries, yesterdaySalaries] = await Promise.all([
                fetchPurchaseData(formatDate(today), formatDate(today)),
                fetchPurchaseData(formatDate(yesterday), formatDate(yesterday)),
                fetchSalaryData(formatDate(today), formatDate(today)),
                fetchSalaryData(formatDate(yesterday), formatDate(yesterday)),
            ]);

            return [
                {
                    name: 'Today',
                    purchases: todayPurchases,
                    salaries: todaySalaries,
                },
                {
                    name: 'Yesterday',
                    purchases: yesterdayPurchases,
                    salaries: yesterdaySalaries,
                },
            ];
        };

        const getWeeklyData = async () => {
            const [lastWeekPurchases, thisWeekPurchases, lastWeekSalaries, thisWeekSalaries] = await Promise.all([
                fetchPurchaseData(formatDate(new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)), formatDate(new Date(endOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000))),
                fetchPurchaseData(formatDate(startOfWeek), formatDate(endOfWeek)),
                fetchSalaryData(formatDate(new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)), formatDate(new Date(endOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000))),
                fetchSalaryData(formatDate(startOfWeek), formatDate(endOfWeek)),
            ]);

            return [
                {
                    name: 'Last Week',
                    purchases: lastWeekPurchases,
                    salaries: lastWeekSalaries,
                },
                {
                    name: 'This Week',
                    purchases: thisWeekPurchases,
                    salaries: thisWeekSalaries,
                },
            ];
        };

        const getMonthlyData = async () => {
            const currentYear = today.getFullYear();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyData = [];

            for (let i = 0; i < 6; i++) {
                const month = today.getMonth() - i;
                const year = currentYear;

                const firstDayOfMonth = new Date(year, month, 1);
                const lastDayOfMonth = new Date(year, month + 1, 0);

                const purchaseValue = await fetchPurchaseData(formatDate(firstDayOfMonth), formatDate(lastDayOfMonth));
                const salaryValue = await fetchSalaryData(formatDate(firstDayOfMonth), formatDate(lastDayOfMonth));

                monthlyData.push({
                    name: monthNames[month] || 'Invalid Month',
                    purchases: purchaseValue,
                    salaries: salaryValue,
                });
            }

            return monthlyData.reverse();
        };

        const getYearlyData = async () => {
            const currentYear = today.getFullYear();
            const lastYear = currentYear - 1;

            const [lastYearPurchases, thisYearPurchases, lastYearSalaries, thisYearSalaries] = await Promise.all([
                fetchPurchaseData(`${lastYear}-01-01`, `${lastYear}-12-31`),
                fetchPurchaseData(`${currentYear}-01-01`, `${currentYear}-12-31`),
                fetchSalaryData(`${lastYear}-01-01`, `${lastYear}-12-31`),
                fetchSalaryData(`${currentYear}-01-01`, `${currentYear}-12-31`),
            ]);

            return [
                {
                    name: 'Last Year',
                    purchases: lastYearPurchases,
                    salaries: lastYearSalaries,
                },
                {
                    name: 'This Year',
                    purchases: thisYearPurchases,
                    salaries: thisYearSalaries,
                },
            ];
        };

        let periodData: any[];

        switch (p) {
            case 'daily':
                periodData = await getDailyData();
                break;
            case 'weekly':
                periodData = await getWeeklyData();
                break;
            case 'monthly':
                periodData = await getMonthlyData();
                break;
            case 'yearly':
                periodData = await getYearlyData();
                break;
            default:
                periodData = [];
        }
        return periodData;
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getFormattedData(period);
            setChartData(data);
        };

        fetchData();
    }, [period]);

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
    
    const purchaseChartData = Array.isArray(chartData) ? chartData.map((d: any) => ({ name: d.name, cost: d.purchases })) : [];
    const salaryChartData = Array.isArray(chartData) ? chartData.map((d: any) => ({ name: d.name, salary: d.salaries })) : [];

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
