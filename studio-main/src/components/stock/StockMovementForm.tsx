"use client";

import React, { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  productId: z.string().min(1, {
    message: "Product ID is required.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  type: z.enum(["IN", "OUT"]),
  notes: z.string().optional(),
});

type StockMovementFormValues = z.infer<typeof formSchema>;

const StockMovementForm = () => {
  const [productId, setProductId] = useState('');
  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      type: "IN",
      notes: "",
    },
  });

  async function onSubmit(values: StockMovementFormValues) {
    console.log("Form values:", values);
    try {
      const response = await fetch("http://localhost:8000/api/stock/sell/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed, e.g., "Authorization": `Bearer ${yourAccessToken}`
        },
        body: JSON.stringify({
          product: values.productId,
          sale_type: values.type === "OUT" ? "washed" : "raw", // Assuming "OUT" means selling washed, "IN" means raw
          quantity: values.quantity,
          price_per_unit: "0.00", // Placeholder, as it's not in the form
          customer_name: "Test Customer", // Placeholder
          date: new Date().toISOString().split('T')[0], // Current date
          notes: values.notes,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("API Success:", data);
        alert("Stock movement recorded successfully!");
      } else {
        console.error("API Error:", data);
        alert(`Error: ${data.detail || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Network or unexpected error:", error);
      alert("An unexpected error occurred.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product ID</FormLabel>
              <FormControl>
                <Input placeholder="Product ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Quantity"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IN">IN</SelectItem>
                  <SelectItem value="OUT">OUT</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update Stock</Button>
      </form>
    </Form>
  );
};

export default StockMovementForm;
