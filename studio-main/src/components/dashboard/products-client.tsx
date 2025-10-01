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
import { apiClient, type Product as ApiProduct, type CreateProductData } from '@/lib/api';
import type { Product } from '@/lib/types';
import { productSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

function ProductForm({ product, onSave, closeDialog, isSubmitting }: { product?: Product, onSave: (data: Product) => Promise<void>, closeDialog: () => void, isSubmitting: boolean }) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product || { name: '', purchase_price: 0, wash_price: 0 },
  });

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    await onSave({ ...product, ...data, id: product?.id || `prod-${Date.now()}` });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="product-name">Product Name</FormLabel>
            <FormControl><Input {...field} id="product-name" placeholder="e.g., 500ml Plastic Bottle" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="purchase_price" render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="purchase-price">Purchase Price (KES)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  id="purchase-price"
                  placeholder="0.00"
                  onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="wash_price" render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="wash-price">Wash Price (KES)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  id="wash-price"
                  placeholder="0.00"
                  onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {product ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ProductsClient() {
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setUserRole(localStorage.getItem('userRole'));
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts();
      if (response.success && response.data) {
        // Convert API product format to frontend format
        const convertedProducts: Product[] = response.data.map((apiProduct: ApiProduct) => ({
          id: apiProduct.id,
          name: apiProduct.name,
          purchase_price: parseFloat(apiProduct.purchase_price),
          wash_price: parseFloat(apiProduct.wash_price),
        }));
        setProducts(convertedProducts);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to load products',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    const isEditing = !!editingProduct;
    setIsSubmitting(true);
    
    try {
      // Convert frontend format to API format
      const apiProductData: CreateProductData = {
        name: productData.name,
        purchase_price: productData.purchase_price.toString(),
        wash_price: productData.wash_price.toString(),
      };

      let response;
      if (isEditing && editingProduct) {
        response = await apiClient.updateProduct(editingProduct.id, apiProductData);
      } else {
        response = await apiClient.createProduct(apiProductData);
      }

      if (response.success && response.data) {
        toast({ 
          title: `Product ${isEditing ? 'Updated' : 'Added'}`, 
          description: `Product ${productData.name} has been successfully ${isEditing ? 'updated' : 'added'}.`
        });
        
        // Reload products list
        await loadProducts();
        
        setIsDialogOpen(false);
        setEditingProduct(undefined);
      } else {
        toast({
          title: 'Error',
          description: response.error || `Failed to ${isEditing ? 'update' : 'create'} product`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} product`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      const response = await apiClient.deleteProduct(productId);
      
      if (response.success) {
        toast({ 
          title: 'Product Deleted', 
          description: `Product ${product?.name || ''} has been deleted.`
        });
        
        // Reload products list
        await loadProducts();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete product',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
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
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No products found. Add your first product to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">KES {product.purchase_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">KES {product.wash_price.toFixed(2)}</TableCell>
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
                ))
              )}
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
        <ProductForm product={editingProduct} onSave={handleSaveProduct} closeDialog={() => setIsDialogOpen(false)} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}