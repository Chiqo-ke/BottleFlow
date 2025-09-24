"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Edit } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockProducts, mockTasks, mockWorkers, addAuditLog, updateStock } from '@/lib/data';
import type { Task, Worker } from '@/lib/types';
import { taskSchema, dailySalarySchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function TaskForm({ onSave, closeDialog }: { onSave: (data: Task) => void, closeDialog: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    const product = mockProducts.find(p => p.id === data.productId);
    const worker = mockWorkers.find(w => w.id === data.workerId);
    if (!product || !worker) return;

    const success = updateStock({
      productId: product.id,
      type: 'assign_wash',
      quantity: data.assignedQuantity,
    });

    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Raw Stock',
        description: `Not enough raw ${product.name} available to assign.`,
      });
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      workerId: worker.id,
      workerName: worker.name,
      assignedQuantity: data.assignedQuantity,
      washedQuantity: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      salary: 0,
      deduction: 0,
      netPay: 0,
    };

    onSave(newTask);
    toast({ title: 'Task Assigned', description: `Assigned ${data.assignedQuantity} ${product.name} to ${worker.name}.` });
    closeDialog();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="workerId" render={({ field }) => (
          <FormItem>
            <FormLabel>Worker</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a worker" /></SelectTrigger></FormControl>
              <SelectContent>{mockWorkers.filter(w => w.role === 'Washer').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="productId" render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a bottle type" /></SelectTrigger></FormControl>
              <SelectContent>{mockProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assignedQuantity" render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity to Assign</FormLabel>
            <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="submit">Assign Task</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function DailySalaryForm({ worker, onSave, closeDialog }: { worker: Worker, onSave: (workerId: string, salary: number) => void, closeDialog: () => void }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof dailySalarySchema>>({
        resolver: zodResolver(dailySalarySchema),
        defaultValues: { amount: 0 },
    });

    const onSubmit = (data: z.infer<typeof dailySalarySchema>) => {
        onSave(worker.id, data.amount);
        toast({ title: 'Salary Added', description: `Added KES ${data.amount} salary for ${worker.name}.` });
        closeDialog();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Daily Salary Amount</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit">Add Salary</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


export function TasksClient() {
  const [_, setTick] = useState(0); // Used to force re-renders
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingDailySalaryWorker, setEditingDailySalaryWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t+1), 500); // Poll for data changes
    return () => clearInterval(interval);
  });

  const handleSaveTask = (taskData: Task) => {
    mockTasks.unshift(taskData);
    addAuditLog({
        user: 'manager',
        action: 'CREATE_TASK',
        details: `Assigned task to ${taskData.workerName}: ${taskData.assignedQuantity} x ${taskData.productName}`
    });
  };
  
  const handleAddDailySalary = (workerId: string, salary: number) => {
    const worker = mockWorkers.find(w => w.id === workerId);
    if (!worker) return;

    const newTask: Task = {
        id: `task-daily-${Date.now()}`,
        workerId: worker.id,
        workerName: worker.name,
        productId: '',
        productName: 'Daily Salary',
        assignedQuantity: 0,
        washedQuantity: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        salary: salary,
        deduction: 0,
        netPay: salary,
    };

    mockTasks.unshift(newTask);
    addAuditLog({
        user: 'manager',
        action: 'ADD_DAILY_SALARY',
        details: `Added daily salary for ${worker.name}: KES ${salary}`
    });
    setEditingDailySalaryWorker(null);
  };

  const handleUpdateWashed = (taskId: string, newWashed: number) => {
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = mockTasks[taskIndex];
    
    const product = mockProducts.find(p => p.id === task.productId);
    if (!product) return;

    const washedQuantity = Math.min(task.assignedQuantity, newWashed);
    const quantityChange = washedQuantity - task.washedQuantity;
    const status: Task['status'] = washedQuantity === task.assignedQuantity ? 'Completed' : (washedQuantity > 0 ? 'In Progress' : 'Pending');
    
    const salary = washedQuantity * product.washPrice;
    const unwashed = task.assignedQuantity - washedQuantity;
    const deduction = unwashed * product.purchasePrice; 
    const netPay = salary - deduction;

    if (quantityChange > 0) {
        updateStock({
            productId: product.id,
            type: 'complete_wash',
            quantity: quantityChange,
        });

        addAuditLog({
            user: 'manager',
            action: 'UPDATE_TASK',
            details: `Updated task for ${task.workerName}: Washed quantity for ${task.productName} changed from ${task.washedQuantity} to ${washedQuantity}`
        });
    }

    mockTasks[taskIndex] = { ...task, washedQuantity, status, salary, deduction, netPay };
    setEditingTask(null);
  };
  
  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };
  
  const washers = mockWorkers.filter(w => w.role === 'Washer');
  const others = mockWorkers.filter(w => w.role !== 'Washer');

  return (
    <>
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <Tabs defaultValue="washers">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline">Worker Tasks</CardTitle>
                        <CardDescription>Assign and track worker tasks and salaries.</CardDescription>
                    </div>
                     <TabsList>
                        <TabsTrigger value="washers">Washers</TabsTrigger>
                        <TabsTrigger value="others">Others</TabsTrigger>
                    </TabsList>
                </div>
            </CardHeader>
            <CardContent>
                <TabsContent value="washers">
                    <Card>
                        <CardHeader>
                             <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Washer Tasks</CardTitle>
                                    <CardDescription>Assign and track bottle washing tasks.</CardDescription>
                                </div>
                                <DialogTrigger asChild>
                                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Assign Task</Button>
                                </DialogTrigger>
                             </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Worker</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead className="text-right">Assigned</TableHead>
                                  <TableHead className="text-right">Washed</TableHead>
                                  <TableHead className="text-right">Less Bottles</TableHead>
                                  <TableHead className="text-right">Salary Earned</TableHead>
                                  <TableHead className="text-right">Deduction</TableHead>
                                  <TableHead className="text-right">Net Pay</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {mockTasks.filter(t => t.productId !== '').map((task) => (
                                  <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.workerName}</TableCell>
                                    <TableCell>{task.productName}</TableCell>
                                    <TableCell className="text-right">{task.assignedQuantity}</TableCell>
                                    <TableCell className="text-right">{task.washedQuantity}</TableCell>
                                    <TableCell className="text-right text-destructive">{task.assignedQuantity - task.washedQuantity}</TableCell>
                                    <TableCell className="text-right">KES {task.salary.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-destructive">KES {task.deduction.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">KES {task.netPay.toFixed(2)}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(task.status)}>{task.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}><Edit className="h-4 w-4" /></Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="others">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Other Workers</CardTitle>
                            <CardDescription>Manage daily salaries for non-washer roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {others.map(worker => (
                                        <TableRow key={worker.id}>
                                            <TableCell className="font-medium">{worker.name}</TableCell>
                                            <TableCell>{worker.role}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => setEditingDailySalaryWorker(worker)}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Daily Salary
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </CardContent>
        </Tabs>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Assign New Task</DialogTitle>
            <DialogDescription>Assign a batch of bottles to a worker for washing.</DialogDescription>
          </DialogHeader>
          <TaskForm onSave={handleSaveTask} closeDialog={() => setIsAssignDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Update Washed Quantity</DialogTitle>
            <DialogDescription>For {editingTask?.workerName} - {editingTask?.productName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const newWashed = parseInt((e.currentTarget.elements.namedItem('quantity') as HTMLInputElement).value);
            if (editingTask) handleUpdateWashed(editingTask.id, newWashed);
          }} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">Washed Quantity</label>
              <Input id="quantity" type="number" defaultValue={editingTask?.washedQuantity} max={editingTask?.assignedQuantity} min="0" />
            </div>
            <DialogFooter>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!editingDailySalaryWorker} onOpenChange={(open) => !open && setEditingDailySalaryWorker(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline">Add Daily Salary for {editingDailySalaryWorker?.name}</DialogTitle>
                <DialogDescription>Enter the salary amount for today's work.</DialogDescription>
            </DialogHeader>
            {editingDailySalaryWorker && <DailySalaryForm worker={editingDailySalaryWorker} onSave={handleAddDailySalary} closeDialog={() => setEditingDailySalaryWorker(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}