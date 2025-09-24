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
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { mockProducts, addAuditLog } from '@/lib/data';
import type { Product } from '@/lib/types';
import { productSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

function ProductForm({ product, onSave, closeDialog }: { product?: Product, onSave: (data: Product) => void, closeDialog: () => void }) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product || { name: '', purchasePrice: 0, washPrice: 0 },
  });

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    onSave({ ...product, ...data, id: product?.id || `prod-${Date.now()}` });
    closeDialog();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="purchasePrice" render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Price</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="washPrice" render={({ field }) => (
            <FormItem>
              <FormLabel>Wash Price</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="submit">Save Product</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ProductsClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [_, setTick] = useState(0); // Used to force re-renders
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
    const interval = setInterval(() => setTick(t => t+1), 500); // Poll for data changes
    return () => clearInterval(interval);
  }, []);

  const handleSaveProduct = (productData: Product) => {
    const isEditing = !!editingProduct;
    if (isEditing) {
        const index = mockProducts.findIndex(p => p.id === productData.id);
        if (index !== -1) mockProducts[index] = productData;
    } else {
        mockProducts.push(productData);
    }

    addAuditLog({
        user: userRole || 'admin',
        action: isEditing ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
        details: `${isEditing ? 'Updated' : 'Added'} product: ${productData.name}`
    });
    toast({ title: `Product ${isEditing ? 'Updated' : 'Added'}`, description: `Product ${productData.name} has been successfully ${isEditing ? 'updated' : 'added'}.`});
  };

  const handleDeleteProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) mockProducts.splice(index, 1);
    
    if (product) {
      addAuditLog({
        user: userRole || 'admin',
        action: 'DELETE_PRODUCT',
        details: `Deleted product: ${product.name}`
      });
      toast({ title: 'Product Deleted', description: `Product ${product.name} has been deleted.`});
    }
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
    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProduct(undefined); }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Product Management</CardTitle>
              <CardDescription>Add, edit, or remove bottle types.</CardDescription>
            </div>
             <Button onClick={() => { setEditingProduct(undefined); setIsDialogOpen(true);}}><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Wash Price</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">KES {product.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">KES {product.washPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {editingProduct ? 'Update the details for this product.' : 'Fill in the details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={editingProduct} onSave={handleSaveProduct} closeDialog={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}