"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { mockWorkers, addAuditLog } from '@/lib/data';
import type { Worker } from '@/lib/types';
import { workerSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { sendVerificationCode } from '@/ai/flows/send-verification-code';
import { Label } from '../ui/label';


function WorkerForm({ worker, onSave }: { worker?: Worker, onSave: (data: Worker) => void }) {
  const form = useForm<z.infer<typeof workerSchema>>({
    resolver: zodResolver(workerSchema),
    defaultValues: worker || { name: '', phoneNumber: '', idNumber: '', role: '' },
  });

  const onSubmit = (data: z.infer<typeof workerSchema>) => {
    onSave({ ...worker, ...data, id: worker?.id || `worker-${Date.now()}` });
  };

  return (
    <Form {...form}>
      <form id="worker-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Worker Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="idNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>ID Number</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. Washer, Sorter" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  );
}


export function WorkersClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [_, setTick] = useState(0); // Used to force re-renders
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingWorker, setEditingWorker] = useState<Worker | undefined>(undefined);
  const [workerToCreate, setWorkerToCreate] = useState<Worker | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [sentCode, setSentCode] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
    const interval = setInterval(() => setTick(t => t + 1), 500); // Poll for data changes
    return () => clearInterval(interval);
  }, []);

  const handleOpenForm = (worker?: Worker) => {
    setEditingWorker(worker);
    setIsFormOpen(true);
  }

  const handleInitiateSaveWorker = async (workerData: Worker) => {
    const isEditing = !!editingWorker;
    if (isEditing) {
        handleFinalizeSave(workerData, true);
    } else {
        setIsSubmitting(true);
        toast({ title: 'Sending Verification Code', description: 'Please wait...' });
        
        setWorkerToCreate(workerData);
        
        const result = await sendVerificationCode({
            recipientEmail: 'sirgeorge0254@gmail.com',
            workerName: workerData.name,
        });

        setIsSubmitting(false);

        if (result.success && result.verificationCode) {
            setSentCode(result.verificationCode);
            setIsFormOpen(false);
            setIsVerificationOpen(true);
            toast({ title: 'Verification Code Sent', description: 'Please check your email for the code.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send verification code. Please try again.' });
        }
    }
  };

  const handleVerifyAndSave = () => {
    if (verificationCode === sentCode && workerToCreate) {
        handleFinalizeSave(workerToCreate, false);
        setIsVerificationOpen(false);
        setWorkerToCreate(null);
        setSentCode(null);
        setVerificationCode('');
    } else {
        toast({ variant: 'destructive', title: 'Invalid Code', description: 'The verification code is incorrect.' });
    }
  }

  const handleFinalizeSave = (workerData: Worker, isEditing: boolean) => {
    if (isEditing) {
        const index = mockWorkers.findIndex(w => w.id === workerData.id);
        if (index !== -1) mockWorkers[index] = workerData;
    } else {
        mockWorkers.push(workerData);
    }

    addAuditLog({
        user: userRole || 'admin',
        action: isEditing ? 'UPDATE_WORKER' : 'CREATE_WORKER',
        details: `${isEditing ? 'Updated' : 'Added'} worker: ${workerData.name}`
    });
    toast({ title: `Worker ${isEditing ? 'Updated' : 'Added'}`, description: `Worker ${workerData.name} has been successfully ${isEditing ? 'updated' : 'added'}.`});
    setIsFormOpen(false);
    setEditingWorker(undefined);
  };

  const confirmDeleteWorker = (workerId: string) => {
    setWorkerToDelete(workerId);
    setIsAlertOpen(true);
  };

  const handleDeleteWorker = () => {
    if (workerToDelete) {
      const worker = mockWorkers.find(w => w.id === workerToDelete);
      const index = mockWorkers.findIndex(w => w.id === workerToDelete);
      if (index !== -1) mockWorkers.splice(index, 1);
      
      if(worker) {
          addAuditLog({
              user: userRole || 'admin',
              action: 'DELETE_WORKER',
              details: `Deleted worker: ${worker.name}`
          });
          toast({ title: 'Worker Deleted', description: `Worker ${worker.name} has been deleted.`});
      }
      setWorkerToDelete(null);
    }
    setIsAlertOpen(false);
  };
  
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
    <>
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditingWorker(undefined); } else { setIsFormOpen(true); }}}>
         <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Worker Management</CardTitle>
                  <CardDescription>Add, edit, or remove workers.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Worker</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.phoneNumber}</TableCell>
                      <TableCell>{worker.idNumber}</TableCell>
                      <TableCell>{worker.role}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { handleOpenForm(worker); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDeleteWorker(worker.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
            <DialogDescription>
              {editingWorker ? 'Update the details for this worker.' : 'Fill in the details for the new worker.'}
            </DialogDescription>
          </DialogHeader>
          <WorkerForm worker={editingWorker} onSave={handleInitiateSaveWorker} />
           <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" form="worker-form" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingWorker ? 'Save Changes' : 'Get Verification Code'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verification Dialog */}
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-headline">Enter Verification Code</DialogTitle>
                  <DialogDescription>A verification code has been sent to the admin email. Please enter it below to confirm worker creation.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input 
                      id="verification-code" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                  />
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsVerificationOpen(false)}>Cancel</Button>
                  <Button onClick={handleVerifyAndSave}>Verify and Create Worker</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the worker
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkerToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorker}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}