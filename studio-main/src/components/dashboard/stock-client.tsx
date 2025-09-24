"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockStock, addAuditLog, updateStock } from '@/lib/data';
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
});

function StockMovementForm({ closeDialog }: { closeDialog: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof stockMovementSchema>>({
    resolver: zodResolver(stockMovementSchema),
  });

  const onSubmit = (data: z.infer<typeof stockMovementSchema>) => {
    const success = updateStock({
      productId: data.productId,
      type: data.movementType === 'raw_out' ? 'sell_raw' : 'sell_washed',
      quantity: data.quantity,
    });

    if (success) {
      const product = mockStock.find(s => s.productId === data.productId);
      toast({
        title: "Stock Movement Recorded",
        description: `Recorded outflow of ${data.quantity} units of ${product?.productName}.`,
      });
      addAuditLog({
        user: 'manager',
        action: 'STOCK_MOVEMENT',
        details: `Stock out: ${data.quantity} x ${product?.productName} (${data.movementType})`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: "Insufficient Stock",
        description: "Not enough stock available for this movement.",
      });
    }
    closeDialog();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="productId" render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
              <SelectContent>{mockStock.map(p => <SelectItem key={p.productId} value={p.productId}>{p.productName}</SelectItem>)}</SelectContent>
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
        <div className="flex justify-end">
            <Button type="submit">Record Movement</Button>
        </div>
      </form>
    </Form>
  )
}


export function StockClient() {
  const [stock, setStock] = useState<Stock[]>(mockStock);
  const [period, setPeriod] = useState<Period>('daily');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Poll for changes to keep the UI up-to-date
  useState(() => {
      const interval = setInterval(() => {
          setStock([...mockStock]);
      }, 500);
      return () => clearInterval(interval);
  });

  const filteredStock = (data: Stock[], filterPeriod: Period) => {
    // This is a mock filter. In a real app, you'd filter based on dates.
    return data;
  }

  const currentStock = filteredStock(stock, period);
  
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
              {mockStock.map(item => (
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
        <StockMovementForm closeDialog={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
