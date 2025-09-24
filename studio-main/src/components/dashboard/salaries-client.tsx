"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockTasks, mockWorkers, getWorkerPayments } from '@/lib/data';
import type { Worker } from '@/lib/types';

type WorkerWithSalary = Worker & {
    pendingSalary: number;
};

export function SalariesClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [workersWithSalaries, setWorkersWithSalaries] = useState<WorkerWithSalary[]>([]);

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));

    const interval = setInterval(() => {
        const updatedSalaries = mockWorkers.map(worker => {
            const workerTasks = mockTasks.filter(t => t.workerId === worker.id);
            const totalNetPay = workerTasks.reduce((acc, task) => acc + task.netPay, 0);
            const payments = getWorkerPayments(worker.id);
            const amountPaid = payments.reduce((acc, p) => acc + p.amount, 0);

            return {
                ...worker,
                pendingSalary: totalNetPay - amountPaid,
            };
        });
        setWorkersWithSalaries(updatedSalaries);
    }, 1000); // Poll for changes every second to simulate real-time updates

    return () => clearInterval(interval);
  }, []);
  

  if (!isClient) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (userRole !== 'admin') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You do not have permission to view this page. This feature is for Admins only.</p>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Pending Salaries</CardTitle>
          <CardDescription>A list of all workers and their pending salaries for the current period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead className="text-right">Pending Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workersWithSalaries.map((worker) => (
                    <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell className="text-right font-bold">KES {worker.pendingSalary.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
