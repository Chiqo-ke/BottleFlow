"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkers, useTasks, useUpdateWorkerPayments } from '@/lib/hooks/useApi';
import BottleFlowApiService from '@/lib/api-adapter';
import type { Worker, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type WorkerWithSalary = Worker & {
    totalNetPay: number;
    amountPaid: number;
    pendingSalary: number;
};

export function SalaryPaymentsClient() {
    const { toast } = useToast();
    const [workersWithSalaries, setWorkersWithSalaries] = useState<WorkerWithSalary[]>([]);
    
    const { data: workers, loading: workersLoading } = useWorkers();
    const { data: tasks, loading: tasksLoading } = useTasks();
    const { updateWorkerPayments, loading: paymentLoading } = useUpdateWorkerPayments();
    
    const loading = workersLoading || tasksLoading;

    useEffect(() => {
        if (workers && tasks) {
            const updatedSalaries = workers.map(worker => {
                const workerTasks = tasks.filter(t => t.workerId === worker.id);
                const totalNetPay = workerTasks.reduce((acc, task) => acc + task.netPay, 0);
                // For now, we'll assume no payments have been made since we don't have payment history per worker
                const amountPaid = 0;

                return {
                    ...worker,
                    totalNetPay,
                    amountPaid: amountPaid,
                    pendingSalary: totalNetPay - amountPaid,
                };
            });
            setWorkersWithSalaries(updatedSalaries);
        }
    }, [workers, tasks]);


    const [selectedWorker, setSelectedWorker] = useState<WorkerWithSalary | null>(null);
    const { register, handleSubmit, setValue, watch, reset } = useForm<{ amount: number }>();
    const paymentAmount = watch('amount');

    const handlePayClick = (worker: WorkerWithSalary) => {
        setSelectedWorker(worker);
        setValue('amount', worker.pendingSalary);
    };

    const handlePaymentSubmit = async (data: { amount: number }) => {
        if (!selectedWorker) return;

        try {
            await updateWorkerPayments(selectedWorker.id, data.amount);
            
            BottleFlowApiService.addAuditLog({
                user: 'manager',
                action: 'MAKE_PAYMENT',
                details: `Paid KES ${data.amount.toFixed(2)} to ${selectedWorker.name}`
            });

            toast({
                title: "Payment Recorded",
                description: `Paid KES ${data.amount.toFixed(2)} to ${selectedWorker.name}.`,
            });

            setSelectedWorker(null);
            reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to record payment. Please try again.",
            });
        }
    };
    
    const remainingBalance = selectedWorker ? selectedWorker.pendingSalary - (paymentAmount || 0) : 0;


    // Show loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Salary Payments</CardTitle>
                    <CardDescription>Manage and record salary payments to workers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Worker</TableHead>
                                <TableHead className="text-right">Total Earned</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                                <TableHead className="text-right">Pending Salary</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workersWithSalaries.length > 0 ? (
                                workersWithSalaries.map(worker => (
                                    <TableRow key={worker.id}>
                                        <TableCell className="font-medium">{worker.name}</TableCell>
                                        <TableCell className="text-right">KES {worker.totalNetPay.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">KES {worker.amountPaid.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold">KES {worker.pendingSalary.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handlePayClick(worker)} disabled={worker.pendingSalary <= 0 || paymentLoading}>
                                                {paymentLoading ? 'Processing...' : 'Pay'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        No workers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedWorker} onOpenChange={() => setSelectedWorker(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Pay Worker: {selectedWorker?.name}</DialogTitle>
                        <DialogDescription>Record a payment for this worker.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handlePaymentSubmit)}>
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-muted rounded-md space-y-2">
                               <div className="flex justify-between font-medium">
                                    <span>Total Pending Salary:</span>
                                    <span className="font-bold">KES {selectedWorker?.pendingSalary.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Payment Amount:</span>
                                    <span>KES {Number(paymentAmount || 0).toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between text-lg font-bold">
                                    <span>Remaining Balance:</span>
                                    <span>KES {remainingBalance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount to Pay</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    max={selectedWorker?.pendingSalary}
                                    {...register('amount', { valueAsNumber: true, max: selectedWorker?.pendingSalary, min: 0.01 })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                type="submit" 
                                disabled={(paymentAmount || 0) <= 0 || (paymentAmount || 0) > (selectedWorker?.pendingSalary || 0) || paymentLoading}
                            >
                                {paymentLoading ? 'Recording...' : 'Record Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
