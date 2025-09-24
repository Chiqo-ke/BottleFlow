"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockWorkers, mockTasks, updateWorkerPayments, getWorkerPayments, addAuditLog } from '@/lib/data';
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

    useEffect(() => {
        const interval = setInterval(() => {
            const updatedSalaries = mockWorkers.map(worker => {
                const workerTasks = mockTasks.filter(t => t.workerId === worker.id);
                const totalNetPay = workerTasks.reduce((acc, task) => acc + task.netPay, 0);
                const payments = getWorkerPayments(worker.id);
                const amountPaid = payments.reduce((acc, p) => acc + p.amount, 0);

                return {
                    ...worker,
                    totalNetPay,
                    amountPaid: amountPaid,
                    pendingSalary: totalNetPay - amountPaid,
                };
            });
            setWorkersWithSalaries(updatedSalaries);
        }, 1000); // Poll for changes every second to simulate real-time updates

        return () => clearInterval(interval);
    }, []);


    const [selectedWorker, setSelectedWorker] = useState<WorkerWithSalary | null>(null);
    const { register, handleSubmit, setValue, watch, reset } = useForm<{ amount: number }>();
    const paymentAmount = watch('amount');

    const handlePayClick = (worker: WorkerWithSalary) => {
        setSelectedWorker(worker);
        setValue('amount', worker.pendingSalary);
    };

    const handlePaymentSubmit = (data: { amount: number }) => {
        if (!selectedWorker) return;

        updateWorkerPayments(selectedWorker.id, data.amount);
        
        addAuditLog({
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
    };
    
    const remainingBalance = selectedWorker ? selectedWorker.pendingSalary - (paymentAmount || 0) : 0;


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
                            {workersWithSalaries.map(worker => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">{worker.name}</TableCell>
                                    <TableCell className="text-right">KES {worker.totalNetPay.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">KES {worker.amountPaid.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">KES {worker.pendingSalary.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handlePayClick(worker)} disabled={worker.pendingSalary <= 0}>
                                            Pay
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                            <Button type="submit" disabled={(paymentAmount || 0) <= 0 || (paymentAmount || 0) > (selectedWorker?.pendingSalary || 0)}>Record Payment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
