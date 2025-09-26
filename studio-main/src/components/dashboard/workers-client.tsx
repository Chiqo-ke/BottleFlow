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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient, type Worker as ApiWorker, type CreateWorkerData } from '@/lib/api';
import type { Worker } from '@/lib/types';
import { workerSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';


const PREDEFINED_ROLES = [
  { value: 'washer', label: 'Washer' },
  { value: 'sorter', label: 'Sorter' },
  { value: 'manager', label: 'Manager' },
  { value: 'others', label: 'Others (Specify)' },
];

function WorkerForm({ worker, onSave }: { worker?: Worker, onSave: (data: Worker) => Promise<void> }) {
  // Initialize role states based on whether the worker's role is predefined or custom
  const isCustomRole = worker?.role && !PREDEFINED_ROLES.some(r => r.value === worker.role);
  const [selectedRole, setSelectedRole] = useState(isCustomRole ? 'others' : worker?.role || '');
  const [customRole, setCustomRole] = useState(isCustomRole ? worker.role : '');
  
  const form = useForm<z.infer<typeof workerSchema>>({
    resolver: zodResolver(workerSchema),
    defaultValues: worker || { name: '', phoneNumber: '', idNumber: '', role: '', email: '' },
  });

  const onSubmit = async (data: z.infer<typeof workerSchema>) => {
    const finalRole = selectedRole === 'others' ? customRole.trim() : selectedRole;
    
    // Additional validation for custom role
    if (selectedRole === 'others' && (!customRole.trim() || customRole.trim().length < 2)) {
      form.setError('role', { 
        type: 'manual', 
        message: 'Custom role must be at least 2 characters' 
      });
      return;
    }
    
    // Additional validation for manager email
    if (finalRole === 'manager' && (!data.email || data.email.trim() === '')) {
      form.setError('email', {
        type: 'manual',
        message: 'Email is required for manager role'
      });
      return;
    }
    
    await onSave({ ...worker, ...data, role: finalRole, id: worker?.id || `worker-${Date.now()}` });
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    // Clear any existing role errors
    form.clearErrors('role');
    
    if (value !== 'others') {
      setCustomRole('');
      form.setValue('role', value);
    } else {
      form.setValue('role', customRole);
    }
  };

  const handleCustomRoleChange = (value: string) => {
    setCustomRole(value);
    form.setValue('role', value);
    // Clear role errors when typing in custom role
    if (value.trim().length >= 2) {
      form.clearErrors('role');
    }
  };

  return (
    <Form {...form}>
      <form id="worker-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="worker-name">Worker Name</FormLabel>
            <FormControl><Input {...field} id="worker-name" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="worker-phone">Phone Number</FormLabel>
            <FormControl><Input {...field} id="worker-phone" placeholder="+254700000000" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="idNumber" render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="worker-id">ID Number</FormLabel>
            <FormControl><Input {...field} id="worker-id" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="worker-role">Role</FormLabel>
            <FormControl>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger id="worker-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {selectedRole === 'others' && (
          <FormItem>
            <FormLabel htmlFor="custom-role">Custom Role</FormLabel>
            <FormControl>
              <Input 
                id="custom-role"
                value={customRole}
                onChange={(e) => handleCustomRoleChange(e.target.value)}
                placeholder="Enter custom role"
              />
            </FormControl>
            {customRole.length < 2 && customRole.length > 0 && (
              <p className="text-sm text-destructive">Role must be at least 2 characters</p>
            )}
          </FormItem>
        )}
        {(selectedRole === 'manager' || (selectedRole === 'others' && customRole.toLowerCase() === 'manager')) && (
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="manager-email">Manager Email <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input {...field} id="manager-email" type="email" placeholder="manager@company.com" /></FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">An account will be created for this manager with login credentials sent to this email.</p>
            </FormItem>
          )} />
        )}
      </form>
    </Form>
  );
}


export function WorkersClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingWorker, setEditingWorker] = useState<Worker | undefined>(undefined);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWorkers();
      if (response.success && response.data) {
        // Convert API worker format to frontend format
        const convertedWorkers: Worker[] = response.data.map((apiWorker: ApiWorker) => ({
          id: apiWorker.id,
          name: apiWorker.name,
          phoneNumber: apiWorker.phone_number,
          idNumber: apiWorker.id_number,
          role: apiWorker.role,
          email: '', // API doesn't return email for security
        }));
        setWorkers(convertedWorkers);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to load workers',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading workers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (worker?: Worker) => {
    setEditingWorker(worker);
    setIsFormOpen(true);
  }

  const handleSaveWorker = async (workerData: Worker) => {
    const isEditing = !!editingWorker;
    setIsSubmitting(true);
    
    try {
      // Convert frontend format to API format
      const apiWorkerData: CreateWorkerData = {
        name: workerData.name,
        phone_number: workerData.phoneNumber,
        id_number: workerData.idNumber,
        role: workerData.role,
        email: workerData.email,
        is_active: true
      };

      let response;
      if (isEditing && editingWorker) {
        response = await apiClient.updateWorker(editingWorker.id, apiWorkerData);
      } else {
        response = await apiClient.createWorker(apiWorkerData);
      }

      if (response.success && response.data) {
        // Show success message with account creation info
        let description = `Worker ${workerData.name} has been successfully ${isEditing ? 'updated' : 'added'}.`;
        
        if (!isEditing && workerData.role === 'manager' && workerData.email) {
          // Check if account was created (API response includes this info)
          const apiResponse = response.data as any;
          if (apiResponse.account_created) {
            description += ` Manager account created with username: ${apiResponse.username}. Login credentials sent via email.`;
          } else if (apiResponse.account_error) {
            description += ` Note: ${apiResponse.account_error}`;
          }
        }

        toast({ 
          title: `Worker ${isEditing ? 'Updated' : 'Added'}`, 
          description: description
        });
        
        // Reload workers list
        await loadWorkers();
        
        setIsFormOpen(false);
        setEditingWorker(undefined);
      } else {
        toast({
          title: 'Error',
          description: response.error || `Failed to ${isEditing ? 'update' : 'create'} worker`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} worker`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  const confirmDeleteWorker = (workerId: string) => {
    setWorkerToDelete(workerId);
    setIsAlertOpen(true);
  };

  const handleDeleteWorker = async () => {
    if (workerToDelete) {
      try {
        const worker = workers.find(w => w.id === workerToDelete);
        const response = await apiClient.deleteWorker(workerToDelete);
        
        if (response.success) {
          toast({ 
            title: 'Worker Deleted', 
            description: `Worker ${worker?.name || ''} has been deactivated.`
          });
          
          // Reload workers list
          await loadWorkers();
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to delete worker',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error deleting worker:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete worker',
          variant: 'destructive'
        });
      }
      
      setWorkerToDelete(null);
    }
    setIsAlertOpen(false);
  };
  
  if (!isClient || loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  
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
                  {workers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No workers found. Add your first worker to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell>{worker.phoneNumber}</TableCell>
                        <TableCell>{worker.idNumber}</TableCell>
                        <TableCell>
                          <span className="capitalize">{worker.role}</span>
                        </TableCell>
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
                    ))
                  )}
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
          <WorkerForm worker={editingWorker} onSave={handleSaveWorker} />
           <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" form="worker-form" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingWorker ? 'Save Changes' : 'Add Worker'}
                </Button>
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