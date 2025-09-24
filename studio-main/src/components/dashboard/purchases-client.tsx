"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';

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
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { mockProducts, mockPurchases, addAuditLog, updateStock } from '@/lib/data';
import type { Purchase, PurchaseItem } from '@/lib/types';
import { purchaseSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


function PurchaseForm({ onSave, closeDialog }: { onSave: (data: Purchase) => void, closeDialog: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1 }],
      amountPaid: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: 'items',
  });

  const amountPaid = useWatch({
    control: form.control,
    name: 'amountPaid',
  });

  const totalCost = watchedItems.reduce((acc, item) => {
    const product = mockProducts.find(p => p.id === item.productId);
    const quantity = Number(item.quantity) || 0;
    const price = product?.purchasePrice || 0;
    return acc + (quantity * price);
  }, 0);

  const balance = totalCost - amountPaid;

  const onSubmit = (data: z.infer<typeof purchaseSchema>) => {
    const purchaseItems: PurchaseItem[] = data.items.map(item => {
        const product = mockProducts.find(p => p.id === item.productId)!;
        return {
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            cost: item.quantity * product.purchasePrice,
        }
    });

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      items: purchaseItems,
      totalCost,
      amountPaid: data.amountPaid,
      balance: totalCost - data.amountPaid,
      date: new Date().toISOString().split('T')[0],
    };

    onSave(newPurchase);
    toast({ title: "Purchase Recorded", description: `A new purchase of KES ${totalCost.toFixed(2)} was recorded.` });
    closeDialog();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <FormLabel>Purchased Items</FormLabel>
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                    <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {mockProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                        <FormItem className="w-24">
                            <FormControl><Input type="number" placeholder="Qty" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1 })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
        
        <Separator />

        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="amountPaid" render={({ field }) => (
            <FormItem>
                <FormLabel>Amount Paid</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>

        <Card className="bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between font-medium">
                <span>Total Cost</span>
                <span>KES {totalCost.toFixed(2)}</span>
            </div>
             <div className="flex justify-between font-medium">
                <span>Amount Paid</span>
                <span>KES {Number(amountPaid || 0).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <span>Balance Due</span>
                <span className={cn(balance > 0 ? "text-destructive" : "text-primary")}>
                    KES {balance.toFixed(2)}
                </span>
            </div>
        </Card>

        <DialogFooter>
          <Button type="submit">Record Purchase</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function PurchasesClient() {
  const [_, setTick] = useState(0); // Used to force re-renders
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t+1), 500); // Poll for data changes
    return () => clearInterval(interval);
  });

  const handleSavePurchase = (purchaseData: Purchase) => {
    mockPurchases.unshift(purchaseData);
    purchaseData.items.forEach(item => {
        updateStock({
            productId: item.productId,
            type: 'purchase',
            quantity: item.quantity
        });
    });
    const itemsSummary = purchaseData.items.map(i => `${i.quantity} x ${i.productName}`).join(', ');
    addAuditLog({
        user: 'manager',
        action: 'CREATE_PURCHASE',
        details: `Recorded purchase: ${itemsSummary}`
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Bottle Purchases</CardTitle>
              <CardDescription>Record and view all incoming bottle stock.</CardDescription>
            </div>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Record Purchase</Button>
            </DialogTrigger>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    {purchase.items.map(item => (
                        <div key={item.productId}>{item.quantity} x {item.productName}</div>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">KES {purchase.totalCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">KES {purchase.amountPaid.toFixed(2)}</TableCell>
                  <TableCell className={cn("text-right font-semibold", purchase.balance > 0 && "text-destructive")}>
                    KES {purchase.balance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Record New Purchase</DialogTitle>
          <DialogDescription>Add items, quantities, and payment details for this transaction.</DialogDescription>
        </DialogHeader>
        <PurchaseForm onSave={handleSavePurchase} closeDialog={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}