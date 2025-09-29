"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTasks, useWorkers, useWorkerPayments } from '@/lib/hooks/useApi';
import type { Worker } from '@/lib/types';

type WorkerWithSalary = Worker & {
    pendingSalary: number;
};

export function SalariesClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [workersWithSalaries, setWorkersWithSalaries] = useState<WorkerWithSalary[]>([]);
  
  const { data: tasks, loading: tasksLoading } = useTasks();
  const { data: workers, loading: workersLoading } = useWorkers();
  const { data: allPayments } = useWorkerPayments(null);

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
  }, []);
  
  useEffect(() => {
    if (workers && tasks && allPayments) {
      const updatedSalaries = workers.map(worker => {
        const workerTasks = tasks.filter(t => t.workerId === worker.id);
        const totalNetPay = workerTasks.reduce((acc, task) => acc + task.netPay, 0);
        // For now, we'll use a simplified calculation since we don't have worker-specific payments
        const amountPaid = 0; // This would need to be calculated from worker-specific payment history

        return {
          ...worker,
          pendingSalary: totalNetPay - amountPaid,
        };
      });
      setWorkersWithSalaries(updatedSalaries);
    }
  }, [workers, tasks, allPayments]);
  

  if (!isClient || tasksLoading || workersLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

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
              {workersWithSalaries.length > 0 ? (
                workersWithSalaries.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell className="text-right font-bold">KES {worker.pendingSalary.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                    No workers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
