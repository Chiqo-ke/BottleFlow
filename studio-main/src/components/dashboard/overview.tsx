"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, Users, ShoppingBag } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useStock, useTasks, useWorkers, useWorkerPayments } from "@/lib/hooks/useApi";
import { useState, useEffect } from "react";

// Chart data will be computed from API data in the component

const chartConfig = {
    purchased: {
        label: "Purchased",
        color: "hsl(var(--chart-1))",
    },
    washed: {
        label: "Washed",
        color: "hsl(var(--chart-2))",
    },
    sold: {
        label: "Sold",
        color: "hsl(var(--accent))",
    },
} satisfies ChartConfig;


export default function Overview() {
  const [totalPendingSalary, setTotalPendingSalary] = useState(0);
  const { data: stockData, loading: stockLoading, error: stockError } = useStock();
  const { data: tasksData, loading: tasksLoading, error: tasksError } = useTasks();
  const { data: workersData, loading: workersLoading, error: workersError } = useWorkers();
  const { data: workerPayments } = useWorkerPayments(null);
  
  const totalStock = stockData?.reduce((acc, s) => acc + s.balance, 0) || 0;
  
  const chartData = stockData?.map(s => ({
    name: s.productName,
    purchased: s.purchased,
    washed: s.washed,
    sold: s.soldRaw + s.soldWashed,
  })) || [];

  useEffect(() => {
    if (workersData && tasksData && workerPayments) {
      const total = workersData.reduce((totalAcc, worker) => {
        const workerTasks = tasksData.filter(t => t.workerId === worker.id);
        const totalNetPay = workerTasks.reduce((acc, task) => acc + task.netPay, 0);
        const payments = workerPayments.filter(p => p.date); // All payments for now
        const amountPaid = payments.reduce((acc, p) => acc + p.amount, 0);
        const pendingSalary = totalNetPay - amountPaid;
        return totalAcc + pendingSalary;
      }, 0);
      setTotalPendingSalary(total);
    }
  }, [workersData, tasksData, workerPayments]);
  
  // Show loading state
  if (stockLoading || tasksLoading || workersLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (stockError || tasksError || workersError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">
                {stockError || tasksError || workersError}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Purchases
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 100.00</div>
            <p className="text-xs text-muted-foreground">
              Total cost of bottles bought today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Balance</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toLocaleString()} Units</div>
            <p className="text-xs text-muted-foreground">
              Total washed items in stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Salaries</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalPendingSalary.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              For the current pay period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workersData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total workers in the system
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Stock Flow Overview</CardTitle>
          <CardDescription>A summary of bottle movement by type.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 12) + (value.length > 12 ? '...' : '')}
                    />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="purchased" fill="var(--color-purchased)" radius={4} />
                    <Bar dataKey="washed" fill="var(--color-washed)" radius={4} />
                    <Bar dataKey="sold" fill="var(--color-sold)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
