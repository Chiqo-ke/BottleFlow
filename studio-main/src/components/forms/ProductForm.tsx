"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/types";

// Define the validation schema using Zod
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  purchase_price: z.coerce.number().min(0, "Purchase price must be a positive number."),
  wash_price: z.coerce.number().min(0, "Wash price must be a positive number."),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: Product | null;
  onSubmit: (data: ProductFormValues) => void;
  isSubmitting: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      // Initialize with number or undefined for react-hook-form
      purchase_price: initialData?.purchase_price ? Number(initialData.purchase_price) : undefined,
      wash_price: initialData?.wash_price ? Number(initialData.wash_price) : undefined,
    },
  });

  const action = initialData ? "Save Changes" : "Create";

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 500ml Plastic Bottle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5.00"
                    {...field}
                    // Handle NaN by showing an empty string
                    value={isNaN(field.value) ? "" : field.value}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, otherwise parse as float
                        field.onChange(value === "" ? "" : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wash_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wash Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2.00"
                    {...field}
                    // Handle NaN by showing an empty string
                    value={isNaN(field.value) ? "" : field.value}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, otherwise parse as float
                        field.onChange(value === "" ? "" : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : action}
        </Button>
      </form>
    </Form>
  );
};
