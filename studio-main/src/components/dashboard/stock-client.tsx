"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStock, useUpdateStock } from '@/lib/hooks/useApi';
import BottleFlowApiService from '@/lib/api-adapter';
import type { Stock } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const stockMovementSchema = z.object({
  productId: z.string({ required_error: "Please select a product." }),
  movementType: z.enum(['raw_out', 'washed_out'], { required_error: "Please select a movement type." }),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number."),
  pricePerUnit: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number with up to 2 decimal places."),
  customerName: z.string().min(2, "Customer name must be at least 2 characters."),
  date: z.date(),
  notes: z.string().optional(),
});

function StockMovementForm({ closeDialog, stockData }: { closeDialog: () => void; stockData: Stock[] }) {
  const { toast } = useToast();
  const { updateStock, loading: updateLoading } = useUpdateStock();
  const form = useForm<z.infer<typeof stockMovementSchema>>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      productId: '',
      movementType: undefined, // Use undefined for select to allow placeholder to show
      quantity: 0,
      pricePerUnit: '',
      customerName: '',
      date: new Date(),
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof stockMovementSchema>) => {
    try {
      // Map form data to the expected API format
      const payload = {
        product: data.productId,
        sale_type: data.movementType === 'raw_out' ? 'raw' : 'washed',
        quantity: data.quantity,
        price_per_unit: data.pricePerUnit,
        customer_name: data.customerName,
        date: data.date.toISOString(), // Format date as required by the API
        notes: data.notes,
      };

      const success = await updateStock({
        productId: data.productId,
        type: data.movementType === 'raw_out' ? 'sell_raw' : 'sell_washed',
        quantity: data.quantity,
      });

      if (success) {
        const product = stockData.find(s => s.productId === data.productId);
        toast({
          title: "Stock Movement Recorded",
          description: `Recorded outflow of ${data.quantity} units of ${product?.productName}.`,
        });
        BottleFlowApiService.addAuditLog({
          user: 'manager',
          action: 'STOCK_MOVEMENT',
          details: `Stock out: ${data.quantity} x ${product?.productName} (${data.movementType})`,
        });
        closeDialog();
      } else {
        toast({
          variant: 'destructive',
          title: "Insufficient Stock",
          description: "Not enough stock available for this movement.",
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to record stock movement. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="productId" render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
              <SelectContent>{stockData.map(p => <SelectItem key={p.productId} value={p.productId}>{p.productName}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="movementType" render={({ field }) => (
          <FormItem>
            <FormLabel>Movement Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="raw_out">Sold (Raw)</SelectItem>
                <SelectItem value="washed_out">Sold (Washed)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="quantity" render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="pricePerUnit" render={({ field }) => (
          <FormItem>
            <FormLabel>Price per Unit</FormLabel>
            <FormControl><Input type="text" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="customerName" render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name</FormLabel>
            <FormControl><Input type="text" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
         <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl><Input type="date" {...field} value={field.value ? field.value.toISOString().split('T')[0] : ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Input type="text" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
            <Button type="submit" disabled={updateLoading}>
              {updateLoading ? 'Recording...' : 'Record Movement'}
            </Button>
        </div>
      </form>
    </Form>
  )
}


export function StockClient() {
  const { data: stockData, loading, error, refetch } = useStock();
  const [period, setPeriod] = useState<Period>('daily');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const stock = stockData || [];

  const filteredStock = (data: Stock[], filterPeriod: Period) => {
    // This is a mock filter. In a real app, you'd filter based on dates.
    return data;
  }

  const currentStock = filteredStock(stock, period);
  
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

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Stock Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getAvailableRaw = (item: Stock) => item.purchased - item.washed - item.soldRaw;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                  <CardTitle className="font-headline">Stock Overview</CardTitle>
                  <CardDescription>Stock flow for all bottle types based on selected period.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
                 <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Record Sale</Button>
                </DialogTrigger>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              {stock.map(item => (
                <TabsTrigger key={item.productId} value={item.productId}>{item.productName}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Purchased</TableHead>
                      <TableHead className="text-right">Washed</TableHead>
                      <TableHead className="text-right">Sold (Raw)</TableHead>
                      <TableHead className="text-right">Sold (Washed)</TableHead>
                      <TableHead className="text-right">Avail. (Raw)</TableHead>
                      <TableHead className="text-right">Avail. (Washed)</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {currentStock.map((item) => {
                          const availableRaw = getAvailableRaw(item);
                          return (
                          <TableRow key={item.productId}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-right">{item.purchased.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{item.washed.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-destructive">{item.soldRaw.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-destructive">{item.soldWashed.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-semibold">{availableRaw.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-semibold">{item.balance.toLocaleString()}</TableCell>
                          </TableRow>
                          );
                      })}
                  </TableBody>
              </Table>
            </TabsContent>
            
            {currentStock.map(item => {
              const availableRaw = getAvailableRaw(item);
              return (
                <TabsContent key={item.productId} value={item.productId} className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader><CardTitle>Purchased</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{item.purchased.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Washed</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{item.washed.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Sold (Raw)</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-destructive">{item.soldRaw.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Sold (Washed)</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-destructive">{item.soldWashed.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Available (Raw)</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{availableRaw.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Available (Washed)</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold">{item.balance.toLocaleString()}</p></CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Record Stock Movement</DialogTitle>
          <DialogDescription>
            Record an outflow of stock, for example, a sale.
          </DialogDescription>
        </DialogHeader>
        <StockMovementForm closeDialog={() => setIsDialogOpen(false)} stockData={stock} />
      </DialogContent>
    </Dialog>
  );
}
