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
import { mockStock, mockTasks, mockWorkers, getWorkerPayments } from "@/lib/data";
import { useState, useEffect } from "react";

const chartData = mockStock.map(s => ({
    name: s.productName,
    purchased: s.purchased,
    washed: s.washed,
    sold: s.soldRaw + s.soldWashed,
}));

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
  const totalStock = mockStock.reduce((acc, s) => acc + s.balance, 0);

  useEffect(() => {
    const interval = setInterval(() => {
        const total = mockWorkers.reduce((totalAcc, worker) => {
            const workerTasks = mockTasks.filter(t => t.workerId === worker.id);
            const totalNetPay = workerTasks.reduce((acc, task) => acc + task.netPay, 0);
            const payments = getWorkerPayments(worker.id);
            const amountPaid = payments.reduce((acc, p) => acc + p.amount, 0);
            const pendingSalary = totalNetPay - amountPaid;
            return totalAcc + pendingSalary;
        }, 0);
      setTotalPendingSalary(total);
    }, 1000); // Poll for changes

    return () => clearInterval(interval);
  }, []);
  
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
            <div className="text-2xl font-bold">{mockWorkers.length}</div>
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
